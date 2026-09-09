import { http, tokenManager } from './apiClient';

export const authService = {
  login: async (credentials) => {
    tokenManager.clear();
    const targetUrl = credentials.expectedRole === 'BUYER'
      ? '/auth/buyer/login'
      : credentials.expectedRole === 'SELLER'
        ? '/auth/seller/login'
        : '/auth/login';
    const response = await http.post(targetUrl, credentials);
    if (response.success && (response.token || response.data?.token)) {
      const token = response.token || response.data.token;
      tokenManager.set(token);
    }
    return response.data;
  },

  buyerLogin: async (credentials) => {
    tokenManager.clear();
    const response = await http.post('/auth/buyer/login', credentials);
    if (response.success && (response.token || response.data?.token)) {
      const token = response.token || response.data.token;
      tokenManager.set(token);
    }
    return response.data;
  },

  sellerLogin: async (credentials) => {
    tokenManager.clear();
    const response = await http.post('/auth/seller/login', credentials);
    if (response.success && (response.token || response.data?.token)) {
      const token = response.token || response.data.token;
      tokenManager.set(token);
    }
    return response.data;
  },

  verifyAdminPin: async (pin) => {
    const response = await http.post('/admin/auth/verify-pin', { pin });
    return response;
  },

  initiateAdminLogin: async (credentials) => {
    const response = await http.post('/admin/auth/login-init', credentials);
    if (response.success && response.token) {
      tokenManager.set(response.token);
    }
    return response;
  },

  verifyAdmin2FA: async ({ tempSessionId, code }) => {
    const response = await http.post('/admin/auth/verify-2fa', { tempSessionId, code });
    if (response.success && response.token) {
      tokenManager.set(response.token);
    }
    return response.user || response.data;
  },

  resendAdmin2FA: async ({ tempSessionId }) => {
    const response = await http.post('/admin/auth/resend-2fa', { tempSessionId });
    return response;
  },

  adminLogin: async (credentials) => {
    const response = await http.post('/admin/auth/login', credentials);
    if (response.success && response.token) {
      tokenManager.set(response.token);
    }
    return response.user || response.data;
  },


  register: async (userData) => {
    const response = await http.post('/auth/register', userData);
    if (response.success && response.data.token) {
      tokenManager.set(response.data.token);
    }
    return response.data;
  },

  getCurrentUser: async () => {
    const token = tokenManager.get();
    if (!token) return null;
    try {
      const response = await http.get('/auth/me');
      if (response.success) {
        return response.data;
      }
      return null;
    } catch (error) {
      tokenManager.clear();
      return null;
    }
  },

  updateProfile: async (profileData) => {
    const response = await http.put('/auth/profile', profileData);
    return response.data;
  },

  changePassword: async ({ currentPassword, newPassword }) => {
    const response = await http.post('/auth/change-password', { currentPassword, newPassword });
    return response;
  },

  getSellerProfile: async (sellerId) => {
    const response = await http.get(`/auth/seller/${sellerId}`);
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await http.post('/auth/forgot-password', { email });
    return response;
  },

  verifyOTP: async (email, otp) => {
    const response = await http.post('/auth/verify-otp', { email, otp });
    return response;
  },

  resetPassword: async ({ token, password }) => {
    const response = await http.post('/auth/reset-password', { token, password });
    return response;
  },

  switchCategory: async (category) => {
    const response = await http.post('/auth/switch-category', { category });
    return response;
  },

  logout: async () => {
    try {
      await http.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      tokenManager.clear();
    }
  }
};

