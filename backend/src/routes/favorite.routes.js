import express from 'express';
import { getFavorites, toggleFavorite, checkFavorite } from '../controllers/favorite.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { validateObjectId } from '../middleware/sanitize.middleware.js';

const router = express.Router();

router.get('/', protect, getFavorites);
router.post('/toggle/:listingId', protect, validateObjectId('listingId'), toggleFavorite);
router.get('/check/:listingId', protect, validateObjectId('listingId'), checkFavorite);

export default router;
