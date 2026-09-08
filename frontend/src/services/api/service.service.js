import { http } from './apiClient';

export const serviceMarketplaceService = {
  bookService: async (bookingData) => {
    const response = await http.post('/services/book', bookingData);
    return response?.data !== undefined ? response.data : response;
  },

  getMyBookings: async () => {
    const response = await http.get('/services/my-bookings');
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response)) return response;
    return response?.data?.bookings || [];
  },

  getProviderBookings: async () => {
    const response = await http.get('/services/provider-bookings');
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response)) return response;
    return response?.data?.bookings || [];
  },

  updateBookingStatus: async (bookingId, status) => {
    const response = await http.patch(`/services/bookings/${bookingId}/status`, { status });
    return response?.data !== undefined ? response.data : response;
  },

  addReview: async (bookingId, reviewData) => {
    const response = await http.post(`/services/bookings/${bookingId}/review`, reviewData);
    return response?.data !== undefined ? response.data : response;
  }
};

export default serviceMarketplaceService;

