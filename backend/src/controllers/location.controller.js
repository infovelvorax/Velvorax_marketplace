import { Location } from '../models/Location.js';

// @desc    Get all active countries, regions, and cities
// @route   GET /api/marketplace/locations
// @access  Public
export const getLocations = async (req, res) => {
  try {
    const locations = await Location.find({ active: true })
      .sort({ popular: -1, countryName: 1 })
      .lean();
    res.json({ success: true, data: locations || [] });
  } catch (error) {
    console.error('Error fetching locations:', error.message);
    res.status(500).json({ success: false, message: 'Failed to retrieve locations' });
  }
};

// @desc    Get popular cities across all regions
// @route   GET /api/marketplace/locations/popular-cities
// @access  Public
export const getPopularCities = async (req, res) => {
  try {
    const locations = await Location.find({ active: true }).lean();
    const popularCities = [];

    (locations || []).forEach(loc => {
      (loc.regions || []).forEach(reg => {
        (reg.cities || []).forEach(city => {
          if (city.popular) {
            popularCities.push({
              countryName: loc.countryName,
              countryCode: loc.countryCode,
              currency: loc.currency,
              currencySymbol: loc.currencySymbol,
              regionName: reg.name,
              cityName: city.name,
              slug: city.slug
            });
          }
        });
      });
    });

    res.json({ success: true, data: popularCities });
  } catch (error) {
    console.error('Error fetching popular cities:', error.message);
    res.status(500).json({ success: false, message: 'Failed to retrieve popular cities' });
  }
};

