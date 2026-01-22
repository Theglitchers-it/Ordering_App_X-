import axios from 'axios';

// Base API URL from environment
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Axios instance with JWT token handling
 */
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000 // 30 seconds
});

/**
 * Get access token from localStorage
 */
const getAccessToken = () => {
  return localStorage.getItem('accessToken');
};

/**
 * Get refresh token from localStorage
 */
const getRefreshToken = () => {
  return localStorage.getItem('refreshToken');
};

/**
 * Save tokens to localStorage
 */
export const saveTokens = (accessToken, refreshToken) => {
  localStorage.setItem('accessToken', accessToken);
  if (refreshToken) {
    localStorage.setItem('refreshToken', refreshToken);
  }
};

/**
 * Clear tokens from localStorage
 */
export const clearTokens = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  localStorage.removeItem('adminAuth');
};

/**
 * Request interceptor to add JWT token
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor to handle token refresh
 */
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        // No refresh token, logout
        clearTokens();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        // Try to refresh the token
        const response = await axios.post(`${API_URL}/auth/refresh-token`, {
          refreshToken
        });

        const { accessToken } = response.data;
        saveTokens(accessToken, refreshToken);

        // Update the failed request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        // Process queued requests
        processQueue(null, accessToken);

        isRefreshing = false;

        // Retry the original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        processQueue(refreshError, null);
        clearTokens();
        window.location.href = '/login';
        isRefreshing = false;
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Helper function to handle API errors
 */
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    const message = error.response.data?.message || error.response.data?.error || 'Si è verificato un errore';
    return {
      success: false,
      message,
      status: error.response.status,
      data: error.response.data
    };
  } else if (error.request) {
    // Request made but no response
    return {
      success: false,
      message: 'Impossibile connettersi al server. Verifica la tua connessione.',
      status: 0
    };
  } else {
    // Error in request setup
    return {
      success: false,
      message: error.message || 'Errore nella richiesta',
      status: 0
    };
  }
};

/**
 * Debug logger (only in development)
 */
export const logApiCall = (method, endpoint, data) => {
  if (import.meta.env.VITE_DEBUG === 'true') {
    console.log(`[API] ${method.toUpperCase()} ${endpoint}`, data || '');
  }
};

export default apiClient;
