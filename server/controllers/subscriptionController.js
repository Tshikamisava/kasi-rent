import Subscription from '../models/Subscription.js';
import Payment from '../models/Payment.js';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

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

    const subscription = await Subscription.create({
      user_id,
      plan,
      amount,
      currency,
      status: 'pending',
      metadata
    });

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

    const subs = await Subscription.findAll({ where: { user_id }, order: [['created_at', 'DESC']] });
    res.json({ success: true, subscriptions: subs });
  } catch (error) {
    console.error('Get User Subscriptions Error:', error);
    res.status(500).json({ error: 'Failed to fetch subscriptions', message: error.message });
  }
};

export const getSubscriptionById = async (req, res) => {
  try {
    const { id } = req.params;
    const sub = await Subscription.findByPk(id);
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
    const sub = await Subscription.findByPk(id);
    if (!sub) return res.status(404).json({ error: 'Subscription not found' });

    Object.keys(updates).forEach((k) => { sub[k] = updates[k]; });
    await sub.save();

    res.json({ success: true, subscription: sub });
  } catch (error) {
    console.error('Update Subscription Error:', error);
    res.status(500).json({ error: 'Failed to update subscription', message: error.message });
  }
};

/**
 * Create subscription and initialize checkout with Paystack (returns authorization_url)
 */
export const checkoutSubscription = async (req, res) => {
  try {
    const user_id = req.user?.id;
    const { plan, amount, currency = 'ZAR', email, callback_url, metadata = {} } = req.body;

    if (!plan || !amount) {
      return res.status(400).json({ error: 'Plan and amount are required' });
    }

    // Create subscription record pending
    const subscription = await Subscription.create({
      user_id,
      plan,
      amount,
      currency,
      status: 'pending',
      metadata
    });

    // Create payment record tied to this subscription
    const payment = await Payment.create({
      user_id: user_id,
      property_id: null,
      amount: amount,
      currency: currency,
      payment_type: 'subscription',
      payment_method: 'card',
      status: 'pending',
      customer_email: email || req.user?.email || null,
      description: `Subscription: ${plan}`,
      metadata: { ...metadata, subscription_id: subscription.id }
    });

    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!paystackSecretKey) {
      // No gateway configured - return subscription and payment info for manual flow
      return res.json({
        success: true,
        message: 'Payment gateway not configured. Mock checkout returned.',
        subscription,
        payment
      });
    }

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
      return res.status(500).json({ error: 'Failed to initialize payment', details: err.response?.data || err.message });
    }
  } catch (error) {
    console.error('checkoutSubscription error:', error);
    res.status(500).json({ error: 'Failed to create subscription checkout', message: error.message });
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

    // If payment succeeded, activate subscription
    if (paystackData && paystackData.status === 'success') {
      subscription.status = 'active';
      subscription.provider_reference = reference;
      subscription.metadata = { ...subscription.metadata, paystack: paystackData };
      await subscription.save();
      return subscription;
    }

    // Otherwise mark as past_due/failed
    subscription.status = 'past_due';
    subscription.metadata = { ...subscription.metadata, paystack: paystackData };
    await subscription.save();
    return subscription;
  } catch (error) {
    console.error('markSubscriptionFromPayment error:', error);
    return null;
  }
};
