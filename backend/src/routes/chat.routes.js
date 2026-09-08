import express from 'express';
import {
  getConversations,
  getOrCreateConversation,
  getMessages,
  sendMessage
} from '../controllers/chat.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { rateLimitMessages } from '../middleware/rateLimit.middleware.js';
import { validateObjectId } from '../middleware/sanitize.middleware.js';

const router = express.Router();

router.get('/', protect, getConversations);
router.post('/', protect, getOrCreateConversation);
router.get('/:id/messages', protect, validateObjectId('id'), getMessages);
router.post('/:id/messages', protect, validateObjectId('id'), rateLimitMessages, sendMessage);

export default router;
