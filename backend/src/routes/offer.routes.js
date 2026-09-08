import express from 'express';
import { makeOffer, respondOffer, getMyOffers } from '../controllers/offer.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { validateObjectId } from '../middleware/sanitize.middleware.js';

const router = express.Router();

router.post('/', protect, makeOffer);
router.get('/my', protect, getMyOffers);
router.patch('/:id/respond', protect, validateObjectId('id'), respondOffer);

export default router;
