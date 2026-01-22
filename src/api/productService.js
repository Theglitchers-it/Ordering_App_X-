import apiClient, { handleApiError, logApiCall } from './apiClient';

/**
 * Product Service
 * Handles product CRUD operations and inventory management
 */

/**
 * Get all products (with filters)
 */
export const getProducts = async (filters = {}) => {
  try {
    const params = new URLSearchParams();

    if (filters.merchant_id) params.append('merchant_id', filters.merchant_id);
    if (filters.category_id) params.append('category_id', filters.category_id);
    if (filters.search) params.append('search', filters.search);
    if (filters.min_price) params.append('min_price', filters.min_price);
    if (filters.max_price) params.append('max_price', filters.max_price);
    if (filters.is_available !== undefined) params.append('is_available', filters.is_available);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);

    const queryString = params.toString();
    const endpoint = `/products${queryString ? '?' + queryString : ''}`;

    logApiCall('GET', endpoint);

    const response = await apiClient.get(endpoint);

    return {
      success: true,
      products: response.data.products,
      pagination: response.data.pagination
    };
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Get product by ID
 */
export const getProductById = async (productId) => {
  try {
    logApiCall('GET', `/products/${productId}`);

    const response = await apiClient.get(`/products/${productId}`);

    return {
      success: true,
      product: response.data.product
    };
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Create new product
 */
export const createProduct = async (productData) => {
  try {
    logApiCall('POST', '/products', { name: productData.name });

    const response = await apiClient.post('/products', productData);

    return {
      success: true,
      product: response.data.product,
      message: response.data.message
    };
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Update product
 */
export const updateProduct = async (productId, updates) => {
  try {
    logApiCall('PATCH', `/products/${productId}`, updates);

    const response = await apiClient.patch(`/products/${productId}`, updates);

    return {
      success: true,
      product: response.data.product,
      message: response.data.message
    };
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Delete product (soft delete)
 */
export const deleteProduct = async (productId) => {
  try {
    logApiCall('DELETE', `/products/${productId}`);

    const response = await apiClient.delete(`/products/${productId}`);

    return {
      success: true,
      message: response.data.message
    };
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Toggle product availability
 */
export const toggleProductAvailability = async (productId) => {
  try {
    logApiCall('PATCH', `/products/${productId}/toggle-availability`);

    const response = await apiClient.patch(`/products/${productId}/toggle-availability`);

    return {
      success: true,
      product: response.data.product,
      message: response.data.message
    };
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Bulk import products (CSV data)
 */
export const bulkImportProducts = async (productsArray) => {
  try {
    logApiCall('POST', '/products/bulk-import', { count: productsArray.length });

    const response = await apiClient.post('/products/bulk-import', {
      products: productsArray
    });

    return {
      success: true,
      imported: response.data.imported,
      failed: response.data.failed,
      message: response.data.message
    };
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Get products by merchant
 */
export const getProductsByMerchant = async (merchantId, filters = {}) => {
  return getProducts({ ...filters, merchant_id: merchantId });
};

/**
 * Get products by category
 */
export const getProductsByCategory = async (categoryId, filters = {}) => {
  return getProducts({ ...filters, category_id: categoryId });
};

export default {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductAvailability,
  bulkImportProducts,
  getProductsByMerchant,
  getProductsByCategory
};
