import { Category } from '../models/Category.js';

// @desc    Get all categories with subcategories
// @route   GET /api/marketplace/categories
// @access  Public
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ active: true }).sort({ order: 1, name: 1 });
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get category by slug
// @route   GET /api/marketplace/categories/:slug
// @access  Public
export const getCategoryBySlug = async (req, res) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug, active: true });
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    res.json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new category (Admin)
// @route   POST /api/marketplace/categories
// @access  Private/Admin
export const createCategory = async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
