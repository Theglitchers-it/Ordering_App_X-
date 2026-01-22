import apiClient, { handleApiError, logApiCall } from './apiClient';

/**
 * Merchant Service
 * Handles merchant CRUD operations, approval, and statistics
 */

/**
 * Get all merchants (with filters)
 */
export const getMerchants = async (filters = {}) => {
  try {
    const params = new URLSearchParams();

    if (filters.status) params.append('status', filters.status);
    if (filters.city) params.append('city', filters.city);
    if (filters.search) params.append('search', filters.search);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);

    const queryString = params.toString();
    const endpoint = `/merchants${queryString ? '?' + queryString : ''}`;

    logApiCall('GET', endpoint);

    const response = await apiClient.get(endpoint);

    return {
      success: true,
      merchants: response.data.merchants,
      pagination: response.data.pagination
    };
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Get merchant by slug
 */
export const getMerchantBySlug = async (slug) => {
  try {
    logApiCall('GET', `/merchants/${slug}`);

    const response = await apiClient.get(`/merchants/${slug}`);

    return {
      success: true,
      merchant: response.data.merchant
    };
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Get my merchant (for merchant_admin users)
 */
export const getMyMerchant = async () => {
  try {
    logApiCall('GET', '/merchants/me/dashboard');

    const response = await apiClient.get('/merchants/me/dashboard');

    return {
      success: true,
      merchant: response.data.merchant
    };
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Create new merchant
 */
export const createMerchant = async (merchantData) => {
  try {
    logApiCall('POST', '/merchants', { business_name: merchantData.business_name });

    const response = await apiClient.post('/merchants', merchantData);

    return {
      success: true,
      merchant: response.data.merchant,
      message: response.data.message
    };
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Update merchant
 */
export const updateMerchant = async (merchantId, updates) => {
  try {
    logApiCall('PATCH', `/merchants/${merchantId}`, updates);

    const response = await apiClient.patch(`/merchants/${merchantId}`, updates);

    return {
      success: true,
      merchant: response.data.merchant,
      message: response.data.message
    };
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Delete merchant (soft delete)
 */
export const deleteMerchant = async (merchantId) => {
  try {
    logApiCall('DELETE', `/merchants/${merchantId}`);

    const response = await apiClient.delete(`/merchants/${merchantId}`);

    return {
      success: true,
      message: response.data.message
    };
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Approve merchant (admin only)
 */
export const approveMerchant = async (merchantId) => {
  try {
    logApiCall('PATCH', `/merchants/${merchantId}/approve`);

    const response = await apiClient.patch(`/merchants/${merchantId}/approve`);

    return {
      success: true,
      merchant: response.data.merchant,
      message: response.data.message
    };
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Block merchant (admin only)
 */
export const blockMerchant = async (merchantId) => {
  try {
    logApiCall('PATCH', `/merchants/${merchantId}/block`);

    const response = await apiClient.patch(`/merchants/${merchantId}/block`);

    return {
      success: true,
      merchant: response.data.merchant,
      message: response.data.message
    };
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Get merchant statistics
 */
export const getMerchantStats = async (merchantId) => {
  try {
    logApiCall('GET', `/merchants/${merchantId}/stats`);

    const response = await apiClient.get(`/merchants/${merchantId}/stats`);

    return {
      success: true,
      stats: response.data.stats
    };
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Get active merchants (public)
 */
export const getActiveMerchants = async () => {
  return getMerchants({ status: 'active' });
};

/**
 * Get pending merchants (admin only)
 */
export const getPendingMerchants = async () => {
  return getMerchants({ status: 'pending_approval' });
};

export default {
  getMerchants,
  getMerchantBySlug,
  getMyMerchant,
  createMerchant,
  updateMerchant,
  deleteMerchant,
  approveMerchant,
  blockMerchant,
  getMerchantStats,
  getActiveMerchants,
  getPendingMerchants
};
