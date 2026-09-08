import crypto from 'crypto';
import { User } from '../models/User.js';
import { SellerVerification } from '../models/SellerVerification.js';
import { generateToken } from '../utils/generateToken.js';
import { normalizeEmail } from '../utils/normalizeEmail.js';
import { validatePhoneNumber } from '../utils/phoneValidator.js';
import { sendPasswordResetOtpEmail } from '../services/email.service.js';
import { MARKETPLACE_CATEGORIES, DEFAULT_MARKETPLACE_CATEGORY, normalizeCategorySlug } from '../config/categories.js';
import bcrypt from 'bcryptjs';

// @desc    Register new user
// @route   POST /api/marketplace/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { 
      name, 
      email, 
      password, 
      phone, 
      country, 
      countryCode,
      state,
      region, 
      city, 
      localArea,
      role, 
      category,
      sellerCategory, 
      companyName, 
      businessType 
    } = req.body;
    
    if (!name || !email || !password || typeof name !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ 
        success: false, 
        code: 'VALIDATION_ERROR', 
        message: 'Please provide valid name, email, and password' 
      });
    }

    // Enforce password length policy
    if (password.length > 128) {
      return res.status(400).json({ 
        success: false, 
        code: 'PASSWORD_TOO_LONG', 
        message: 'Password must not exceed 128 characters.' 
      });
    }
    if (password.length < 8) {
      return res.status(400).json({ 
        success: false, 
        code: 'PASSWORD_TOO_SHORT', 
        message: 'Password must be at least 8 characters long.' 
      });
    }

    // Phone number validation (if provided)
    let validatedPhone = '';
    if (phone) {
      const phoneResult = validatePhoneNumber(phone, false);
      if (!phoneResult.isValid) {
        return res.status(400).json({ 
          success: false, 
          code: 'INVALID_PHONE', 
          message: phoneResult.error || 'Please enter a valid phone number.' 
        });
      }
      validatedPhone = phoneResult.normalized;
    }

    // Email normalization and duplicate checking
    const normalizedEmail = normalizeEmail(email);
    const userExists = await User.findOne({ emailNormalized: normalizedEmail });
    if (userExists) {
      return res.status(400).json({ 
        success: false, 
        code: 'EMAIL_ALREADY_EXISTS', 
        message: 'An account with this email already exists. Please sign in.' 
      });
    }

    // Role assignment: SELLER starts as PENDING_APPROVAL, others default to BUYER.
    const requestedRole = (role || 'BUYER').toUpperCase();
    const isSeller = requestedRole === 'SELLER';
    const finalRole = isSeller ? 'SELLER' : 'BUYER';
    const sellerStatus = isSeller ? 'PENDING_APPROVAL' : 'NOT_APPLICABLE';

    // Seller KYC Verification Validation (Aadhaar & PAN)
    let aadhaarMasked = '';
    let panMasked = '';

    if (isSeller) {
      const { aadhaarNumber, panNumber } = req.body;

      if (!aadhaarNumber || typeof aadhaarNumber !== 'string' && typeof aadhaarNumber !== 'number') {
        return res.status(400).json({
          success: false,
          code: 'AADHAAR_REQUIRED',
          message: 'Aadhaar Card Number is required for seller verification.'
        });
      }

      const cleanAadhaar = String(aadhaarNumber).replace(/\s+/g, '');
      if (!/^\d{12}$/.test(cleanAadhaar)) {
        return res.status(400).json({
          success: false,
          code: 'INVALID_AADHAAR',
          message: 'Invalid Aadhaar Number. Must be exactly 12 digits.'
        });
      }

      if (!panNumber || typeof panNumber !== 'string') {
        return res.status(400).json({
          success: false,
          code: 'PAN_REQUIRED',
          message: 'PAN Card Number is required for seller verification.'
        });
      }

      const cleanPan = String(panNumber).trim().toUpperCase();
      if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(cleanPan)) {
        return res.status(400).json({
          success: false,
          code: 'INVALID_PAN',
          message: 'Invalid PAN Number format. Must be 5 letters, 4 digits, 1 letter (e.g. ABCDE1234F).'
        });
      }

      aadhaarMasked = `XXXX XXXX ${cleanAadhaar.slice(-4)}`;
      panMasked = `XXXXX${cleanPan.slice(5, 9)}${cleanPan.slice(-1)}`;
    }

    const effectiveState = state || region || '';
    const initialCategory = normalizeCategorySlug(category || sellerCategory || DEFAULT_MARKETPLACE_CATEGORY);

    const user = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      emailNormalized: normalizedEmail,
      passwordHash: password, // Pre-save hook hashes it
      phone: validatedPhone,
      role: finalRole,
      sellerCategory: initialCategory,
      activeCategory: initialCategory,
      enabledCategories: MARKETPLACE_CATEGORIES,
      companyName: companyName || '',
      businessType: businessType || '',
      sellerStatus,
      accountStatus: 'ACTIVE',
      verificationStatus: isSeller ? 'PENDING' : 'UNVERIFIED',
      verification: isSeller ? {
        aadhaarMasked,
        panMasked,
        status: 'PENDING',
        submittedAt: new Date(),
        reviewedAt: null,
        reviewedBy: null,
        rejectionReason: ''
      } : {
        aadhaarMasked: '',
        panMasked: '',
        status: 'UNVERIFIED',
        submittedAt: null,
        reviewedAt: null,
        reviewedBy: null,
        rejectionReason: ''
      },
      location: {
        country: country || 'India',
        countryCode: countryCode || (country === 'India' ? 'IN' : 'US'),
        state: effectiveState,
        region: effectiveState,
        city: city || '',
        localArea: localArea || ''
      }
    });

    if (user) {
      if (user.role === 'SELLER') {
        console.log(`[Auth] Seller (${user.sellerCategory || 'properties'}) registration successful: ${user._id}`);
        // Create matching SellerVerification record for admin queue
        try {
          await SellerVerification.create({
            sellerId: user._id,
            sellerType: 'INDIVIDUAL',
            businessName: companyName || '',
            aadhaarMasked,
            panMasked,
            documentType: 'AADHAAR',
            status: 'PENDING'
          });
        } catch (verifErr) {
          console.error('[Auth] Failed to create SellerVerification record:', verifErr);
        }
      }
      const token = generateToken(user._id, user.role);
      res.status(201).json({
        success: true,
        message: isSeller
          ? 'Seller account created successfully. Your account is pending admin approval. You can create/manage your information, but listings cannot be published until your account is approved.'
          : 'User account created successfully.',
        data: {
          id: user._id,
          _id: user._id,
          name: user.name,
          email: user.email,
          emailNormalized: user.emailNormalized,
          role: user.role,
          sellerCategory: user.sellerCategory,
          activeCategory: user.activeCategory || initialCategory,
          enabledCategories: user.enabledCategories || MARKETPLACE_CATEGORIES,
          availableCategories: user.enabledCategories || MARKETPLACE_CATEGORIES,
          companyName: user.companyName,
          businessType: user.businessType,
          sellerStatus: user.sellerStatus,
          accountStatus: user.accountStatus,
          phone: user.phone,
          location: user.location,
          verificationStatus: user.verificationStatus,
          token,
        },
        token
      });
    } else {
      res.status(400).json({ success: false, code: 'INVALID_USER_DATA', message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Register error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        code: 'EMAIL_ALREADY_EXISTS', 
        message: 'An account with this email already exists' 
      });
    }
    res.status(500).json({ success: false, code: 'SERVER_ERROR', message: error.message || 'Registration failed' });
  }
};


// Helper to execute role-verified login
const handleRoleVerifiedLogin = async (req, res, requestedRole) => {
  const { email, password, username, expectedRole } = req.body;
  const targetRole = (requestedRole || expectedRole || '').toUpperCase();

  const rawIdentifier = email || username;
  if (!rawIdentifier || !password || typeof rawIdentifier !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ 
      success: false, 
      code: 'VALIDATION_ERROR', 
      message: 'Please provide a valid email/username and password' 
    });
  }

  // Reject passwords that exceed maximum length before bcrypt comparisons
  if (password.length > 128) {
    return res.status(400).json({ 
      success: false, 
      code: 'PASSWORD_TOO_LONG', 
      message: 'Password must not exceed 128 characters.' 
    });
  }

  const trimmedInput = rawIdentifier.trim();
  const normalizedEmail = normalizeEmail(trimmedInput);
  const lowercaseInput = trimmedInput.toLowerCase();

  // Query user by normalized email, direct lowercase email, username, or case-insensitive exact name
  const user = await User.findOne({
    $or: [
      { emailNormalized: normalizedEmail },
      { email: lowercaseInput },
      { username: lowercaseInput },
      { name: { $regex: new RegExp(`^${trimmedInput.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } }
    ]
  });

  if (!user) {
    return res.status(401).json({ success: false, code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' });
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return res.status(401).json({ success: false, code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' });
  }

  const actualRole = (user.role || 'BUYER').toUpperCase();

  // 1. Strict Role Validation for BUYER login
  if (targetRole === 'BUYER' || targetRole === 'USER') {
    if (actualRole === 'SELLER') {
      return res.status(403).json({
        success: false,
        code: 'FORBIDDEN_ROLE',
        message: 'These credentials belong to a Seller account. Please use Seller Login.'
      });
    }
    if (actualRole === 'ADMIN') {
      return res.status(403).json({
        success: false,
        code: 'FORBIDDEN_ROLE',
        message: 'Admin accounts must use Admin Login.'
      });
    }
    if (actualRole !== 'BUYER' && actualRole !== 'USER') {
      return res.status(403).json({
        success: false,
        code: 'FORBIDDEN_ROLE',
        message: 'These credentials are not authorized for Buyer Login.'
      });
    }
  }

  // 2. Strict Role Validation for SELLER login
  if (targetRole === 'SELLER') {
    if (actualRole === 'BUYER' || actualRole === 'USER') {
      return res.status(403).json({
        success: false,
        code: 'FORBIDDEN_ROLE',
        message: 'These credentials belong to a Buyer account. Please use Buyer Login.'
      });
    }
    if (actualRole === 'ADMIN') {
      return res.status(403).json({
        success: false,
        code: 'FORBIDDEN_ROLE',
        message: 'Admin accounts must use Admin Login.'
      });
    }
    if (actualRole !== 'SELLER') {
      return res.status(403).json({
        success: false,
        code: 'FORBIDDEN_ROLE',
        message: 'These credentials are not authorized for Seller Login.'
      });
    }
  }

  // 3. Strict Role Validation for ADMIN login
  if (targetRole === 'ADMIN') {
    if (actualRole !== 'ADMIN') {
      return res.status(401).json({
        success: false,
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid admin credentials.'
      });
    }
  }

  // Default isolation: If no targetRole was provided, do not allow ADMIN via public login
  if (!targetRole && actualRole === 'ADMIN') {
    return res.status(403).json({
      success: false,
      code: 'FORBIDDEN_ROLE',
      message: 'Admin accounts must use Admin Login.'
    });
  }

  // Check account status
  if (user.isSuspended || user.accountStatus === 'SUSPENDED' || user.accountStatus === 'BLOCKED') {
    return res.status(403).json({ 
      success: false, 
      code: 'ACCOUNT_SUSPENDED', 
      message: 'Your account has been suspended. Please contact support.' 
    });
  }

  // Resolve active category for seller
  let resolvedActiveCategory = 'properties';
  const requestedCat = req.body.category || req.body.sellerCategory || req.body.activeCategory;
  if (actualRole === 'SELLER') {
    resolvedActiveCategory = normalizeCategorySlug(requestedCat || user.activeCategory || user.sellerCategory || 'properties');
    const enabledCategories = (user.enabledCategories && user.enabledCategories.length > 0)
      ? user.enabledCategories
      : MARKETPLACE_CATEGORIES;

    user.activeCategory = resolvedActiveCategory;
    user.enabledCategories = enabledCategories;
    await User.updateOne(
      { _id: user._id },
      { $set: { activeCategory: resolvedActiveCategory, enabledCategories: enabledCategories } }
    );
    console.log(`[Auth] Seller (${resolvedActiveCategory}) login successful: ${user._id} (Status: ${user.sellerStatus})`);
  }

  const token = generateToken(user._id, user.role);
  res.json({
    success: true,
    token,
    data: {
      id: user._id,
      _id: user._id,
      name: user.name,
      email: user.email,
      emailNormalized: user.emailNormalized,
      role: user.role,
      sellerCategory: user.sellerCategory || resolvedActiveCategory,
      activeCategory: resolvedActiveCategory,
      enabledCategories: user.enabledCategories || MARKETPLACE_CATEGORIES,
      availableCategories: user.enabledCategories || MARKETPLACE_CATEGORIES,
      companyName: user.companyName,
      businessType: user.businessType,
      sellerStatus: user.sellerStatus,
      accountStatus: user.accountStatus,
      phone: user.phone,
      profilePhoto: user.profilePhoto,
      location: user.location,
      shippingAddress: user.shippingAddress,
      preferences: user.preferences,
      bio: user.bio,
      social: user.social,
      verificationStatus: user.verificationStatus,
      createdAt: user.createdAt,
      token,
    }
  });
};

// @desc    Switch active category for seller
// @route   POST /api/marketplace/auth/switch-category
// @access  Private
export const switchActiveCategory = async (req, res) => {
  try {
    const { category } = req.body;
    if (!category) {
      return res.status(400).json({ success: false, message: 'Category is required' });
    }
    const normalized = normalizeCategorySlug(category);
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    user.activeCategory = normalized;
    if (!user.enabledCategories || user.enabledCategories.length === 0) {
      user.enabledCategories = MARKETPLACE_CATEGORIES;
    }
    await user.save();
    res.json({
      success: true,
      activeCategory: normalized,
      availableCategories: user.enabledCategories,
      message: `Switched active category to ${normalized}`
    });
  } catch (error) {
    console.error('switchActiveCategory error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to switch category' });
  }
};

// @desc    Auth user & get token (Generic login with optional expectedRole)
// @route   POST /api/marketplace/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    await handleRoleVerifiedLogin(req, res, req.body.expectedRole || req.body.role);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, code: 'SERVER_ERROR', message: error.message || 'Login failed' });
  }
};

// @desc    Auth Buyer only
// @route   POST /api/marketplace/auth/buyer/login
// @access  Public
export const loginBuyer = async (req, res) => {
  try {
    await handleRoleVerifiedLogin(req, res, 'BUYER');
  } catch (error) {
    console.error('Buyer login error:', error);
    res.status(500).json({ success: false, code: 'SERVER_ERROR', message: error.message || 'Buyer login failed' });
  }
};

// @desc    Auth Seller only
// @route   POST /api/marketplace/auth/seller/login
// @access  Public
export const loginSeller = async (req, res) => {
  try {
    await handleRoleVerifiedLogin(req, res, 'SELLER');
  } catch (error) {
    console.error('Seller login error:', error);
    res.status(500).json({ success: false, code: 'SERVER_ERROR', message: error.message || 'Seller login failed' });
  }
};


// @desc    Logout user / clear session
// @route   POST /api/marketplace/auth/logout
// @access  Public
export const logoutUser = async (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
};

// @desc    Get current user profile
// @route   GET /api/marketplace/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash');
    if (user) {
      res.json({ success: true, data: user });
    } else {
      res.status(404).json({ success: false, code: 'USER_NOT_FOUND', message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, code: 'SERVER_ERROR', message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/marketplace/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, code: 'USER_NOT_FOUND', message: 'User not found' });
    }

    const {
      name,
      phone,
      bio,
      profilePhoto,
      location,
      social,
      shippingAddress,
      preferences,
      companyName,
      businessType,
      sellerCategory
    } = req.body;

    if (name && typeof name === 'string') user.name = name.trim().slice(0, 100);
    if (phone !== undefined) {
      if (phone) {
        const phoneResult = validatePhoneNumber(phone, false);
        if (!phoneResult.isValid) {
          return res.status(400).json({ 
            success: false, 
            code: 'INVALID_PHONE', 
            message: phoneResult.error || 'Please enter a valid phone number.' 
          });
        }
        user.phone = phoneResult.normalized;
      } else {
        user.phone = '';
      }
    }
    if (bio !== undefined) user.bio = String(bio).slice(0, 500);
    if (profilePhoto !== undefined && typeof profilePhoto === 'string') user.profilePhoto = profilePhoto;
    if (location && typeof location === 'object') {
      user.location = { 
        ...user.location, 
        ...location,
        state: location.state || location.region || user.location.state || user.location.region || '',
        region: location.region || location.state || user.location.region || user.location.state || ''
      };
    }
    if (social && typeof social === 'object') user.social = { ...user.social, ...social };
    if (shippingAddress && typeof shippingAddress === 'object') user.shippingAddress = { ...user.shippingAddress, ...shippingAddress };
    if (preferences && typeof preferences === 'object') user.preferences = { ...user.preferences, ...preferences };

    if (user.role === 'SELLER') {
      if (companyName && typeof companyName === 'string') user.companyName = companyName.trim().slice(0, 150);
      if (businessType && typeof businessType === 'string') user.businessType = businessType.trim().slice(0, 50);
      if (sellerCategory && typeof sellerCategory === 'string') user.sellerCategory = sellerCategory.trim().slice(0, 50);
    }

    // Role, sellerStatus, accountStatus, isSuspended, verificationStatus, passwordHash are strictly immutable here.
    await user.save();

    res.json({
      success: true,
      data: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        emailNormalized: user.emailNormalized,
        role: user.role,
        phone: user.phone,
        bio: user.bio,
        profilePhoto: user.profilePhoto,
        location: user.location,
        social: user.social,
        shippingAddress: user.shippingAddress,
        preferences: user.preferences,
        companyName: user.companyName,
        businessType: user.businessType,
        sellerCategory: user.sellerCategory,
        verificationStatus: user.verificationStatus,
        sellerStatus: user.sellerStatus,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, code: 'SERVER_ERROR', message: error.message });
  }
};


// @desc    Change user password
// @route   POST /api/marketplace/auth/change-password
// @access  Private
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, code: 'VALIDATION_ERROR', message: 'Please provide both current and new password' });
    }

    if (typeof newPassword !== 'string' || newPassword.length < 8) {
      return res.status(400).json({ success: false, code: 'PASSWORD_TOO_SHORT', message: 'New password must be at least 8 characters long' });
    }

    if (newPassword.length > 128) {
      return res.status(400).json({ success: false, code: 'PASSWORD_TOO_LONG', message: 'Password must not exceed 128 characters.' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, code: 'USER_NOT_FOUND', message: 'User account not found' });
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, code: 'INVALID_PASSWORD', message: 'Current password is incorrect' });
    }

    user.passwordHash = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, code: 'SERVER_ERROR', message: error.message || 'Server error changing password' });
  }
};

// @desc    Get public seller profile
// @route   GET /api/marketplace/auth/seller/:id
// @access  Public
export const getSellerProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-passwordHash -email -emailNormalized -verification -resetPasswordOtp -resetPasswordToken -resetPasswordExpire');
    if (!user) {
      return res.status(404).json({ success: false, code: 'SELLER_NOT_FOUND', message: 'Seller not found' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, code: 'SERVER_ERROR', message: error.message });
  }
};

// @desc    Forgot Password - generate secure OTP and send to user's registered email
// @route   POST /api/marketplace/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.trim() || typeof email !== 'string') {
      return res.status(400).json({ success: false, code: 'EMAIL_REQUIRED', message: 'Please provide a valid email address' });
    }

    const normalizedEmail = normalizeEmail(email);
    const user = await User.findOne({ emailNormalized: normalizedEmail });

    // Reject unknown email address with clear safe warning
    if (!user) {
      return res.status(404).json({
        success: false,
        code: 'ACCOUNT_NOT_FOUND',
        message: 'No account was found with this email address.'
      });
    }

    if (user.isSuspended || user.accountStatus === 'SUSPENDED' || user.accountStatus === 'BLOCKED') {
      return res.status(403).json({
        success: false,
        code: 'ACCOUNT_SUSPENDED',
        message: 'Your account has been suspended. Please contact support.'
      });
    }

    // Cryptographically secure 6-digit random OTP
    const otp = crypto.randomInt(100000, 1000000).toString();
    
    // Store OTP and set 10-minute expiration
    user.resetPasswordOtp = otp;
    user.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000);
    user.resetPasswordToken = null; // Invalidate any previous reset token
    await user.save();

    // Dispatch verification code to recipient's email address
    const emailResult = await sendPasswordResetOtpEmail({
      to: user.email,
      otp,
      name: user.name
    });

    if (!emailResult.success) {
      console.error(`Failed to send password reset email: ${emailResult.error}`);
      return res.status(500).json({
        success: false,
        code: 'EMAIL_DELIVERY_FAILED',
        message: 'Failed to deliver verification code email. Please try again later.'
      });
    }

    res.json({
      success: true,
      message: 'A 6-digit verification code has been sent to your email.'
    });
  } catch (error) {
    console.error('Forgot password error:', error.message);
    res.status(500).json({ success: false, code: 'SERVER_ERROR', message: 'Failed to process password reset request. Please try again later.' });
  }
};

// @desc    Verify OTP for password reset
// @route   POST /api/marketplace/auth/verify-otp
// @access  Public
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, code: 'VALIDATION_ERROR', message: 'Email address and verification code are required' });
    }

    const normalizedEmail = normalizeEmail(email);
    const cleanOtp = otp.toString().trim();

    const user = await User.findOne({
      emailNormalized: normalizedEmail,
      resetPasswordOtp: cleanOtp,
      resetPasswordExpire: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        code: 'INVALID_OTP',
        message: 'Invalid or expired verification code. Please request a new code.'
      });
    }

    // Generate secure temporary reset token (32 bytes hex)
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Invalidate the one-time OTP immediately to prevent reuse
    user.resetPasswordOtp = null;
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = new Date(Date.now() + 15 * 60 * 1000); // 15 mins for password setting
    await user.save();

    res.json({
      success: true,
      message: 'Verification code confirmed successfully.',
      data: {
        resetToken
      }
    });
  } catch (error) {
    console.error('Verify OTP error:', error.message);
    res.status(500).json({ success: false, code: 'SERVER_ERROR', message: 'Failed to verify verification code' });
  }
};

// @desc    Reset password using valid reset session token
// @route   POST /api/marketplace/auth/reset-password
// @access  Public
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !token.trim()) {
      return res.status(400).json({ success: false, code: 'TOKEN_REQUIRED', message: 'Reset authorization token is missing or invalid' });
    }

    if (!password || typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({ success: false, code: 'PASSWORD_TOO_SHORT', message: 'New password must be at least 8 characters long' });
    }

    if (password.length > 128) {
      return res.status(400).json({ success: false, code: 'PASSWORD_TOO_LONG', message: 'Password must not exceed 128 characters.' });
    }

    const user = await User.findOne({

      resetPasswordToken: token.trim(),
      resetPasswordExpire: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Password reset session has expired or is invalid. Please request a new code.'
      });
    }

    // Set new password (pre-save hook hashes it with bcrypt)
    user.passwordHash = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;
    user.resetPasswordOtp = null;
    await user.save();

    res.json({
      success: true,
      message: 'Your password has been updated successfully! You can now sign in with your new password.'
    });
  } catch (error) {
    console.error('Reset password error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to reset password. Please try again.' });
  }
};

// @desc    Get authenticated user's seller verification status (Private)
// @route   GET /api/marketplace/auth/verification
// @access  Private
export const getSellerVerificationStatus = async (req, res) => {
  try {
    const verification = await SellerVerification.findOne({ sellerId: req.user._id });
    res.json({
      success: true,
      data: verification || {
        status: req.user.verificationStatus || 'UNVERIFIED',
        sellerType: 'OWNER'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Submit seller identity verification request
// @route   POST /api/marketplace/auth/verification
// @access  Private
export const submitSellerVerification = async (req, res) => {
  try {
    const { sellerType, businessName, reraId, aadhaarNumber, panNumber, documentType, documentUrl } = req.body;

    // Mask Aadhaar & PAN for secure, privacy-preserving storage
    let aadhaarMasked = '';
    if (aadhaarNumber && aadhaarNumber.length >= 4) {
      const last4 = aadhaarNumber.replace(/[^0-9]/g, '').slice(-4);
      aadhaarMasked = `XXXX-XXXX-${last4}`;
    }

    let panMasked = '';
    if (panNumber && panNumber.length >= 4) {
      const cleanPan = panNumber.trim().toUpperCase();
      const first2 = cleanPan.slice(0, 2);
      const last2 = cleanPan.slice(-2);
      panMasked = `${first2}*****${last2}`;
    }

    const verification = await SellerVerification.findOneAndUpdate(
      { sellerId: req.user._id },
      {
        sellerType: sellerType || 'OWNER',
        businessName: businessName || '',
        reraId: reraId || '',
        aadhaarMasked,
        panMasked,
        documentType: documentType || 'AADHAAR',
        documentUrl: documentUrl || '',
        status: 'PENDING',
        rejectionReason: '',
        adminNotes: ''
      },
      { upsert: true, new: true, runValidators: true }
    );

    // Update user verificationStatus to PENDING
    await User.findByIdAndUpdate(req.user._id, {
      verificationStatus: 'PENDING'
    });

    res.json({
      success: true,
      message: 'Seller verification request submitted successfully. Our team will review your credentials shortly.',
      data: verification
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

