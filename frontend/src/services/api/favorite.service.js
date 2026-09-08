import { http } from './apiClient';

export const favoriteService = {
  getFavorites: async () => {
    const response = await http.get('/favorites');
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response)) return response;
    return response?.data?.favorites || [];
  },

  toggleFavorite: async (listingId) => {
    const response = await http.post(`/favorites/toggle/${listingId}`);
    return response?.data !== undefined ? response.data : response;
  },

  checkFavorite: async (listingId) => {
    const response = await http.get(`/favorites/check/${listingId}`);
    return response?.isFavorite !== undefined ? response.isFavorite : (response?.data?.isFavorite || false);
  }
};

export default favoriteService;


