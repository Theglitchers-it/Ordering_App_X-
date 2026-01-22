import apiClient, { handleApiError, logApiCall } from './apiClient';

/**
 * Category Service
 * Handles category CRUD operations and reordering
 */

/**
 * Get all categories (with filters)
 */
export const getCategories = async (filters = {}) => {
  try {
    const params = new URLSearchParams();

    if (filters.merchant_id) params.append('merchant_id', filters.merchant_id);

    const queryString = params.toString();
    const endpoint = `/categories${queryString ? '?' + queryString : ''}`;

    logApiCall('GET', endpoint);

    const response = await apiClient.get(endpoint);

    return {
      success: true,
      categories: response.data.categories
    };
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Get category by ID
 */
export const getCategoryById = async (categoryId) => {
  try {
    logApiCall('GET', `/categories/${categoryId}`);

    const response = await apiClient.get(`/categories/${categoryId}`);

    return {
      success: true,
      category: response.data.category
    };
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Create new category
 */
export const createCategory = async (categoryData) => {
  try {
    logApiCall('POST', '/categories', { name: categoryData.name });

    const response = await apiClient.post('/categories', categoryData);

    return {
      success: true,
      category: response.data.category,
      message: response.data.message
    };
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Update category
 */
export const updateCategory = async (categoryId, updates) => {
  try {
    logApiCall('PATCH', `/categories/${categoryId}`, updates);

    const response = await apiClient.patch(`/categories/${categoryId}`, updates);

    return {
      success: true,
      category: response.data.category,
      message: response.data.message
    };
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Delete category (soft delete)
 */
export const deleteCategory = async (categoryId) => {
  try {
    logApiCall('DELETE', `/categories/${categoryId}`);

    const response = await apiClient.delete(`/categories/${categoryId}`);

    return {
      success: true,
      message: response.data.message
    };
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Reorder categories (drag & drop)
 */
export const reorderCategories = async (categoryOrders) => {
  try {
    logApiCall('PATCH', '/categories/reorder', categoryOrders);

    const response = await apiClient.patch('/categories/reorder', {
      orders: categoryOrders // Array of { id, sort_order }
    });

    return {
      success: true,
      message: response.data.message
    };
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Get categories by merchant
 */
export const getCategoriesByMerchant = async (merchantId) => {
  return getCategories({ merchant_id: merchantId });
};

export default {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
  getCategoriesByMerchant
};
