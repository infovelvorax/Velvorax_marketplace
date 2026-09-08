import express from 'express';
import { getCategories, getCategoryBySlug, createCategory } from '../controllers/category.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', getCategories);
router.get('/:slug', getCategoryBySlug);
router.post('/', protect, authorize('ADMIN'), createCategory);

export default router;
