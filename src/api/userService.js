import apiClient, { handleApiError, logApiCall } from './apiClient';

/**
 * User Service
 * Handles user management operations (admin only)
 */

/**
 * Get all users (with filters)
 */
export const getUsers = async (filters = {}) => {
  try {
    const params = new URLSearchParams();

    if (filters.status) params.append('status', filters.status);
    if (filters.search) params.append('search', filters.search);
    if (filters.role) params.append('role', filters.role);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);

    const queryString = params.toString();
    const endpoint = `/users${queryString ? '?' + queryString : ''}`;

    logApiCall('GET', endpoint);

    const response = await apiClient.get(endpoint);

    return {
      success: true,
      users: response.data.users,
      pagination: response.data.pagination
    };
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Get user by ID
 */
export const getUserById = async (userId) => {
  try {
    logApiCall('GET', `/users/${userId}`);

    const response = await apiClient.get(`/users/${userId}`);

    return {
      success: true,
      user: response.data.user
    };
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Ban user
 */
export const banUser = async (userId) => {
  try {
    logApiCall('PATCH', `/users/${userId}/ban`);

    const response = await apiClient.patch(`/users/${userId}/ban`);

    return {
      success: true,
      user: response.data.user,
      message: response.data.message
    };
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Unban user
 */
export const unbanUser = async (userId) => {
  try {
    logApiCall('PATCH', `/users/${userId}/unban`);

    const response = await apiClient.patch(`/users/${userId}/unban`);

    return {
      success: true,
      user: response.data.user,
      message: response.data.message
    };
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Adjust user loyalty points
 */
export const adjustPoints = async (userId, amount, reason) => {
  try {
    logApiCall('POST', `/users/${userId}/adjust-points`, { amount, reason });

    const response = await apiClient.post(`/users/${userId}/adjust-points`, {
      amount,
      reason
    });

    return {
      success: true,
      user: response.data.user,
      message: response.data.message
    };
  } catch (error) {
    return handleApiError(error);
  }
};

export default {
  getUsers,
  getUserById,
  banUser,
  unbanUser,
  adjustPoints
};
