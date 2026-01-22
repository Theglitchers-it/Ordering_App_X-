import apiClient, { handleApiError, logApiCall } from './apiClient';

/**
 * Payment Service
 * Handles Stripe payment integration
 */

/**
 * Create payment intent for order
 */
export const createPaymentIntent = async (orderId) => {
  try {
    logApiCall('POST', '/payments/create-intent', { orderId });

    const response = await apiClient.post('/payments/create-intent', {
      order_id: orderId
    });

    return {
      success: true,
      clientSecret: response.data.clientSecret,
      paymentIntentId: response.data.paymentIntentId,
      message: response.data.message
    };
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Confirm payment (after Stripe.js confirmation)
 */
export const confirmPayment = async (paymentIntentId) => {
  try {
    logApiCall('POST', '/payments/confirm', { paymentIntentId });

    const response = await apiClient.post('/payments/confirm', {
      payment_intent_id: paymentIntentId
    });

    return {
      success: true,
      order: response.data.order,
      message: response.data.message
    };
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Get payment status for order
 */
export const getPaymentStatus = async (orderId) => {
  try {
    logApiCall('GET', `/payments/${orderId}/status`);

    const response = await apiClient.get(`/payments/${orderId}/status`);

    return {
      success: true,
      status: response.data.status,
      payment: response.data.payment
    };
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Request refund for order
 */
export const refundPayment = async (orderId, amount, reason) => {
  try {
    logApiCall('POST', `/payments/${orderId}/refund`, { amount, reason });

    const response = await apiClient.post(`/payments/${orderId}/refund`, {
      amount,
      reason
    });

    return {
      success: true,
      refund: response.data.refund,
      message: response.data.message
    };
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Get Stripe publishable key (if needed from backend)
 */
export const getStripeConfig = async () => {
  try {
    logApiCall('GET', '/payments/config');

    const response = await apiClient.get('/payments/config');

    return {
      success: true,
      publishableKey: response.data.publishableKey
    };
  } catch (error) {
    return handleApiError(error);
  }
};

export default {
  createPaymentIntent,
  confirmPayment,
  getPaymentStatus,
  refundPayment,
  getStripeConfig
};
