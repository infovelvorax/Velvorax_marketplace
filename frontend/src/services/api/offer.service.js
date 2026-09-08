import { http } from './apiClient';

export const offerService = {
  makeOffer: async (offerData) => {
    const response = await http.post('/offers', offerData);
    return response?.data !== undefined ? response.data : response;
  },

  createOffer: async (offerData) => {
    return offerService.makeOffer(offerData);
  },

  getMyOffers: async () => {
    const response = await http.get('/offers/my');
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response)) return response;
    return response?.data?.offers || [];
  },

  respondOffer: async (offerId, responseData) => {
    const response = await http.patch(`/offers/${offerId}/respond`, responseData);
    return response?.data !== undefined ? response.data : response;
  }
};

export default offerService;

