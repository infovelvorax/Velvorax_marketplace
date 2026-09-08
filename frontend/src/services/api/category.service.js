import { http } from './apiClient';

let categoriesCache = null;
let inFlightCategoriesPromise = null;

export const categoryService = {
  getCategories: async (forceRefresh = false) => {
    if (!forceRefresh && categoriesCache && categoriesCache.length > 0) {
      return categoriesCache;
    }

    if (!forceRefresh && inFlightCategoriesPromise) {
      return inFlightCategoriesPromise;
    }

    inFlightCategoriesPromise = (async () => {
      try {
        const response = await http.get('/categories');
        const list = Array.isArray(response)
          ? response
          : (Array.isArray(response?.data) ? response.data : []);
        if (list.length > 0) {
          categoriesCache = list;
        }
        return list;
      } catch (error) {
        if (categoriesCache) return categoriesCache;
        throw error;
      } finally {
        inFlightCategoriesPromise = null;
      }
    })();

    return inFlightCategoriesPromise;
  },

  getCategoryBySlug: async (slug) => {
    const response = await http.get(`/categories/${slug}`);
    return response.data;
  }
};

