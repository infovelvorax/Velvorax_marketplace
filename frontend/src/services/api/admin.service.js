import { http } from './apiClient';

export const adminService = {
  // Statistics
  getAdminStats: async () => {
    const response = await http.get('/admin/stats');
    return response?.data !== undefined ? response.data : response;
  },

  // Listings Moderation
  getPendingListings: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const response = await http.get(`/admin/moderation?${query}`);
    return response;
  },

  moderateListing: async (listingId, data) => {
    const response = await http.patch(`/admin/listings/${listingId}/moderate`, data);
    return response?.data !== undefined ? response.data : response;
  },

  // Sellers Management & Moderation
  getSellers: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const response = await http.get(`/admin/sellers?${query}`);
    return response;
  },

  moderateSeller: async (sellerId, data) => {
    const response = await http.patch(`/admin/sellers/${sellerId}/moderate`, data);
    return response?.data !== undefined ? response.data : response;
  },

  // Buyers Management
  getBuyers: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const response = await http.get(`/admin/buyers?${query}`);
    return response;
  },

  // Seller Identity Verifications
  getSellerVerifications: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const response = await http.get(`/admin/verifications?${query}`);
    return response?.data !== undefined ? response.data : (Array.isArray(response) ? response : []);
  },

  moderateSellerVerification: async (verificationId, data) => {
    const response = await http.patch(`/admin/verifications/${verificationId}/moderate`, data);
    return response?.data !== undefined ? response.data : response;
  },

  // Overall Consolidation Ledger
  getConsolidationReport: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const response = await http.get(`/admin/consolidation?${query}`);
    return response?.data !== undefined ? response.data : response;
  },

  // Seller Details & Inventory Catalog
  getSellerFullDetails: async (sellerId) => {
    const response = await http.get(`/admin/sellers/${sellerId}/details`);
    return response?.data !== undefined ? response.data : response;
  },

  // Buyer Details & Purchase History
  getBuyerFullDetails: async (buyerId) => {
    const response = await http.get(`/admin/buyers/${buyerId}/details`);
    return response?.data !== undefined ? response.data : response;
  },

  // User Management
  getUsers: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const response = await http.get(`/admin/users?${query}`);
    return response;
  },

  updateUserStatus: async (userId, data) => {
    const response = await http.patch(`/admin/users/${userId}`, data);
    return response?.data !== undefined ? response.data : response;
  }
};

export default adminService;

