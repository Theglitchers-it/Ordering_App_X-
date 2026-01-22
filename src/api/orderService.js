import apiClient, { handleApiError, logApiCall } from './apiClient';

/**
 * Order Service
 * Handles order creation, status updates, and tracking
 */

/**
 * Create new order (public or authenticated)
 */
export const createOrder = async (orderData) => {
  try {
    logApiCall('POST', '/orders', { merchant_id: orderData.merchant_id });

    const response = await apiClient.post('/orders', orderData);

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
 * Get orders (with filters)
 */
export const getOrders = async (filters = {}) => {
  try {
    const params = new URLSearchParams();

    if (filters.merchant_id) params.append('merchant_id', filters.merchant_id);
    if (filters.user_id) params.append('user_id', filters.user_id);
    if (filters.order_status) params.append('order_status', filters.order_status);
    if (filters.payment_status) params.append('payment_status', filters.payment_status);
    if (filters.order_type) params.append('order_type', filters.order_type);
    if (filters.from_date) params.append('from_date', filters.from_date);
    if (filters.to_date) params.append('to_date', filters.to_date);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);

    const queryString = params.toString();
    const endpoint = `/orders${queryString ? '?' + queryString : ''}`;

    logApiCall('GET', endpoint);

    const response = await apiClient.get(endpoint);

    return {
      success: true,
      orders: response.data.orders,
      pagination: response.data.pagination
    };
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Get order by ID
 */
export const getOrderById = async (orderId) => {
  try {
    logApiCall('GET', `/orders/${orderId}`);

    const response = await apiClient.get(`/orders/${orderId}`);

    return {
      success: true,
      order: response.data.order
    };
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Update order status
 */
export const updateOrderStatus = async (orderId, newStatus) => {
  try {
    logApiCall('PATCH', `/orders/${orderId}/status`, { status: newStatus });

    const response = await apiClient.patch(`/orders/${orderId}/status`, {
      order_status: newStatus
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
 * Cancel order
 */
export const cancelOrder = async (orderId, reason) => {
  try {
    logApiCall('PATCH', `/orders/${orderId}/cancel`, { reason });

    const response = await apiClient.patch(`/orders/${orderId}/cancel`, {
      cancellation_reason: reason
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
 * Get my orders (authenticated user)
 */
export const getMyOrders = async (filters = {}) => {
  // The backend will automatically filter by logged-in user
  return getOrders(filters);
};

/**
 * Get orders by merchant
 */
export const getOrdersByMerchant = async (merchantId, filters = {}) => {
  return getOrders({ ...filters, merchant_id: merchantId });
};

/**
 * Get orders by status
 */
export const getOrdersByStatus = async (status, filters = {}) => {
  return getOrders({ ...filters, order_status: status });
};

export default {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  getMyOrders,
  getOrdersByMerchant,
  getOrdersByStatus
};
