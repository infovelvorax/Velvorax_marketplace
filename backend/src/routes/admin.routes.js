import express from 'express';
import {
  adminLogin,
  verifyAdminPin,
  initiateAdminLogin,
  verifyAdmin2FA,
  resendAdmin2FA,
  getAdminStats,
  getPendingListings,
  moderateListing,
  getSellers,
  moderateSeller,
  getBuyers,
  getSellerVerifications,
  moderateSellerVerification,
  getUsers,
  updateUserStatus,
  getConsolidationReport,
  getSellerFullDetails,
  getBuyerFullDetails
} from '../controllers/admin.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { rateLimitAdminAuth } from '../middleware/rateLimit.middleware.js';
import { validateObjectId } from '../middleware/sanitize.middleware.js';

const router = express.Router();

// Dedicated Admin Authentication (Public, Admin portal only)
router.post('/auth/verify-pin', rateLimitAdminAuth, verifyAdminPin);
router.post('/auth/login-init', rateLimitAdminAuth, initiateAdminLogin);
router.post('/auth/verify-2fa', rateLimitAdminAuth, verifyAdmin2FA);
router.post('/auth/resend-2fa', rateLimitAdminAuth, resendAdmin2FA);
router.post('/auth/login', rateLimitAdminAuth, adminLogin);
router.post('/login', rateLimitAdminAuth, adminLogin);

// All subsequent admin dashboard and management routes require authenticated ADMIN role
router.use(protect);
router.use(authorize('ADMIN'));

router.get('/stats', getAdminStats);
router.get('/dashboard/stats', getAdminStats);
router.get('/consolidation', getConsolidationReport);

router.get('/moderation', getPendingListings);
router.patch('/listings/:id/moderate', validateObjectId('id'), moderateListing);

router.get('/sellers', getSellers);
router.get('/sellers/:id/details', validateObjectId('id'), getSellerFullDetails);
router.patch('/sellers/:id/moderate', validateObjectId('id'), moderateSeller);
router.patch('/sellers/:id/status', validateObjectId('id'), moderateSeller);

router.get('/buyers', getBuyers);
router.get('/buyers/:id/details', validateObjectId('id'), getBuyerFullDetails);

router.get('/verifications', getSellerVerifications);
router.patch('/verifications/:id/moderate', validateObjectId('id'), moderateSellerVerification);

router.get('/users', getUsers);
router.patch('/users/:id', validateObjectId('id'), updateUserStatus);

export default router;

