const { Order, Merchant } = require('../models');
const logger = require('../utils/logger');
const stripeService = require('../services/stripe.service');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// @route   POST /api/payments/create-intent
// @desc    Create Stripe Payment Intent
// @access  Public/Private
exports.createPaymentIntent = async (req, res) => {
  try {
    const { order_id } = req.body;

    if (!order_id) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'order_id is required'
      });
    }

    const order = await Order.findByPk(order_id);

    if (!order) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Order not found'
      });
    }

    // Check if user has permission to pay this order
    if (req.userId && order.customer_id && order.customer_id !== req.userId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to pay this order'
      });
    }

    const result = await stripeService.createPaymentIntent(order_id);

    res.json({
      message: 'Payment intent created successfully',
      ...result
    });

  } catch (error) {
    logger.error('Create payment intent error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: error.message || 'Failed to create payment intent'
    });
  }
};

// @route   POST /api/payments/confirm
// @desc    Confirm payment (client-side confirms with Stripe.js, this is for verification)
// @access  Public
exports.confirmPayment = async (req, res) => {
  try {
    const { payment_intent_id } = req.body;

    if (!payment_intent_id) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'payment_intent_id is required'
      });
    }

    const result = await stripeService.confirmPaymentIntent(payment_intent_id);

    res.json({
      message: 'Payment retrieved successfully',
      ...result
    });

  } catch (error) {
    logger.error('Confirm payment error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to confirm payment'
    });
  }
};

// @route   POST /api/payments/webhook
// @desc    Stripe webhook handler
// @access  Public (Stripe)
exports.handleWebhook = async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'];

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      logger.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        const io = req.app.get('io');
        await stripeService.handlePaymentSuccess(paymentIntent, io);
        logger.info(`Payment succeeded: ${paymentIntent.id}`);
        break;

      case 'payment_intent.payment_failed':
        const failedPaymentIntent = event.data.object;
        await stripeService.handlePaymentFailed(failedPaymentIntent);
        logger.warn(`Payment failed: ${failedPaymentIntent.id}`);
        break;

      case 'charge.refunded':
        const refund = event.data.object;
        logger.info(`Refund processed: ${refund.id}`);
        break;

      default:
        logger.debug(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });

  } catch (error) {
    logger.error('Webhook handler error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to handle webhook'
    });
  }
};

// @route   GET /api/payments/:orderId/status
// @desc    Get payment status for order
// @access  Private
exports.getPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findByPk(orderId);

    if (!order) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Order not found'
      });
    }

    // Check permission
    const isCustomer = order.customer_id === req.userId;
    const isMerchantOwner = await Merchant.findOne({
      where: { id: order.merchant_id, owner_id: req.userId }
    });
    const isAdmin = ['super_admin', 'admin_ops', 'finance'].includes(req.userRole);

    if (!isCustomer && !isMerchantOwner && !isAdmin) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to view this payment'
      });
    }

    if (!order.payment_intent_id) {
      return res.json({
        payment_status: order.payment_status,
        payment_method: order.payment_method,
        paid_at: order.paid_at,
        message: 'No payment intent found (cash payment or pending)'
      });
    }

    const stripeStatus = await stripeService.getPaymentStatus(order.payment_intent_id);

    res.json({
      order_id: order.id,
      order_number: order.order_number,
      payment_status: order.payment_status,
      payment_method: order.payment_method,
      paid_at: order.paid_at,
      stripe_status: stripeStatus
    });

  } catch (error) {
    logger.error('Get payment status error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to get payment status'
    });
  }
};

// @route   POST /api/payments/:orderId/refund
// @desc    Refund payment
// @access  Private (merchant owner or admin)
exports.refundPayment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { amount, reason } = req.body;

    const order = await Order.findByPk(orderId, {
      include: [{ model: Merchant, as: 'merchant' }]
    });

    if (!order) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Order not found'
      });
    }

    // Check permission
    const isMerchantOwner = order.merchant.owner_id === req.userId;
    const isAdmin = ['super_admin', 'admin_ops', 'finance'].includes(req.userRole);

    if (!isMerchantOwner && !isAdmin) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to refund this order'
      });
    }

    const result = await stripeService.createRefund(orderId, amount, reason);

    res.json({
      message: 'Refund processed successfully',
      ...result
    });

  } catch (error) {
    logger.error('Refund payment error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: error.message || 'Failed to process refund'
    });
  }
};

module.exports = exports;
