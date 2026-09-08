import express from 'express';
import {
  createOrder,
  getBuyerOrders,
  getSellerOrders,
  getAdminOrders,
  updateOrderStatus
} from '../controllers/order.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { validateObjectId } from '../middleware/sanitize.middleware.js';

const router = express.Router();

router.post('/', protect, createOrder);
router.get('/buyer/purchases', protect, getBuyerOrders);
router.get('/seller/sales', protect, authorize('SELLER', 'ADMIN'), getSellerOrders);
router.get('/admin/all', protect, authorize('ADMIN'), getAdminOrders);
router.patch('/:id/status', protect, validateObjectId('id'), updateOrderStatus);

export default router;
