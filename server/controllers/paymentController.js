import Payment from '../models/Payment.js';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Initialize Payment - Creates payment intent with Paystack
 */
export const initializePayment = async (req, res) => {
  try {
    const { amount, email, property_id, payment_type, description, metadata } = req.body;
    const user_id = req.user?.id || req.body.user_id;

    // Validation
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Convert amount to kobo (Paystack uses smallest currency unit)
    // For ZAR, we use cents (multiply by 100)
    const amountInCents = Math.round(parseFloat(amount) * 100);

    // Create payment record
    const payment = await Payment.create({
      user_id: user_id,
      property_id: property_id || null,
      amount: amount,
      currency: 'ZAR',
      payment_type: payment_type || 'rent',
      payment_method: 'card',
      status: 'pending',
      customer_email: email,
      customer_name: req.body.name || null,
      customer_phone: req.body.phone || null,
      description: description || `Payment for ${payment_type || 'rent'}`,
      metadata: metadata || {}
    });

    // Initialize Paystack payment
    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!paystackSecretKey) {
      // Fallback mode - return payment record without gateway
      return res.json({
        success: true,
        payment: {
          id: payment.id,
          amount: payment.amount,
          status: payment.status,
          message: 'Payment gateway not configured. Please configure PAYSTACK_SECRET_KEY in environment variables.'
        }
      });
    }

    try {
      const paystackResponse = await axios.post(
        'https://api.paystack.co/transaction/initialize',
        {
          email: email,
          amount: amountInCents,
          currency: 'ZAR',
          reference: payment.id,
          callback_url: process.env.PAYSTACK_CALLBACK_URL || `${req.protocol}://${req.get('host')}/api/payments/verify`,
          metadata: {
            custom_fields: [
              {
                display_name: 'Payment Type',
                variable_name: 'payment_type',
                value: payment_type || 'rent'
              },
              {
                display_name: 'Property ID',
                variable_name: 'property_id',
                value: property_id || 'N/A'
              }
            ],
            ...metadata
          }
        },
        {
          headers: {
            Authorization: `Bearer ${paystackSecretKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Update payment with gateway reference
      payment.gateway_reference = paystackResponse.data.data.reference;
      payment.gateway_response = paystackResponse.data.data;
      await payment.save();

      res.json({
        success: true,
        payment: {
          id: payment.id,
          amount: payment.amount,
          status: payment.status,
          authorization_url: paystackResponse.data.data.authorization_url,
          access_code: paystackResponse.data.data.access_code,
          reference: paystackResponse.data.data.reference
        }
      });
    } catch (paystackError) {
      console.error('Paystack Error:', paystackError.response?.data || paystackError.message);
      
      payment.status = 'failed';
      payment.gateway_response = { error: paystackError.response?.data || paystackError.message };
      await payment.save();

      return res.status(500).json({
        error: 'Payment initialization failed',
        message: paystackError.response?.data?.message || 'Unable to initialize payment',
        payment_id: payment.id
      });
    }
  } catch (error) {
    console.error('Payment Initialization Error:', error);
    res.status(500).json({
      error: 'Failed to initialize payment',
      message: error.message
    });
  }
};

/**
 * Verify Payment - Verifies payment with Paystack
 */
export const verifyPayment = async (req, res) => {
  try {
    const { reference } = req.query;

    if (!reference) {
      return res.status(400).json({ error: 'Payment reference is required' });
    }

    // Find payment by reference
    const payment = await Payment.findOne({
      where: { gateway_reference: reference }
    });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    // If already verified, return existing status
    if (payment.status === 'completed') {
      return res.json({
        success: true,
        payment: {
          id: payment.id,
          amount: payment.amount,
          status: payment.status,
          message: 'Payment already verified'
        }
      });
    }

    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!paystackSecretKey) {
      return res.status(500).json({
        error: 'Payment gateway not configured'
      });
    }

    // Verify with Paystack
    try {
      const verifyResponse = await axios.get(
        `https://api.paystack.co/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${paystackSecretKey}`
          }
        }
      );

      const paystackData = verifyResponse.data.data;

      // Update payment status
      if (paystackData.status === 'success') {
        payment.status = 'completed';
        payment.gateway_response = paystackData;
        await payment.save();

        res.json({
          success: true,
          payment: {
            id: payment.id,
            amount: payment.amount,
            status: payment.status,
            paid_at: paystackData.paid_at,
            message: 'Payment verified successfully'
          }
        });
      } else {
        payment.status = 'failed';
        payment.gateway_response = paystackData;
        await payment.save();

        res.json({
          success: false,
          payment: {
            id: payment.id,
            amount: payment.amount,
            status: payment.status,
            message: 'Payment verification failed'
          }
        });
      }
    } catch (paystackError) {
      console.error('Paystack Verification Error:', paystackError.response?.data || paystackError.message);
      
      payment.status = 'failed';
      payment.gateway_response = { error: paystackError.response?.data || paystackError.message };
      await payment.save();

      return res.status(500).json({
        error: 'Payment verification failed',
        message: paystackError.response?.data?.message || 'Unable to verify payment'
      });
    }
  } catch (error) {
    console.error('Payment Verification Error:', error);
    res.status(500).json({
      error: 'Failed to verify payment',
      message: error.message
    });
  }
};

/**
 * Get User Payments
 */
export const getUserPayments = async (req, res) => {
  try {
    const user_id = req.user?.id || req.params.user_id;

    if (!user_id) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const payments = await Payment.findAll({
      where: { user_id },
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      payments: payments
    });
  } catch (error) {
    console.error('Get Payments Error:', error);
    res.status(500).json({
      error: 'Failed to fetch payments',
      message: error.message
    });
  }
};

/**
 * Get Payment by ID
 */
export const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await Payment.findByPk(id);

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json({
      success: true,
      payment: payment
    });
  } catch (error) {
    console.error('Get Payment Error:', error);
    res.status(500).json({
      error: 'Failed to fetch payment',
      message: error.message
    });
  }
};

/**
 * Webhook Handler for Paystack
 */
export const paymentWebhook = async (req, res) => {
  try {
    const hash = req.headers['x-paystack-signature'];
    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!paystackSecretKey) {
      return res.status(500).json({ error: 'Payment gateway not configured' });
    }

    // Parse raw body (already parsed as raw in server.js)
    let event;
    try {
      event = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    } catch (parseError) {
      console.error('Webhook body parse error:', parseError);
      return res.status(400).json({ error: 'Invalid webhook payload' });
    }

    // Verify webhook signature (simplified - in production, use crypto to verify)
    // For production, implement proper signature verification:
    // const crypto = require('crypto');
    // const hash = crypto.createHmac('sha512', paystackSecretKey)
    //   .update(JSON.stringify(req.body))
    //   .digest('hex');
    // if (hash !== req.headers['x-paystack-signature']) {
    //   return res.status(401).json({ error: 'Invalid signature' });
    // }

    console.log('Webhook received:', event.event);

    if (event.event === 'charge.success') {
      const reference = event.data.reference;

      const payment = await Payment.findOne({
        where: { gateway_reference: reference }
      });

      if (payment && payment.status !== 'completed') {
        payment.status = 'completed';
        payment.gateway_response = event.data;
        await payment.save();

        console.log(`Payment ${payment.id} marked as completed via webhook`);

        // Here you can trigger additional actions like:
        // - Send confirmation email
        // - Update property status
        // - Notify landlord
        // - Update user subscription
        // etc.
      }
    } else if (event.event === 'charge.failed') {
      const reference = event.data.reference;

      const payment = await Payment.findOne({
        where: { gateway_reference: reference }
      });

      if (payment && payment.status !== 'failed') {
        payment.status = 'failed';
        payment.gateway_response = event.data;
        await payment.save();

        console.log(`Payment ${payment.id} marked as failed via webhook`);
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook Error:', error);
    res.status(500).json({
      error: 'Webhook processing failed',
      message: error.message
    });
  }
};

