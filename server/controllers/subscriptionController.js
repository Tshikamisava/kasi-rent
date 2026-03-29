import Subscription from '../models/Subscription.js';
import Payment from '../models/Payment.js';
import { sequelize } from '../config/mysql.js';
import { Op } from 'sequelize';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const DEFAULT_BILLING_CYCLE_DAYS = Number(process.env.SUBSCRIPTION_BILLING_CYCLE_DAYS || 30);

const safeDate = (value) => {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return new Date();
  return date;
};

const addDays = (dateValue, days = DEFAULT_BILLING_CYCLE_DAYS) => {
  const base = safeDate(dateValue);
  const next = new Date(base);
  next.setDate(next.getDate() + Number(days || DEFAULT_BILLING_CYCLE_DAYS));
  return next;
};

const normalizeAuthorizationPayload = (paystackData = {}) => {
  const auth = paystackData.authorization || {};
  return {
    authorization_code: auth.authorization_code || null,
    reusable: Boolean(auth.reusable),
    card_type: auth.card_type || null,
    bank: auth.bank || null,
    last4: auth.last4 || null,
    exp_month: auth.exp_month || null,
    exp_year: auth.exp_year || null,
    channel: auth.channel || null,
    signature: auth.signature || null,
    customer_code: paystackData.customer?.customer_code || null,
    customer_email: paystackData.customer?.email || null,
    paid_at: paystackData.paid_at || null,
  };
};

const isSubscriptionPayment = (paymentMetadata = {}, paystackData = {}) => {
  const kind = paymentMetadata.payment_kind || paystackData?.metadata?.payment_kind;
  return String(kind || '').toLowerCase() === 'subscription' || Boolean(paymentMetadata.subscription_id || paystackData?.metadata?.subscription_id);
};

const createRecurringChargeReference = (subscriptionId) => {
  const timestamp = Date.now();
  return `sub_${subscriptionId}_${timestamp}`;
};

const chargeAuthorizedSubscription = async (subscription, { initiatedBy = 'system' } = {}) => {
  const metadata = subscription.metadata || {};
  const recurring = metadata.recurring || {};
  const authorizationCode = recurring.authorization_code;
  const customerEmail = recurring.customer_email;

  if (!authorizationCode || !customerEmail) {
    return {
      ok: false,
      reason: 'Missing reusable authorization or customer email on subscription metadata',
    };
  }

  const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!paystackSecretKey) {
    return { ok: false, reason: 'PAYSTACK_SECRET_KEY is not configured' };
  }

  const amountInCents = Math.round(parseFloat(subscription.amount) * 100);
  const reference = createRecurringChargeReference(subscription.id);

  const payment = await Payment.create({
    user_id: subscription.user_id,
    property_id: null,
    amount: subscription.amount,
    currency: subscription.currency || 'ZAR',
    payment_type: 'service_fee',
    payment_method: 'card',
    status: 'processing',
    customer_email: customerEmail,
    description: `Recurring subscription charge: ${subscription.plan}`,
    metadata: {
      subscription_id: subscription.id,
      payment_kind: 'subscription',
      initiated_by: initiatedBy,
      recurring_attempt_at: new Date().toISOString(),
    },
  });

  payment.gateway_reference = reference;
  await payment.save();

  try {
    const chargeResp = await axios.post(
      'https://api.paystack.co/transaction/charge_authorization',
      {
        authorization_code: authorizationCode,
        email: customerEmail,
        amount: amountInCents,
        currency: subscription.currency || 'ZAR',
        reference,
        metadata: {
          subscription_id: subscription.id,
          payment_kind: 'subscription',
          recurring: true,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const chargeData = chargeResp?.data?.data || {};
    const chargeStatus = String(chargeData.status || '').toLowerCase();
    const paidAt = chargeData.paid_at || new Date().toISOString();

    if (chargeStatus === 'success') {
      payment.status = 'completed';
      payment.gateway_response = chargeData;
      await payment.save();

      const nextBillingAt = addDays(paidAt, recurring.billing_cycle_days || DEFAULT_BILLING_CYCLE_DAYS);
      subscription.status = 'active';
      subscription.provider_reference = reference;
      subscription.metadata = {
        ...metadata,
        recurring: {
          ...recurring,
          next_billing_at: nextBillingAt.toISOString(),
          last_charged_at: paidAt,
          last_payment_reference: reference,
          last_charge_status: 'success',
          last_charge_response: chargeData,
        },
      };
      await subscription.save();

      return { ok: true, payment, subscription, paystack: chargeData };
    }

    // Pending/failed charge states should be reconciled by webhook, but we record immediate state too.
    payment.status = chargeStatus === 'pending' ? 'processing' : 'failed';
    payment.gateway_response = chargeData;
    await payment.save();

    subscription.status = chargeStatus === 'pending' ? 'active' : 'past_due';
    subscription.metadata = {
      ...metadata,
      recurring: {
        ...recurring,
        last_payment_reference: reference,
        last_charge_status: chargeStatus || 'unknown',
        last_charge_response: chargeData,
      },
    };
    await subscription.save();

    return {
      ok: false,
      reason: `Charge status: ${chargeStatus || 'unknown'}`,
      payment,
      subscription,
      paystack: chargeData,
    };
  } catch (error) {
    payment.status = 'failed';
    payment.gateway_response = { error: error.response?.data || error.message };
    await payment.save();

    subscription.status = 'past_due';
    subscription.metadata = {
      ...metadata,
      recurring: {
        ...recurring,
        last_charge_status: 'failed',
        last_charge_error: error.response?.data || error.message,
      },
    };
    await subscription.save();

    return {
      ok: false,
      reason: error.response?.data?.message || error.message,
      payment,
      subscription,
    };
  }
};

const getErrorMessage = (error) => {
  return (
    error?.original?.sqlMessage ||
    error?.parent?.sqlMessage ||
    error?.message ||
    ''
  );
};

const isMissingSubscriptionsTableError = (error) => {
  const message = getErrorMessage(error);
  return (
    /table\s+.*subscriptions\s+doesn't\s+exist/i.test(message) ||
    /table\s+.*subscriptions\s+does not exist/i.test(message) ||
    /unknown table\s+.*subscriptions/i.test(message) ||
    /relation\s+"?subscriptions"?\s+does not exist/i.test(message)
  );
};

const ensureSubscriptionsTableReady = async () => {
  try {
    await sequelize.getQueryInterface().describeTable('subscriptions');
    return;
  } catch (error) {
    if (!isMissingSubscriptionsTableError(error)) {
      // describeTable can throw DB-specific errors without the exact phrase;
      // still attempt a sync for resilience in dev and first-run environments.
      console.warn('describeTable(subscriptions) failed, attempting Subscription.sync(). Reason:', getErrorMessage(error));
    } else {
      console.warn('Subscriptions table missing. Running Subscription.sync()...');
    }

    await Subscription.sync({ alter: true });
  }
};

const withSubscriptionsTableReady = async (operation) => {
  await ensureSubscriptionsTableReady();

  try {
    return await operation();
  } catch (error) {
    if (!isMissingSubscriptionsTableError(error)) {
      throw error;
    }

    console.warn('Subscriptions table still missing after first attempt. Re-running Subscription.sync() and retrying operation...');
    await Subscription.sync({ alter: true });
    return await operation();
  }
};

/**
 * Create a subscription record (pending). Client should then call /api/payments/initialize
 * with metadata.subscription_id set to the returned subscription id.
 */
export const createSubscription = async (req, res) => {
  try {
    const user_id = req.user?.id;
    const { plan, amount, currency = 'ZAR', metadata = {} } = req.body;

    if (!plan || !amount) {
      return res.status(400).json({ error: 'Plan and amount are required' });
    }

    const subscription = await withSubscriptionsTableReady(() =>
      Subscription.create({
        user_id,
        plan,
        amount,
        currency,
        status: 'pending',
        metadata
      })
    );

    res.json({ success: true, subscription });
  } catch (error) {
    console.error('Create Subscription Error:', error);
    res.status(500).json({ error: 'Failed to create subscription', message: error.message });
  }
};

export const getUserSubscriptions = async (req, res) => {
  try {
    const user_id = req.user?.id || req.params.user_id;
    if (!user_id) return res.status(400).json({ error: 'User id required' });

    const subs = await withSubscriptionsTableReady(() =>
      Subscription.findAll({ where: { user_id }, order: [['created_at', 'DESC']] })
    );
    res.json({ success: true, subscriptions: subs });
  } catch (error) {
    console.error('Get User Subscriptions Error:', error);
    res.status(500).json({ error: 'Failed to fetch subscriptions', message: error.message });
  }
};

export const getSubscriptionById = async (req, res) => {
  try {
    const { id } = req.params;
    const sub = await withSubscriptionsTableReady(() => Subscription.findByPk(id));
    if (!sub) return res.status(404).json({ error: 'Subscription not found' });
    res.json({ success: true, subscription: sub });
  } catch (error) {
    console.error('Get Subscription Error:', error);
    res.status(500).json({ error: 'Failed to fetch subscription', message: error.message });
  }
};

export const updateSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const sub = await withSubscriptionsTableReady(() => Subscription.findByPk(id));
    if (!sub) return res.status(404).json({ error: 'Subscription not found' });

    Object.keys(updates).forEach((k) => { sub[k] = updates[k]; });
    await sub.save();

    res.json({ success: true, subscription: sub });
  } catch (error) {
    console.error('Update Subscription Error:', error);
    res.status(500).json({ error: 'Failed to update subscription', message: error.message });
  }
};

export const cancelSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const sub = await withSubscriptionsTableReady(() => Subscription.findByPk(id));
    if (!sub) return res.status(404).json({ error: 'Subscription not found' });

    const currentUserId = req.user?.id;
    const isAdmin = req.user?.role === 'admin';
    if (!isAdmin && String(sub.user_id) !== String(currentUserId)) {
      return res.status(403).json({ error: 'Not authorized to cancel this subscription' });
    }

    sub.status = 'cancelled';
    sub.metadata = {
      ...(sub.metadata || {}),
      cancelled_at: new Date().toISOString(),
      cancelled_by: currentUserId || null,
    };
    await sub.save();

    res.json({ success: true, message: 'Subscription cancelled', subscription: sub });
  } catch (error) {
    console.error('Cancel Subscription Error:', error);
    res.status(500).json({
      error: 'Failed to cancel subscription',
      message: error.message,
      details: error?.original?.sqlMessage || error?.parent?.sqlMessage || null,
    });
  }
};

export const reactivateSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const sub = await withSubscriptionsTableReady(() => Subscription.findByPk(id));
    if (!sub) return res.status(404).json({ error: 'Subscription not found' });

    const currentUserId = req.user?.id;
    const isAdmin = req.user?.role === 'admin';
    if (!isAdmin && String(sub.user_id) !== String(currentUserId)) {
      return res.status(403).json({ error: 'Not authorized to reactivate this subscription' });
    }

    sub.status = 'active';
    sub.metadata = {
      ...(sub.metadata || {}),
      reactivated_at: new Date().toISOString(),
      reactivated_by: currentUserId || null,
    };
    await sub.save();

    res.json({ success: true, message: 'Subscription reactivated', subscription: sub });
  } catch (error) {
    console.error('Reactivate Subscription Error:', error);
    res.status(500).json({
      error: 'Failed to reactivate subscription',
      message: error.message,
      details: error?.original?.sqlMessage || error?.parent?.sqlMessage || null,
    });
  }
};

/**
 * Create subscription and initialize checkout with Paystack (returns authorization_url)
 */
export const checkoutSubscription = async (req, res) => {
  try {
    const user_id = req.user?.id;
    const { plan, amount, currency = 'ZAR', email, callback_url, metadata = {}, billing_cycle_days = DEFAULT_BILLING_CYCLE_DAYS } = req.body;
    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!plan || !amount) {
      return res.status(400).json({ error: 'Plan and amount are required' });
    }

    if (!paystackSecretKey || !String(paystackSecretKey).trim()) {
      return res.status(503).json({
        error: 'Payment gateway not configured',
        message: 'Server is missing PAYSTACK_SECRET_KEY. Add it in server/.env and restart the API.',
      });
    }

    // Create subscription record pending
    const subscription = await withSubscriptionsTableReady(() =>
      Subscription.create({
        user_id,
        plan,
        amount,
        currency,
        status: 'pending',
        metadata: {
          ...metadata,
          recurring: {
            auto_renew: true,
            billing_cycle_days: Number(billing_cycle_days || DEFAULT_BILLING_CYCLE_DAYS),
            next_billing_at: null,
            authorization_code: null,
            reusable: false,
            customer_email: email || req.user?.email || null,
          },
        }
      })
    );

    // Create payment record tied to this subscription
    const payment = await Payment.create({
      user_id: user_id,
      property_id: null,
      amount: amount,
      currency: currency,
      // Keep this compatible with deployments where payments enum does not yet include "subscription"
      payment_type: 'service_fee',
      payment_method: 'card',
      status: 'pending',
      customer_email: email || req.user?.email || null,
      description: `Subscription: ${plan}`,
      metadata: { ...metadata, subscription_id: subscription.id, payment_kind: 'subscription' }
    });

    // Paystack expects amount in smallest currency unit
    const amountInCents = Math.round(parseFloat(amount) * 100);

    try {
      const initResp = await axios.post(
        'https://api.paystack.co/transaction/initialize',
        {
          email: email || req.user?.email,
          amount: amountInCents,
          currency,
          reference: payment.id,
          callback_url: callback_url || (req.protocol + '://' + req.get('host') + '/api/payments/verify'),
          metadata: { subscription_id: subscription.id, ...metadata }
        },
        {
          headers: {
            Authorization: `Bearer ${paystackSecretKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Update payment with gateway reference
      payment.gateway_reference = initResp.data.data.reference;
      payment.gateway_response = initResp.data.data;
      await payment.save();

      res.json({
        success: true,
        subscription,
        payment: {
          id: payment.id,
          amount: payment.amount,
          status: payment.status,
          authorization_url: initResp.data.data.authorization_url,
          access_code: initResp.data.data.access_code,
          reference: initResp.data.data.reference
        }
      });
    } catch (err) {
      console.error('Paystack init error in checkoutSubscription:', err.response?.data || err.message || err);
      payment.status = 'failed';
      payment.gateway_response = { error: err.response?.data || err.message };
      await payment.save();
      return res.status(500).json({
        error: 'Failed to initialize payment',
        message: err.response?.data?.message || err.message,
        details: err.response?.data || err.message,
      });
    }
  } catch (error) {
    console.error('checkoutSubscription error:', error);
    res.status(500).json({
      error: 'Failed to create subscription checkout',
      message: error.message,
      details: error?.original?.sqlMessage || error?.parent?.sqlMessage || null,
      code: error?.name || null,
    });
  }
};

/**
 * Helper called by payment webhook to mark subscription active/failed
 */
export const markSubscriptionFromPayment = async (reference, paystackData) => {
  try {
    // Try to find payment by gateway_reference
    const payment = await Payment.findOne({ where: { gateway_reference: reference } });
    if (!payment) return null;

    // Check metadata for subscription id
    const metadata = (payment.metadata || {}) || {};
    const subscriptionId = metadata.subscription_id || metadata.subscriptionId || (paystackData?.metadata?.subscription_id) || (paystackData?.metadata?.subscriptionId);

    if (!subscriptionId) return null;

    const subscription = await Subscription.findByPk(subscriptionId);
    if (!subscription) return null;

    const isSubscription = isSubscriptionPayment(metadata, paystackData);
    if (!isSubscription) return null;

    const recurring = subscription.metadata?.recurring || {};

    // If payment succeeded, activate subscription
    if (paystackData && paystackData.status === 'success') {
      const authData = normalizeAuthorizationPayload(paystackData);
      const billingCycleDays = Number(recurring.billing_cycle_days || DEFAULT_BILLING_CYCLE_DAYS);
      const paidAt = authData.paid_at || new Date().toISOString();
      const nextBillingAt = addDays(paidAt, billingCycleDays);

      subscription.status = 'active';
      subscription.provider_reference = reference;
      subscription.metadata = {
        ...subscription.metadata,
        paystack: paystackData,
        recurring: {
          ...recurring,
          ...authData,
          auto_renew: recurring.auto_renew !== false,
          billing_cycle_days: billingCycleDays,
          last_payment_reference: reference,
          last_charged_at: paidAt,
          next_billing_at: nextBillingAt.toISOString(),
          last_charge_status: 'success',
        },
      };
      await subscription.save();
      return subscription;
    }

    // Otherwise mark as past_due/failed
    subscription.status = 'past_due';
    subscription.metadata = {
      ...subscription.metadata,
      paystack: paystackData,
      recurring: {
        ...recurring,
        last_payment_reference: reference,
        last_charge_status: 'failed',
      },
    };
    await subscription.save();
    return subscription;
  } catch (error) {
    console.error('markSubscriptionFromPayment error:', error);
    return null;
  }
};

/**
 * Charge one active subscription immediately using saved Paystack authorization.
 */
export const chargeSubscriptionNow = async (req, res) => {
  try {
    const { id } = req.params;
    const subscription = await withSubscriptionsTableReady(() => Subscription.findByPk(id));
    if (!subscription) return res.status(404).json({ error: 'Subscription not found' });

    const currentUserId = req.user?.id;
    const isAdmin = req.user?.role === 'admin';
    if (!isAdmin && String(subscription.user_id) !== String(currentUserId)) {
      return res.status(403).json({ error: 'Not authorized to charge this subscription' });
    }

    if (subscription.status !== 'active') {
      return res.status(400).json({ error: 'Only active subscriptions can be charged' });
    }

    const result = await chargeAuthorizedSubscription(subscription, {
      initiatedBy: isAdmin ? 'admin' : 'user',
    });

    if (!result.ok) {
      return res.status(400).json({
        success: false,
        message: result.reason,
        subscription: result.subscription || subscription,
        payment: result.payment || null,
      });
    }

    res.json({
      success: true,
      message: 'Subscription charged successfully',
      subscription: result.subscription,
      payment: result.payment,
    });
  } catch (error) {
    console.error('chargeSubscriptionNow error:', error);
    res.status(500).json({ error: 'Failed to charge subscription', message: error.message });
  }
};

/**
 * Admin endpoint: process all due subscriptions (based on metadata.recurring.next_billing_at)
 */
export const processDueSubscriptions = async (req, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const now = new Date();
    const activeSubs = await withSubscriptionsTableReady(() =>
      Subscription.findAll({ where: { status: 'active', provider: 'paystack' } })
    );

    const dueSubs = activeSubs.filter((sub) => {
      const recurring = sub.metadata?.recurring || {};
      if (recurring.auto_renew === false) return false;
      if (!recurring.authorization_code || !recurring.reusable) return false;
      const nextBillingAt = recurring.next_billing_at ? new Date(recurring.next_billing_at) : null;
      if (!nextBillingAt || Number.isNaN(nextBillingAt.getTime())) return false;
      return nextBillingAt <= now;
    });

    const results = [];
    for (const sub of dueSubs) {
      const result = await chargeAuthorizedSubscription(sub, { initiatedBy: 'scheduler' });
      results.push({
        subscription_id: sub.id,
        ok: result.ok,
        reason: result.reason || null,
        payment_id: result.payment?.id || null,
      });
    }

    res.json({
      success: true,
      processed: results.length,
      total_active: activeSubs.length,
      results,
    });
  } catch (error) {
    console.error('processDueSubscriptions error:', error);
    res.status(500).json({ error: 'Failed to process due subscriptions', message: error.message });
  }
};

/**
 * Admin endpoint: remove pending mock subscriptions (created without gateway redirect)
 */
export const purgePendingMockSubscriptions = async (req, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { all = 'false', hours = '24' } = req.query;
    const allMode = String(all).toLowerCase() === 'true';
    const windowHours = Number(hours);
    const safeHours = Number.isFinite(windowHours) && windowHours > 0 ? windowHours : 24;

    const whereClause = {
      status: 'pending',
      provider: 'paystack',
      provider_reference: {
        [Op.is]: null,
      },
    };

    if (!allMode) {
      whereClause.created_at = {
        [Op.lt]: new Date(Date.now() - safeHours * 60 * 60 * 1000),
      };
    }

    const candidates = await withSubscriptionsTableReady(() =>
      Subscription.findAll({
        where: whereClause,
        order: [['created_at', 'DESC']],
      })
    );

    if (!candidates.length) {
      return res.json({
        success: true,
        deleted: 0,
        message: allMode
          ? 'No pending mock subscriptions found.'
          : `No pending mock subscriptions found older than ${safeHours} hour(s).`,
      });
    }

    const ids = candidates.map((s) => s.id);
    const deleted = await Subscription.destroy({ where: { id: ids } });

    return res.json({
      success: true,
      deleted,
      ids,
      message: `Deleted ${deleted} pending mock subscription(s).`,
    });
  } catch (error) {
    console.error('purgePendingMockSubscriptions error:', error);
    return res.status(500).json({ error: 'Failed to purge mock subscriptions', message: error.message });
  }
};
