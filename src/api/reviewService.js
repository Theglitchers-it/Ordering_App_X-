import apiClient, { handleApiError, logApiCall } from './apiClient';

/**
 * Review Service
 * Handles review CRUD operations and rating statistics
 */

/**
 * Get reviews with filters
 */
export const getReviews = async (filters = {}) => {
  try {
    const params = new URLSearchParams();

    if (filters.merchant_id) params.append('merchant_id', filters.merchant_id);
    if (filters.product_id) params.append('product_id', filters.product_id);
    if (filters.user_id) params.append('user_id', filters.user_id);
    if (filters.min_rating) params.append('min_rating', filters.min_rating);
    if (filters.max_rating) params.append('max_rating', filters.max_rating);
    if (filters.sort) params.append('sort', filters.sort);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);

    const queryString = params.toString();
    const endpoint = `/reviews${queryString ? '?' + queryString : ''}`;

    logApiCall('GET', endpoint);

    const response = await apiClient.get(endpoint);

    return {
      success: true,
      reviews: response.data.reviews,
      pagination: response.data.pagination
    };
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Get review by ID
 */
export const getReviewById = async (reviewId) => {
  try {
    logApiCall('GET', `/reviews/${reviewId}`);

    const response = await apiClient.get(`/reviews/${reviewId}`);

    return {
      success: true,
      review: response.data.review
    };
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Get review statistics for merchant or product
 * @param {string} type - 'merchant' or 'product'
 * @param {number} id - Merchant or Product ID
 */
export const getReviewStats = async (type, id) => {
  try {
    logApiCall('GET', `/reviews/stats/${type}/${id}`);

    const response = await apiClient.get(`/reviews/stats/${type}/${id}`);

    return {
      success: true,
      stats: response.data.stats
    };
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Create a new review
 */
export const createReview = async (reviewData) => {
  try {
    logApiCall('POST', '/reviews', { order_id: reviewData.order_id });

    const response = await apiClient.post('/reviews', {
      merchant_id: reviewData.merchant_id,
      product_id: reviewData.product_id,
      order_id: reviewData.order_id,
      rating: reviewData.rating,
      title: reviewData.title,
      comment: reviewData.comment,
      images: reviewData.images
    });

    return {
      success: true,
      review: response.data.review,
      message: response.data.message
    };
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Update a review
 */
export const updateReview = async (reviewId, updates) => {
  try {
    logApiCall('PATCH', `/reviews/${reviewId}`, updates);

    const response = await apiClient.patch(`/reviews/${reviewId}`, updates);

    return {
      success: true,
      review: response.data.review,
      message: response.data.message
    };
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Delete a review
 */
export const deleteReview = async (reviewId) => {
  try {
    logApiCall('DELETE', `/reviews/${reviewId}`);

    const response = await apiClient.delete(`/reviews/${reviewId}`);

    return {
      success: true,
      message: response.data.message
    };
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Merchant responds to a review
 */
export const respondToReview = async (reviewId, responseText) => {
  try {
    logApiCall('POST', `/reviews/${reviewId}/respond`);

    const response = await apiClient.post(`/reviews/${reviewId}/respond`, {
      response: responseText
    });

    return {
      success: true,
      review: response.data.review,
      message: response.data.message
    };
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Moderate review (approve/reject) - Admin only
 */
export const moderateReview = async (reviewId, isApproved) => {
  try {
    logApiCall('PATCH', `/reviews/${reviewId}/approve`);

    const response = await apiClient.patch(`/reviews/${reviewId}/approve`, {
      is_approved: isApproved
    });

    return {
      success: true,
      review: response.data.review,
      message: response.data.message
    };
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Get reviews by merchant
 */
export const getReviewsByMerchant = async (merchantId, filters = {}) => {
  return getReviews({ ...filters, merchant_id: merchantId });
};

/**
 * Get reviews by product
 */
export const getReviewsByProduct = async (productId, filters = {}) => {
  return getReviews({ ...filters, product_id: productId });
};

export default {
  getReviews,
  getReviewById,
  getReviewStats,
  createReview,
  updateReview,
  deleteReview,
  respondToReview,
  moderateReview,
  getReviewsByMerchant,
  getReviewsByProduct
};
