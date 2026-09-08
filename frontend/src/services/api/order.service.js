import { http } from './apiClient';

export const orderService = {
  createOrder: async (orderData) => {
    const response = await http.post('/orders', orderData);
    return response?.data !== undefined ? response.data : response;
  },

  getBuyerPurchases: async () => {
    const response = await http.get('/orders/buyer/purchases');
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response)) return response;
    return response?.data?.orders || [];
  },

  getSellerSales: async () => {
    const response = await http.get('/orders/seller/sales');
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response)) return response;
    return response?.data?.orders || [];
  },

  getAdminOrders: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const response = await http.get(`/orders/admin/all?${query}`);
    return response;
  },

  updateOrderStatus: async (orderId, statusData) => {
    const response = await http.patch(`/orders/${orderId}/status`, statusData);
    return response?.data !== undefined ? response.data : response;
  }
};

export default orderService;


