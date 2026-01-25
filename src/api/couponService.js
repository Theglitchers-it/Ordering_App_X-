import apiClient, { handleApiError, logApiCall } from './apiClient';

/**
 * Coupon Service
 * Handles coupon CRUD operations, validation, and application
 */

/**
 * Get all coupons (admin/merchant view)
 */
export const getCoupons = async (filters = {}) => {
  try {
    const params = new URLSearchParams();

    if (filters.merchant_id) params.append('merchant_id', filters.merchant_id);
    if (filters.is_active !== undefined) params.append('is_active', filters.is_active);
    if (filters.discount_type) params.append('discount_type', filters.discount_type);
    if (filters.search) params.append('search', filters.search);
    if (filters.include_expired) params.append('include_expired', filters.include_expired);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);

    const queryString = params.toString();
    const endpoint = `/coupons${queryString ? '?' + queryString : ''}`;

    logApiCall('GET', endpoint);

    const response = await apiClient.get(endpoint);

    return {
      success: true,
      coupons: response.data.coupons,
      pagination: response.data.pagination
    };
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Get available coupons for customers (public)
 */
export const getAvailableCoupons = async (merchantId = null) => {
  try {
    const params = merchantId ? `?merchant_id=${merchantId}` : '';
    const endpoint = `/coupons/available${params}`;

    logApiCall('GET', endpoint);

    const response = await apiClient.get(endpoint);

    return {
      success: true,
      coupons: response.data.coupons
    };
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Get coupon by ID
 */
export const getCouponById = async (couponId) => {
  try {
    logApiCall('GET', `/coupons/${couponId}`);

    const response = await apiClient.get(`/coupons/${couponId}`);

    return {
      success: true,
      coupon: response.data.coupon
    };
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Validate coupon code (public)
 * @param {string} code - Coupon code
 * @param {number} orderTotal - Order subtotal
 * @param {number|null} merchantId - Merchant ID (optional)
 * @param {number|null} userId - User ID (optional)
 */
export const validateCoupon = async (code, orderTotal, merchantId = null, userId = null) => {
  try {
    logApiCall('POST', '/coupons/validate', { code, orderTotal });

    const response = await apiClient.post('/coupons/validate', {
      code: code.toUpperCase(),
      order_total: orderTotal,
      merchant_id: merchantId,
      user_id: userId
    });

    return {
      success: true,
      valid: response.data.valid,
      coupon: response.data.coupon,
      discount_amount: response.data.discount_amount,
      new_total: response.data.new_total
    };
  } catch (error) {
    // Return validation error as structured response
    if (error.response?.data?.valid === false) {
      return {
        success: false,
        valid: false,
        message: error.response.data.message,
        error: error.response.data.error
      };
    }
    return handleApiError(error);
  }
};

/**
 * Create new coupon
 */
export const createCoupon = async (couponData) => {
  try {
    logApiCall('POST', '/coupons', { code: couponData.code });

    const response = await apiClient.post('/coupons', {
      merchant_id: couponData.merchant_id || null,
      code: couponData.code.toUpperCase(),
      title: couponData.title,
      description: couponData.description,
      discount_type: couponData.discount_type || couponData.type,
      discount_value: couponData.discount_value || couponData.value,
      max_discount_amount: couponData.max_discount_amount || couponData.maxDiscount,
      min_order_amount: couponData.min_order_amount || couponData.minOrder || 0,
      max_uses: couponData.max_uses || couponData.usageLimit,
      max_uses_per_user: couponData.max_uses_per_user || 1,
      applicable_products: couponData.applicable_products,
      applicable_categories: couponData.applicable_categories || couponData.applicableCategories,
      valid_from: couponData.valid_from || couponData.validFrom,
      valid_until: couponData.valid_until || couponData.validUntil
    });

    return {
      success: true,
      coupon: response.data.coupon,
      message: response.data.message
    };
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Update coupon
 */
export const updateCoupon = async (couponId, updates) => {
  try {
    logApiCall('PATCH', `/coupons/${couponId}`, updates);

    // Map frontend field names to backend
    const mappedUpdates = {};
    if (updates.title !== undefined) mappedUpdates.title = updates.title;
    if (updates.description !== undefined) mappedUpdates.description = updates.description;
    if (updates.value !== undefined) mappedUpdates.discount_value = updates.value;
    if (updates.discount_value !== undefined) mappedUpdates.discount_value = updates.discount_value;
    if (updates.maxDiscount !== undefined) mappedUpdates.max_discount_amount = updates.maxDiscount;
    if (updates.max_discount_amount !== undefined) mappedUpdates.max_discount_amount = updates.max_discount_amount;
    if (updates.minOrder !== undefined) mappedUpdates.min_order_amount = updates.minOrder;
    if (updates.min_order_amount !== undefined) mappedUpdates.min_order_amount = updates.min_order_amount;
    if (updates.usageLimit !== undefined) mappedUpdates.max_uses = updates.usageLimit;
    if (updates.max_uses !== undefined) mappedUpdates.max_uses = updates.max_uses;
    if (updates.validFrom !== undefined) mappedUpdates.valid_from = updates.validFrom;
    if (updates.valid_from !== undefined) mappedUpdates.valid_from = updates.valid_from;
    if (updates.validUntil !== undefined) mappedUpdates.valid_until = updates.validUntil;
    if (updates.valid_until !== undefined) mappedUpdates.valid_until = updates.valid_until;
    if (updates.active !== undefined) mappedUpdates.is_active = updates.active;
    if (updates.is_active !== undefined) mappedUpdates.is_active = updates.is_active;
    if (updates.applicableCategories !== undefined) mappedUpdates.applicable_categories = updates.applicableCategories;
    if (updates.applicable_categories !== undefined) mappedUpdates.applicable_categories = updates.applicable_categories;

    const response = await apiClient.patch(`/coupons/${couponId}`, mappedUpdates);

    return {
      success: true,
      coupon: response.data.coupon,
      message: response.data.message
    };
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Toggle coupon active status
 */
export const toggleCouponStatus = async (couponId) => {
  try {
    logApiCall('PATCH', `/coupons/${couponId}/toggle`);

    const response = await apiClient.patch(`/coupons/${couponId}/toggle`);

    return {
      success: true,
      coupon: response.data.coupon,
      message: response.data.message
    };
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Delete coupon
 */
export const deleteCoupon = async (couponId) => {
  try {
    logApiCall('DELETE', `/coupons/${couponId}`);

    const response = await apiClient.delete(`/coupons/${couponId}`);

    return {
      success: true,
      message: response.data.message,
      deactivated: response.data.deactivated || false
    };
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Apply coupon to order (record usage)
 */
export const applyCouponToOrder = async (couponId, orderId, discountAmount) => {
  try {
    logApiCall('POST', `/coupons/${couponId}/apply`, { orderId, discountAmount });

    const response = await apiClient.post(`/coupons/${couponId}/apply`, {
      order_id: orderId,
      discount_amount: discountAmount
    });

    return {
      success: true,
      usage: response.data.usage,
      message: response.data.message
    };
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Get coupon statistics
 */
export const getCouponStats = async (couponId) => {
  try {
    logApiCall('GET', `/coupons/${couponId}/stats`);

    const response = await apiClient.get(`/coupons/${couponId}/stats`);

    return {
      success: true,
      stats: response.data.stats
    };
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Get coupons by merchant
 */
export const getCouponsByMerchant = async (merchantId, filters = {}) => {
  return getCoupons({ ...filters, merchant_id: merchantId });
};

export default {
  getCoupons,
  getAvailableCoupons,
  getCouponById,
  validateCoupon,
  createCoupon,
  updateCoupon,
  toggleCouponStatus,
  deleteCoupon,
  applyCouponToOrder,
  getCouponStats,
  getCouponsByMerchant
};
