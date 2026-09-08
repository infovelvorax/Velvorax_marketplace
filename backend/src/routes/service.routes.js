import express from 'express';
import {
  bookService,
  getMyBookings,
  getProviderBookings,
  updateBookingStatus,
  addServiceReview
} from '../controllers/service.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/book', protect, bookService);
router.get('/my-bookings', protect, getMyBookings);
router.get('/provider-bookings', protect, getProviderBookings);
router.patch('/bookings/:id/status', protect, updateBookingStatus);
router.post('/bookings/:id/review', protect, addServiceReview);

export default router;
