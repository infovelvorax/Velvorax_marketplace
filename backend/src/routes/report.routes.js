import express from 'express';
import { createReport, getReports, updateReportStatus } from '../controllers/report.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { validateObjectId } from '../middleware/sanitize.middleware.js';

const router = express.Router();

router.post('/', protect, createReport);
router.get('/', protect, authorize('ADMIN', 'MODERATOR'), getReports);
router.patch('/:id', protect, authorize('ADMIN', 'MODERATOR'), validateObjectId('id'), updateReportStatus);
router.patch('/:id/resolve', protect, authorize('ADMIN', 'MODERATOR'), validateObjectId('id'), updateReportStatus);
router.post('/:id/resolve', protect, authorize('ADMIN', 'MODERATOR'), validateObjectId('id'), updateReportStatus);

export default router;
