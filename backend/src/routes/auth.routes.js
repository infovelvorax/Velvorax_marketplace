import express from 'express';
import { 
  registerUser, 
  loginUser, 
  loginBuyer,
  loginSeller,
  logoutUser, 
  getMe, 
  updateProfile, 
  changePassword,
  getSellerProfile,
  forgotPassword,
  verifyOTP,
  resetPassword,
  getSellerVerificationStatus,
  submitSellerVerification,
  switchActiveCategory
} from '../controllers/auth.controller.js';
import {
  verifyAdminPin,
  initiateAdminLogin,
  verifyAdmin2FA,
  resendAdmin2FA,
  adminLogin
} from '../controllers/admin.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { rateLimitAuth, rateLimitAdminAuth, rateLimitOtp } from '../middleware/rateLimit.middleware.js';
import { validateObjectId } from '../middleware/sanitize.middleware.js';

const router = express.Router();

router.post('/register', rateLimitAuth, registerUser);
router.post('/login', rateLimitAuth, loginUser);
router.post('/buyer/login', rateLimitAuth, loginBuyer);
router.post('/seller/login', rateLimitAuth, loginSeller);
router.post('/logout', logoutUser);
router.post('/forgot-password', rateLimitOtp, forgotPassword);
router.post('/verify-otp', rateLimitOtp, verifyOTP);
router.post('/reset-password', rateLimitOtp, resetPassword);

// Dedicated Admin Gateway Authentication
router.post('/admin/verify-pin', rateLimitAdminAuth, verifyAdminPin);
router.post('/admin/login-init', rateLimitAdminAuth, initiateAdminLogin);
router.post('/admin/verify-2fa', rateLimitAdminAuth, verifyAdmin2FA);
router.post('/admin/resend-2fa', rateLimitAdminAuth, resendAdmin2FA);
router.post('/admin/login', rateLimitAdminAuth, adminLogin);

// Protected authenticated routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/switch-category', protect, switchActiveCategory);
router.post('/change-password', protect, changePassword);
router.get('/verification', protect, getSellerVerificationStatus);
router.post('/verification', protect, submitSellerVerification);
router.get('/seller/:id', validateObjectId('id'), getSellerProfile);

export default router;
