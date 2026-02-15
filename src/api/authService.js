import apiClient, { saveTokens, clearTokens, handleApiError, logApiCall } from './apiClient';

/**
 * Authentication Service
 * Handles user registration, login, logout, and token management
 */

/**
 * Register new user
 */
export const register = async (userData) => {
  try {
    logApiCall('POST', '/auth/register', { email: userData.email });

    const response = await apiClient.post('/auth/register', {
      email: userData.email,
      password: userData.password,
      first_name: userData.firstName || userData.first_name,
      last_name: userData.lastName || userData.last_name,
      phone: userData.phone,
      role: userData.role || 'user'
    });

    const { accessToken, refreshToken, user } = response.data;

    // Save tokens
    saveTokens(accessToken, refreshToken);

    // Save user data
    localStorage.setItem('user', JSON.stringify(user));

    return {
      success: true,
      user,
      accessToken,
      refreshToken
    };
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Login user
 */
export const login = async (email, password) => {
  try {
    logApiCall('POST', '/auth/login', { email });

    const response = await apiClient.post('/auth/login', {
      email,
      password
    });

    const { accessToken, refreshToken, user } = response.data;

    // Save tokens
    saveTokens(accessToken, refreshToken);

    // Save user data
    localStorage.setItem('user', JSON.stringify(user));

    return {
      success: true,
      user,
      accessToken,
      refreshToken
    };
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Logout user
 */
export const logout = async () => {
  try {
    logApiCall('POST', '/auth/logout');

    await apiClient.post('/auth/logout');

    // Clear local storage
    clearTokens();

    return {
      success: true,
      message: 'Logout effettuato con successo'
    };
  } catch (error) {
    // Even if API call fails, clear local tokens
    clearTokens();
    return {
      success: true,
      message: 'Logout effettuato'
    };
  }
};

/**
 * Get current user profile
 */
export const getMe = async () => {
  try {
    logApiCall('GET', '/auth/me');

    const response = await apiClient.get('/auth/me');

    const user = response.data.user;

    // Update stored user data
    localStorage.setItem('user', JSON.stringify(user));

    return {
      success: true,
      user
    };
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Refresh access token
 */
export const refreshAccessToken = async (refreshToken) => {
  try {
    logApiCall('POST', '/auth/refresh-token');

    const response = await apiClient.post('/auth/refresh-token', {
      refreshToken
    });

    const { accessToken } = response.data;

    // Save new access token
    saveTokens(accessToken, refreshToken);

    return {
      success: true,
      accessToken
    };
  } catch (error) {
    // If refresh fails, logout user
    clearTokens();
    return handleApiError(error);
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem('accessToken');
  const user = localStorage.getItem('user');
  return !!(token && user);
};

/**
 * Get current user from localStorage
 */
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;

  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

// Re-export clearTokens for external use (e.g. AuthContext)
export { clearTokens } from './apiClient';

export default {
  register,
  login,
  logout,
  getMe,
  refreshAccessToken,
  isAuthenticated,
  getCurrentUser
};
