import express from 'express';
import {
  applyJob,
  getMyApplications,
  getEmployerApplications,
  updateApplicationStatus
} from '../controllers/job.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/apply', protect, applyJob);
router.get('/my-applications', protect, getMyApplications);
router.get('/employer-applications', protect, getEmployerApplications);
router.patch('/applications/:id/status', protect, updateApplicationStatus);

export default router;
