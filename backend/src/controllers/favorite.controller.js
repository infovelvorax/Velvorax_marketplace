import { Favorite } from '../models/Favorite.js';
import { Listing } from '../models/Listing.js';

// @desc    Get all favorites for logged in user
// @route   GET /api/marketplace/favorites
// @access  Private
export const getFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.find({ userId: req.user._id })
      .populate({
        path: 'listingId',
        populate: [
          { path: 'sellerId', select: 'name profilePhoto rating verificationStatus' },
          { path: 'categoryId', select: 'name slug icon' }
        ]
      })
      .sort({ createdAt: -1 });

    const validListings = favorites
      .filter(f => f.listingId != null)
      .map(f => f.listingId);

    res.json({ success: true, data: validListings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle favorite on a listing
// @route   POST /api/marketplace/favorites/toggle/:listingId
// @access  Private
export const toggleFavorite = async (req, res) => {
  try {
    const { listingId } = req.params;
    const existing = await Favorite.findOne({ userId: req.user._id, listingId });

    if (existing) {
      await Favorite.findByIdAndDelete(existing._id);
      await Listing.findByIdAndUpdate(listingId, { $inc: { favoritesCount: -1 } });
      return res.json({ success: true, isFavorite: false, message: 'Removed from favorites' });
    } else {
      await Favorite.create({ userId: req.user._id, listingId });
      await Listing.findByIdAndUpdate(listingId, { $inc: { favoritesCount: 1 } });
      return res.json({ success: true, isFavorite: true, message: 'Added to favorites' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Check if a listing is favorited
// @route   GET /api/marketplace/favorites/check/:listingId
// @access  Private
export const checkFavorite = async (req, res) => {
  try {
    const existing = await Favorite.findOne({ userId: req.user._id, listingId: req.params.listingId });
    res.json({ success: true, isFavorite: !!existing });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
