import { SavedSearch } from '../models/SavedSearch.js';

// @desc    Get all saved searches for logged in user
// @route   GET /api/marketplace/saved-searches
// @access  Private
export const getSavedSearches = async (req, res) => {
  try {
    const savedSearches = await SavedSearch.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: savedSearches });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create / Save a new search
// @route   POST /api/marketplace/saved-searches
// @access  Private
export const createSavedSearch = async (req, res) => {
  try {
    const { title, query, category, location, filters, notifyOnMatch } = req.body;

    if (!title && !query) {
      return res.status(400).json({ success: false, message: 'Please provide a search title or query' });
    }

    const saved = await SavedSearch.create({
      userId: req.user._id,
      title: title || query || 'Saved Search',
      query: query || '',
      category: category || '',
      location: location || '',
      filters: filters || {},
      notifyOnMatch: notifyOnMatch !== undefined ? notifyOnMatch : true
    });

    res.status(201).json({ success: true, data: saved, message: 'Search saved successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a saved search
// @route   DELETE /api/marketplace/saved-searches/:id
// @access  Private
export const deleteSavedSearch = async (req, res) => {
  try {
    const search = await SavedSearch.findOne({ _id: req.params.id, userId: req.user._id });
    if (!search) {
      return res.status(404).json({ success: false, message: 'Saved search not found' });
    }

    await SavedSearch.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Saved search deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle notification for a saved search
// @route   PATCH /api/marketplace/saved-searches/:id/notify
// @access  Private
export const toggleSavedSearchNotify = async (req, res) => {
  try {
    const search = await SavedSearch.findOne({ _id: req.params.id, userId: req.user._id });
    if (!search) {
      return res.status(404).json({ success: false, message: 'Saved search not found' });
    }

    search.notifyOnMatch = !search.notifyOnMatch;
    await search.save();

    res.json({ success: true, data: search, message: `Notifications ${search.notifyOnMatch ? 'enabled' : 'disabled'}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
