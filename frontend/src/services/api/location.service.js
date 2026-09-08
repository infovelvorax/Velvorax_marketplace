import { http } from './apiClient';

let locationsCache = null;
let inFlightLocationsPromise = null;
let popularCitiesCache = null;
let inFlightPopularCitiesPromise = null;

export const locationService = {
  getLocations: async (forceRefresh = false) => {
    if (!forceRefresh && locationsCache && locationsCache.length > 0) {
      return locationsCache;
    }

    if (!forceRefresh && inFlightLocationsPromise) {
      return inFlightLocationsPromise;
    }

    inFlightLocationsPromise = (async () => {
      try {
        const response = await http.get('/locations');
        const list = Array.isArray(response)
          ? response
          : (Array.isArray(response?.data) ? response.data : []);
        if (list.length > 0) {
          locationsCache = list;
        }
        return list;
      } catch (error) {
        if (locationsCache) return locationsCache;
        throw error;
      } finally {
        inFlightLocationsPromise = null;
      }
    })();

    return inFlightLocationsPromise;
  },

  getPopularCities: async (forceRefresh = false) => {
    if (!forceRefresh && popularCitiesCache && popularCitiesCache.length > 0) {
      return popularCitiesCache;
    }

    if (!forceRefresh && inFlightPopularCitiesPromise) {
      return inFlightPopularCitiesPromise;
    }

    inFlightPopularCitiesPromise = (async () => {
      try {
        const response = await http.get('/locations/popular-cities');
        const list = Array.isArray(response)
          ? response
          : (Array.isArray(response?.data) ? response.data : []);
        if (list.length > 0) {
          popularCitiesCache = list;
        }
        return list;
      } catch (error) {
        if (popularCitiesCache) return popularCitiesCache;
        throw error;
      } finally {
        inFlightPopularCitiesPromise = null;
      }
    })();

    return inFlightPopularCitiesPromise;
  }
};

