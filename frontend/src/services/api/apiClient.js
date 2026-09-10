import axios from 'axios'
import { APP_CONFIG } from '../../constants/app'

/**
 * Intelligently resolve the API Base URL across local development,
 * custom environment variables (VITE_API_BASE_URL, VITE_API_URL), and production deployments.
 */
const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim()) {
    let clean = envUrl.trim().replace(/\/+$/, '');
    // If the provided URL doesn't contain /api/marketplace or /api, append /api/marketplace
    if (!clean.endsWith('/api/marketplace') && !clean.endsWith('/api')) {
      clean = `${clean}/api/marketplace`;
    }
    return clean;
  }
  // Production fallback (standard Marketplace API root)
  if (import.meta.env.PROD) {
    return 'https://api.velvorax.com/api/marketplace';
  }
  return 'http://localhost:5000/api/marketplace';
};

const baseURL = getApiBaseUrl();

/**
 * Timeout configuration
 */
const timeout = Number(import.meta.env.VITE_API_TIMEOUT) || APP_CONFIG.DEFAULT_TIMEOUT_MS

/**
 * Centralized Axios Instance
 */
const apiClient = axios.create({
  baseURL,
  timeout,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

/**
 * Helper to programmatically manage auth token in headers and storage
 */
export const tokenManager = {
  get: () => {
    try {
      return localStorage.getItem(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN)
    } catch {
      return null
    }
  },
  set: (token) => {
    try {
      if (token) {
        localStorage.setItem(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN, token)
      } else {
        localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN)
      }
    } catch (e) {
      console.error('Failed to store auth token', e)
    }
  },
  clear: () => {
    try {
      localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN)
      localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.REFRESH_TOKEN)
    } catch (e) {
      console.error('Failed to clear auth tokens', e)
    }
  },
}

/**
 * Request Interceptor: Attach authentication token and trace headers
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = tokenManager.get()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(normalizeError(error))
  }
)

/**
 * Response Interceptor: Centralized error handling and payload normalization
 */
apiClient.interceptors.response.use(
  (response) => {
    // Return data payload directly for clean consumer code
    return response.data !== undefined ? response.data : response
  },
  (error) => {
    const normalized = normalizeError(error)

    // Centralized handler for unauthorized requests (skip for login/auth routes)
    const isAuthRequest = error.config?.url?.includes('/login') || 
                          error.config?.url?.includes('/auth/register') || 
                          error.config?.url?.includes('/auth/forgot-password') ||
                          error.config?.url?.includes('/auth/reset-password');

    if (normalized.status === 401 && !isAuthRequest) {
      tokenManager.clear()
      // Dispatch custom event for app-level listeners if needed
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth:unauthorized', { detail: normalized }))
      }
    }

    return Promise.reject(normalized)
  }
)

/**
 * Centralized Error Normalizer
 * @param {any} error
 * @returns {{ status: number|null, message: string, data: any, isNetworkError: boolean, isTimeout: boolean }}
 */
function normalizeError(error) {
  if (axios.isCancel(error)) {
    return {
      status: null,
      message: 'Request was cancelled',
      data: null,
      isCancelled: true,
      isNetworkError: false,
      isTimeout: false,
    }
  }

  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return {
      status: 408,
      message: 'Request timed out. Please check your network connection.',
      data: null,
      isNetworkError: true,
      isTimeout: true,
    }
  }

  if (!error.response) {
    return {
      status: null,
      message: error.message || 'Network error. Please check your internet connection.',
      data: null,
      isNetworkError: true,
      isTimeout: false,
    }
  }

  const { status, data } = error.response

  let message = 'An unexpected server error occurred.'
  if (typeof data === 'string') {
    message = data
  } else if (data?.message) {
    message = data.message
  } else if (data?.error) {
    message = typeof data.error === 'string' ? data.error : JSON.stringify(data.error)
  } else if (status === 400) {
    message = 'Bad request. Please check submitted data.'
  } else if (status === 401) {
    message = 'Your session has expired. Please sign in again.'
  } else if (status === 403) {
    message = 'You do not have permission to perform this action.'
  } else if (status === 404) {
    message = 'The requested resource was not found.'
  } else if (status >= 500) {
    message = 'Server encountered an internal error. Please try again later.'
  }

  return {
    status,
    message,
    data,
    isNetworkError: false,
    isTimeout: false,
  }
}

/**
 * Reusable HTTP methods wrapper for clean service calls
 */
export const http = {
  get: (url, config) => apiClient.get(url, config),
  post: (url, data, config) => apiClient.post(url, data, config),
  put: (url, data, config) => apiClient.put(url, data, config),
  patch: (url, data, config) => apiClient.patch(url, data, config),
  delete: (url, config) => apiClient.delete(url, config),
}

export default apiClient
