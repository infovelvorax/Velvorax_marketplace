import express from 'express';
import {
  getListings,
  getSearchSuggestions,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
  deleteListingMedia,
  updateListingStatus,
  getMyListings,
  getSimilarListings
} from '../controllers/listing.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { rateLimitListings } from '../middleware/rateLimit.middleware.js';
import { validateObjectId } from '../middleware/sanitize.middleware.js';

const router = express.Router();

router.get('/', getListings);
router.get('/suggestions', getSearchSuggestions);
router.get('/my/all', protect, getMyListings);
router.get('/:id', validateObjectId('id'), getListingById);
router.get('/:id/similar', validateObjectId('id'), getSimilarListings);
router.post('/', protect, rateLimitListings, createListing);
router.put('/:id', protect, validateObjectId('id'), updateListing);
router.delete('/:id', protect, validateObjectId('id'), deleteListing);
router.delete('/:id/media/:publicId', protect, validateObjectId('id'), deleteListingMedia);
router.patch('/:id/status', protect, validateObjectId('id'), updateListingStatus);

export default router;
