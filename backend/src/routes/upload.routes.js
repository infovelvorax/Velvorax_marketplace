import express from 'express';
import { upload, uploadFiles } from '../controllers/upload.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { rateLimitUploads } from '../middleware/rateLimit.middleware.js';

const router = express.Router();

router.post('/', protect, rateLimitUploads, upload.array('files', 3), uploadFiles);

export default router;
