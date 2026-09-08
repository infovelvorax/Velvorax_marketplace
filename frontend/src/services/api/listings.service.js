import { http } from './apiClient';
import { favoriteService } from './favorite.service';

export const listingsService = {
  getListings: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });

    const response = await http.get(`/listings?${params.toString()}`);
    return response;
  },

  getSuggestions: async (q, category) => {
    const params = new URLSearchParams();
    if (q) params.append('q', q);
    if (category && category !== 'all') params.append('category', category);
    const response = await http.get(`/listings/suggestions?${params.toString()}`);
    return response?.data !== undefined ? response.data : response;
  },

  getSavedSearches: async () => {
    const response = await http.get('/saved-searches');
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response)) return response;
    return response?.data || [];
  },

  createSavedSearch: async (searchData) => {
    const response = await http.post('/saved-searches', searchData);
    return response?.data !== undefined ? response.data : response;
  },

  deleteSavedSearch: async (id) => {
    const response = await http.delete(`/saved-searches/${id}`);
    return response?.data !== undefined ? response.data : response;
  },

  toggleSavedSearchNotify: async (id) => {
    const response = await http.patch(`/saved-searches/${id}/notify`);
    return response?.data !== undefined ? response.data : response;
  },

  getListingDetails: async (id) => {
    const response = await http.get(`/listings/${id}`);
    return response?.data !== undefined ? response.data : response;
  },

  getListingById: async (id) => {
    const response = await http.get(`/listings/${id}`);
    return response?.data !== undefined ? response.data : response;
  },

  getListing: async (id) => {
    const response = await http.get(`/listings/${id}`);
    return response?.data !== undefined ? response.data : response;
  },

  addToFavorites: async (id) => {
    return favoriteService.toggleFavorite(id);
  },

  removeFromFavorites: async (id) => {
    return favoriteService.toggleFavorite(id);
  },

  toggleFavorite: async (id) => {
    return favoriteService.toggleFavorite(id);
  },

  checkFavorite: async (id) => {
    return favoriteService.checkFavorite(id);
  },

  getSimilarListings: async (id) => {
    const response = await http.get(`/listings/${id}/similar`);
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response)) return response;
    return response?.data || [];
  },

  createListing: async (listingData) => {
    const response = await http.post('/listings', listingData);
    return response?.data !== undefined ? response.data : response;
  },

  updateListing: async (id, listingData) => {
    const response = await http.put(`/listings/${id}`, listingData);
    return response?.data !== undefined ? response.data : response;
  },

  deleteListing: async (id) => {
    const response = await http.delete(`/listings/${id}`);
    return response?.data !== undefined ? response.data : response;
  },

  deleteListingMedia: async (id, publicId) => {
    const encoded = encodeURIComponent(publicId);
    const response = await http.delete(`/listings/${id}/media/${encoded}`);
    return response?.data !== undefined ? response.data : response;
  },

  updateListingStatus: async (id, status) => {
    const response = await http.patch(`/listings/${id}/status`, { status });
    return response?.data !== undefined ? response.data : response;
  },

  getMyListings: async (status = 'ALL') => {
    const response = await http.get(`/listings/my/all?status=${status}`);
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response)) return response;
    return response?.data?.listings || [];
  }
};

export const listingService = listingsService;
export default listingsService;


