import express from 'express';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
} from '../controllers/notification.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { validateObjectId } from '../middleware/sanitize.middleware.js';

const router = express.Router();

router.get('/', protect, getNotifications);
router.patch('/mark-all-read', protect, markAllAsRead);
router.patch('/:id/read', protect, validateObjectId('id'), markAsRead);
router.delete('/:id', protect, validateObjectId('id'), deleteNotification);

export default router;
