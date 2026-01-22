const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const logger = require('../utils/logger');
const { Order } = require('../models');

/**
 * Create Stripe Payment Intent
 */
const createPaymentIntent = async (orderId) => {
  try {
    const order = await Order.findByPk(orderId);

    if (!order) {
      throw new Error('Order not found');
    }

    if (order.payment_status === 'paid') {
      throw new Error('Order already paid');
    }

    // Convert amount to cents (Stripe uses smallest currency unit)
    const amount = Math.round(parseFloat(order.total) * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'eur',
      metadata: {
        order_id: order.id.toString(),
        order_number: order.order_number,
        merchant_id: order.merchant_id.toString()
      },
      automatic_payment_methods: {
        enabled: true
      },
      description: `Order ${order.order_number} - ${order.merchant_id}`
    });

    // Update order with payment intent ID
    await order.update({
      payment_intent_id: paymentIntent.id
    });

    logger.info(`Payment intent created: ${paymentIntent.id} for order ${order.order_number}`);

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: order.total
    };

  } catch (error) {
    logger.error('Create payment intent error:', error);
    throw error;
  }
};

/**
 * Confirm Payment Intent
 */
const confirmPaymentIntent = async (paymentIntentId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    return {
      status: paymentIntent.status,
      amount: paymentIntent.amount / 100, // Convert cents to euros
      metadata: paymentIntent.metadata
    };

  } catch (error) {
    logger.error('Confirm payment intent error:', error);
    throw error;
  }
};

/**
 * Handle successful payment
 */
const handlePaymentSuccess = async (paymentIntent) => {
  try {
    const orderId = paymentIntent.metadata.order_id;

    const order = await Order.findByPk(orderId);

    if (!order) {
      logger.error(`Order not found for payment intent: ${paymentIntent.id}`);
      return;
    }

    // Update order status
    await order.update({
      payment_status: 'paid',
      paid_at: new Date(),
      order_status: order.order_status === 'pending' ? 'confirmed' : order.order_status,
      confirmed_at: order.order_status === 'pending' ? new Date() : order.confirmed_at
    });

    logger.info(`Payment successful for order ${order.order_number}`);

    // Send confirmation email
    const emailService = require('./email.service');
    if (process.env.ENABLE_EMAIL === 'true') {
      await emailService.sendOrderConfirmation(order);
    }

    // Emit WebSocket event
    // TODO: Implement WebSocket notification

    return order;

  } catch (error) {
    logger.error('Handle payment success error:', error);
    throw error;
  }
};

/**
 * Handle failed payment
 */
const handlePaymentFailed = async (paymentIntent) => {
  try {
    const orderId = paymentIntent.metadata.order_id;

    const order = await Order.findByPk(orderId);

    if (!order) {
      logger.error(`Order not found for payment intent: ${paymentIntent.id}`);
      return;
    }

    await order.update({
      payment_status: 'failed'
    });

    logger.warn(`Payment failed for order ${order.order_number}`);

    return order;

  } catch (error) {
    logger.error('Handle payment failed error:', error);
    throw error;
  }
};

/**
 * Create refund
 */
const createRefund = async (orderId, amount = null, reason = 'requested_by_customer') => {
  try {
    const order = await Order.findByPk(orderId);

    if (!order) {
      throw new Error('Order not found');
    }

    if (!order.payment_intent_id) {
      throw new Error('No payment to refund');
    }

    if (order.payment_status !== 'paid') {
      throw new Error('Order not paid, cannot refund');
    }

    // Create refund on Stripe
    const refundAmount = amount
      ? Math.round(parseFloat(amount) * 100)
      : undefined; // undefined = full refund

    const refund = await stripe.refunds.create({
      payment_intent: order.payment_intent_id,
      amount: refundAmount,
      reason,
      metadata: {
        order_id: order.id.toString(),
        order_number: order.order_number
      }
    });

    // Update order status
    const isFullRefund = !amount || parseFloat(amount) >= parseFloat(order.total);

    await order.update({
      payment_status: isFullRefund ? 'refunded' : 'partially_refunded',
      order_status: 'cancelled',
      cancelled_at: new Date(),
      cancellation_reason: `Refund: ${reason}`
    });

    logger.info(`Refund created: ${refund.id} for order ${order.order_number}`);

    return {
      refundId: refund.id,
      amount: refund.amount / 100,
      status: refund.status
    };

  } catch (error) {
    logger.error('Create refund error:', error);
    throw error;
  }
};

/**
 * Get payment status
 */
const getPaymentStatus = async (paymentIntentId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    return {
      status: paymentIntent.status,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
      created: new Date(paymentIntent.created * 1000)
    };

  } catch (error) {
    logger.error('Get payment status error:', error);
    throw error;
  }
};

module.exports = {
  createPaymentIntent,
  confirmPaymentIntent,
  handlePaymentSuccess,
  handlePaymentFailed,
  createRefund,
  getPaymentStatus
};
