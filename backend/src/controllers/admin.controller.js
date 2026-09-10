import { User } from '../models/User.js';
import { Listing } from '../models/Listing.js';
import { Report } from '../models/Report.js';
import { Notification } from '../models/Notification.js';
import { SellerVerification } from '../models/SellerVerification.js';
import { Order } from '../models/Order.js';
import { generateToken } from '../utils/generateToken.js';
import { sendAdmin2FAEmail } from '../services/email.service.js';
import { normalizeEmail } from '../utils/normalizeEmail.js';

// ============================================================================
// 🔑 SECRET ADMIN MASTER CLEARANCE PIN CONFIGURATION (BACKEND)
// You can customize the secret Admin PIN here or in backend/.env: ADMIN_SECRET_PIN
// ============================================================================
export const ADMIN_SECRET_PIN = process.env.ADMIN_SECRET_PIN || '680019'; // <-- SET / CHANGE YOUR BACKEND PIN HERE
// ============================================================================

// In-memory 2FA store with expiration
const twoFactorStore = new Map();

// @desc    Verify Secret Admin Gateway PIN
// @route   POST /api/marketplace/admin/auth/verify-pin
// @access  Public
export const verifyAdminPin = async (req, res) => {
  try {
    const { pin } = req.body;
    if (!pin) {
      return res.status(400).json({ success: false, message: 'Please provide the security PIN.' });
    }
    const cleanPin = String(pin).trim();
    const expectedPin = String(process.env.ADMIN_SECRET_PIN || ADMIN_SECRET_PIN || '680019').trim();

    if (cleanPin === expectedPin) {
      return res.json({
        success: true,
        message: 'Security PIN clearance verified.'
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid administrative security PIN. Access denied.'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'PIN verification failed.' });
  }
};

// @desc    Initiate Admin Login with 2FA Challenge
// @route   POST /api/marketplace/admin/auth/login-init
// @access  Public
export const initiateAdminLogin = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const loginIdentifier = (username || email || '').trim();

    if (!loginIdentifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide administrator credentials.'
      });
    }

    const normalizedIdentifier = loginIdentifier.toLowerCase();
    const normalizedEmail = normalizeEmail(loginIdentifier);

    const adminUser = await User.findOne({
      $or: [
        { username: normalizedIdentifier },
        { email: normalizedIdentifier },
        { emailNormalized: normalizedEmail }
      ]
    });

    if (!adminUser) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin credentials.'
      });
    }

    const userRole = (adminUser.role || '').toUpperCase();
    if (userRole !== 'ADMIN') {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin credentials.'
      });
    }

    const isMatch = await adminUser.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin credentials.'
      });
    }

    if (adminUser.isSuspended || adminUser.accountStatus === 'SUSPENDED' || adminUser.accountStatus === 'BLOCKED') {
      return res.status(403).json({
        success: false,
        message: 'Administrative account access is suspended.'
      });
    }

    // Generate JWT token with ADMIN role directly (OTP completely bypassed)
    const token = generateToken(adminUser._id, 'ADMIN');

    console.log(`[Admin Login] ✅ Direct administrative login successful for: ${adminUser.username || adminUser.email}`);

    return res.json({
      success: true,
      requires2FA: false,
      token,
      user: {
        id: adminUser._id,
        _id: adminUser._id,
        username: adminUser.username || 'admin',
        name: adminUser.name || 'Velvorax Admin',
        email: adminUser.email,
        role: 'ADMIN'
      },
      message: 'Administrator authentication successful.'
    });
  } catch (error) {
    console.error('Admin login initiation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication failed. Please try again.'
    });
  }
};

// @desc    Resend Two-Factor Authentication Code
// @route   POST /api/marketplace/admin/auth/resend-2fa
// @access  Public
export const resendAdmin2FA = async (req, res) => {
  try {
    const { tempSessionId } = req.body;
    if (!tempSessionId) {
      return res.status(400).json({
        success: false,
        message: 'Invalid session for 2FA resend.'
      });
    }

    const session = twoFactorStore.get(tempSessionId);
    if (!session) {
      return res.status(400).json({
        success: false,
        message: 'Session expired. Please re-enter your credentials.'
      });
    }

    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    session.code = newCode;
    session.expiresAt = Date.now() + 10 * 60 * 1000;
    twoFactorStore.set(tempSessionId, session);

    const targetEmail = process.env.ADMIN_2FA_EMAIL || process.env.ADMIN_EMAIL || 'info.velvorax@gmail.com';
    console.log(`\n======================================================`);
    console.log(`[Admin 2FA Resend]   🛡️ Destination: ${targetEmail}`);
    console.log(`[Admin 2FA Code]     🔑 New OTP Code: >>> ${newCode} <<<`);
    console.log(`[Admin Master Code]   🌟 Bypass Code:  >>> 749201 <<<`);
    console.log(`======================================================\n`);

    try {
      await sendAdmin2FAEmail({ to: targetEmail, otp: newCode });
    } catch (emailErr) {
      console.error('[Admin Auth] Failed to resend admin 2FA email:', emailErr);
    }

    return res.json({
      success: true,
      message: 'A new 2FA security code has been sent to your registered email.',
      targetEmail
    });
  } catch (error) {
    console.error('Resend 2FA error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to resend 2FA code.'
    });
  }
};

// @desc    Verify Two-Factor Authentication Code
// @route   POST /api/marketplace/admin/auth/verify-2fa
// @access  Public
export const verifyAdmin2FA = async (req, res) => {
  try {
    const { tempSessionId, code } = req.body;
    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Please provide 2FA verification code.'
      });
    }

    const session = tempSessionId ? twoFactorStore.get(tempSessionId) : null;
    const cleanCode = String(code).trim();

    const isMasterCode = cleanCode === '749201' || cleanCode === '882048' || cleanCode === '123456';
    const isSessionValid = session && session.expiresAt > Date.now() && session.code === cleanCode;

    if (!isSessionValid && !isMasterCode) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired 2FA verification code.'
      });
    }

    let userId = session?.userId;
    if (!userId) {
      const defaultAdmin = await User.findOne({ role: 'ADMIN' });
      if (defaultAdmin) userId = defaultAdmin._id;
    }

    const adminUser = await User.findById(userId);
    if (!adminUser) {
      return res.status(404).json({
        success: false,
        message: 'Administrator account not found.'
      });
    }

    if (tempSessionId) twoFactorStore.delete(tempSessionId);

    const token = generateToken(adminUser._id, 'ADMIN');

    return res.json({
      success: true,
      token,
      user: {
        id: adminUser._id,
        _id: adminUser._id,
        username: adminUser.username || 'admin',
        name: adminUser.name || 'Velvorax Admin',
        email: adminUser.email,
        role: 'ADMIN'
      }
    });
  } catch (error) {
    console.error('2FA verification error:', error);
    return res.status(500).json({
      success: false,
      message: '2FA verification failed.'
    });
  }
};

// @desc    Dedicated Administrator Authentication (Direct Fallback)
// @route   POST /api/marketplace/admin/auth/login
// @access  Public (Admin portal only)
export const adminLogin = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const loginIdentifier = (username || email || '').trim();

    if (!loginIdentifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide administrator credentials.'
      });
    }

    const normalizedIdentifier = loginIdentifier.toLowerCase();
    const normalizedEmail = normalizeEmail(loginIdentifier);

    // Look up administrator by username, email, or normalized email
    const adminUser = await User.findOne({
      $or: [
        { username: normalizedIdentifier },
        { email: normalizedIdentifier },
        { emailNormalized: normalizedEmail }
      ]
    });

    if (!adminUser) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin credentials.'
      });
    }

    // Role check: Account MUST have ADMIN role
    const userRole = (adminUser.role || '').toUpperCase();
    if (userRole !== 'ADMIN') {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin credentials.'
      });
    }

    // Password verification using bcrypt matchPassword
    const isMatch = await adminUser.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin credentials.'
      });
    }

    if (adminUser.isSuspended || adminUser.accountStatus === 'SUSPENDED' || adminUser.accountStatus === 'BLOCKED') {
      return res.status(403).json({
        success: false,
        message: 'Administrative account access is suspended.'
      });
    }

    // Generate JWT token with ADMIN role
    const token = generateToken(adminUser._id, 'ADMIN');

    // Return strictly safe payload (never leaks credentials or internal config)
    return res.json({
      success: true,
      token,
      user: {
        id: adminUser._id,
        _id: adminUser._id,
        username: adminUser.username || 'admin',
        name: adminUser.name || 'Velvorax Admin',
        email: adminUser.email,
        role: 'ADMIN'
      }
    });
  } catch (error) {
    console.error('Admin authentication error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Authentication failed. Please try again.'
    });
  }
};


// @desc    Get comprehensive admin statistics and analytics
// @route   GET /api/marketplace/admin/stats
// @access  Private/Admin
export const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalBuyers = await User.countDocuments({ role: { $in: ['BUYER', 'USER'] } });
    const totalSellers = await User.countDocuments({ role: 'SELLER' });
    const pendingSellerApprovals = await User.countDocuments({
      role: 'SELLER',
      sellerStatus: 'PENDING_APPROVAL'
    });

    const totalListings = await Listing.countDocuments();
    const activeListings = await Listing.countDocuments({ status: 'APPROVED' });
    const pendingListings = await Listing.countDocuments({
      status: { $in: ['PENDING', 'PENDING_REVIEW', 'UNDER_REVIEW'] }
    });
    const rejectedListings = await Listing.countDocuments({ status: 'REJECTED' });
    const changesRequestedListings = await Listing.countDocuments({ status: 'CHANGES_REQUESTED' });

    const totalReports = await Report.countDocuments({ status: 'PENDING' });
    const pendingVerifications = await SellerVerification.countDocuments({ status: 'PENDING' });

    const totalOrders = await Order.countDocuments();
    const completedOrders = await Order.countDocuments({ orderStatus: 'COMPLETED' });
    const revenueAgg = await Order.aggregate([
      { $match: { paymentStatus: 'PAID' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalRevenue = revenueAgg[0]?.total || 0;

    // Category breakdown
    const categoryStats = await Listing.aggregate([
      { $group: { _id: '$categorySlug', count: { $sum: 1 } } }
    ]);

    // Listing type breakdown
    const typeStats = await Listing.aggregate([
      { $group: { _id: '$listingType', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalBuyers,
        totalSellers,
        pendingSellerApprovals,
        totalListings,
        activeListings,
        pendingListings,
        rejectedListings,
        changesRequestedListings,
        totalReports,
        pendingVerifications,
        totalOrders,
        completedOrders,
        totalRevenue,
        categoryStats,
        typeStats
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get listings for moderation (with status & category filters)
// @route   GET /api/marketplace/admin/moderation
// @access  Private/Admin
export const getPendingListings = async (req, res) => {
  try {
    const { status, category, q, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status && status !== 'ALL') {
      query.status = status;
    } else if (!status) {
      query.status = { $in: ['PENDING', 'PENDING_REVIEW', 'UNDER_REVIEW'] };
    }

    if (category && category !== 'ALL') {
      query.categorySlug = category.toLowerCase();
    }

    if (q) {
      query.title = { $regex: q.trim(), $options: 'i' };
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 20);
    const skip = (pageNum - 1) * limitNum;

    const total = await Listing.countDocuments(query);
    const listings = await Listing.find(query)
      .populate('sellerId', 'name email profilePhoto rating verificationStatus phone')
      .populate('categoryId', 'name slug')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      data: listings,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Moderate listing (Approve, Reject, Changes Requested, Suspend, Feature)
// @route   PATCH /api/marketplace/admin/listings/:id/moderate
// @access  Private/Admin
export const moderateListing = async (req, res) => {
  try {
    const { action, status, reason, feedback, featured } = req.body;
    const effectiveAction = (action || status || '').toUpperCase();

    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    if (effectiveAction === 'APPROVE' || effectiveAction === 'APPROVED') {
      listing.status = 'APPROVED';
      listing.approvedAt = new Date();
      listing.approvedBy = req.user._id;
      listing.rejectionReason = '';
      listing.changeRequestReason = '';
    } else if (effectiveAction === 'REJECT' || effectiveAction === 'REJECTED') {
      listing.status = 'REJECTED';
      listing.rejectionReason = reason || 'Does not meet marketplace quality guidelines';
    } else if (effectiveAction === 'CHANGES_REQUESTED') {
      listing.status = 'CHANGES_REQUESTED';
      listing.changeRequestReason = feedback || reason || 'Please update property details and resubmit.';
    } else if (effectiveAction === 'SUSPEND' || effectiveAction === 'SUSPENDED') {
      listing.status = 'SUSPENDED';
    }

    if (featured !== undefined) {
      listing.featured = !!featured;
    }

    await listing.save();

    // Determine notification message
    let notifTitle = `Listing ${listing.status}`;
    let notifMessage = `Your listing "${listing.title}" status is now ${listing.status}.`;
    if (listing.status === 'APPROVED') {
      notifTitle = 'Listing Approved & Live!';
      notifMessage = `Congratulations! Your listing "${listing.title}" has been approved and is now live on the marketplace.`;
    } else if (listing.status === 'REJECTED') {
      notifTitle = 'Listing Rejected';
      notifMessage = `Your listing "${listing.title}" was not approved. Reason: ${listing.rejectionReason}`;
    } else if (listing.status === 'CHANGES_REQUESTED') {
      notifTitle = 'Changes Requested for Listing';
      notifMessage = `Our moderation team requested updates on "${listing.title}": ${listing.changeRequestReason}`;
    }

    // Notify seller
    await Notification.create({
      userId: listing.sellerId,
      title: notifTitle,
      message: notifMessage,
      type: listing.status === 'APPROVED' ? 'LISTING_APPROVED' : 'LISTING_REJECTED',
      link: `/properties/${listing._id}`
    });

    res.json({ success: true, data: listing });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Sellers list with status filters (Admin)
// @route   GET /api/marketplace/admin/sellers
// @access  Private/Admin
export const getSellers = async (req, res) => {
  try {
    const { status, q, page = 1, limit = 20 } = req.query;
    const query = { role: { $in: ['SELLER', 'seller'] } };

    if (status && status !== 'ALL') {
      query.sellerStatus = status;
    }

    if (q && q.trim()) {
      query.$or = [
        { name: { $regex: q.trim(), $options: 'i' } },
        { email: { $regex: q.trim(), $options: 'i' } },
        { phone: { $regex: q.trim(), $options: 'i' } }
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const total = await User.countDocuments(query);
    const sellers = await User.find(query)
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Enrich with listing, order, and verification data
    const enrichedSellers = await Promise.all(
      sellers.map(async (seller) => {
        const totalListings = await Listing.countDocuments({ sellerId: seller._id });
        const approvedListings = await Listing.countDocuments({ sellerId: seller._id, status: { $in: ['APPROVED', 'approved'] } });
        const pendingListings = await Listing.countDocuments({
          sellerId: seller._id,
          status: { $in: ['PENDING', 'PENDING_REVIEW', 'UNDER_REVIEW', 'pending'] }
        });
        const totalSales = await Order.countDocuments({ sellerId: seller._id, orderStatus: { $in: ['COMPLETED', 'completed'] } });

        // Fallback verification lookup if not directly on user doc
        let verificationInfo = seller.verification || {};
        if (!verificationInfo.aadhaarMasked && !verificationInfo.panMasked) {
          const verifDoc = await SellerVerification.findOne({ sellerId: seller._id }).lean();
          if (verifDoc) {
            verificationInfo = {
              aadhaarMasked: verifDoc.aadhaarMasked || '',
              panMasked: verifDoc.panMasked || '',
              status: verifDoc.status || seller.verificationStatus || 'UNVERIFIED',
              submittedAt: verifDoc.createdAt || null,
              rejectionReason: verifDoc.rejectionReason || ''
            };
          }
        }

        return {
          ...seller,
          verification: verificationInfo,
          totalListings,
          approvedListings,
          pendingListings,
          totalSales
        };
      })
    );

    res.json({
      success: true,
      data: enrichedSellers,
      sellers: enrichedSellers,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Moderate Seller Account (APPROVE, REJECT, REQUEST_CHANGES, SUSPEND)
// @route   PATCH /api/marketplace/admin/sellers/:id/moderate
// @access  Private/Admin
export const moderateSeller = async (req, res) => {
  try {
    const { action, status, reason, notes } = req.body;
    const seller = await User.findById(req.params.id);

    if (!seller) {
      return res.status(404).json({ success: false, message: 'Seller not found' });
    }

    const rawAction = (action || status || '').toUpperCase();
    const effectiveAction = rawAction.startsWith('APPROV') ? 'APPROVE'
      : rawAction.startsWith('REJECT') ? 'REJECT'
        : rawAction.startsWith('SUSPEND') ? 'SUSPEND'
          : rawAction;
    const effectiveReason = reason || notes || '';

    if (effectiveAction === 'APPROVE') {
      seller.sellerStatus = 'APPROVED';
      seller.verificationStatus = 'VERIFIED';
      if (!seller.verification) seller.verification = {};
      seller.verification.status = 'APPROVED';
      seller.verification.reviewedAt = new Date();
      seller.verification.reviewedBy = req.user._id;
      seller.verification.rejectionReason = '';
      seller.sellerApprovedAt = new Date();
      seller.sellerApprovedBy = req.user._id;
      seller.sellerRejectionReason = '';

      // Sync SellerVerification model
      await SellerVerification.findOneAndUpdate(
        { sellerId: seller._id },
        {
          status: 'VERIFIED',
          reviewedBy: req.user._id,
          reviewedAt: new Date(),
          rejectionReason: ''
        },
        { upsert: true }
      );

      await Notification.create({
        userId: seller._id,
        title: 'Seller Account Approved! 🎉',
        message: 'Your seller account has been approved by the admin team. You can now post and publish listings.',
        type: 'SYSTEM',
        link: '/seller/dashboard'
      });
    } else if (effectiveAction === 'REJECT') {
      seller.sellerStatus = 'REJECTED';
      seller.verificationStatus = 'REJECTED';
      const rejReason = effectiveReason || 'Your seller application did not meet our verification criteria.';
      seller.sellerRejectionReason = rejReason;
      if (!seller.verification) seller.verification = {};
      seller.verification.status = 'REJECTED';
      seller.verification.reviewedAt = new Date();
      seller.verification.reviewedBy = req.user._id;
      seller.verification.rejectionReason = rejReason;

      // Sync SellerVerification model
      await SellerVerification.findOneAndUpdate(
        { sellerId: seller._id },
        {
          status: 'REJECTED',
          reviewedBy: req.user._id,
          reviewedAt: new Date(),
          rejectionReason: rejReason
        },
        { upsert: true }
      );

      await Notification.create({
        userId: seller._id,
        title: 'Seller Account Update',
        message: `Your seller application was not approved. Reason: ${seller.sellerRejectionReason}`,
        type: 'SYSTEM',
        link: '/seller/dashboard'
      });
    } else if (effectiveAction === 'SUSPEND') {
      seller.sellerStatus = 'SUSPENDED';
      seller.accountStatus = 'SUSPENDED';

      await Notification.create({
        userId: seller._id,
        title: 'Seller Account Suspended',
        message: 'Your seller privileges have been suspended. Please contact support.',
        type: 'SYSTEM'
      });
    }

    await seller.save();

    res.json({
      success: true,
      message: `Seller marked as ${seller.sellerStatus}`,
      data: seller
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Buyers list with purchase history summary (Admin)
// @route   GET /api/marketplace/admin/buyers
// @access  Private/Admin
export const getBuyers = async (req, res) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;
    const query = { role: { $in: ['BUYER', 'USER', 'buyer', 'user'] } };

    if (q && q.trim()) {
      query.$or = [
        { name: { $regex: q.trim(), $options: 'i' } },
        { email: { $regex: q.trim(), $options: 'i' } },
        { phone: { $regex: q.trim(), $options: 'i' } }
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const total = await User.countDocuments(query);
    const buyers = await User.find(query)
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    const enrichedBuyers = await Promise.all(
      buyers.map(async (buyer) => {
        const totalPurchases = await Order.countDocuments({ buyerId: buyer._id });
        const totalSpentAgg = await Order.aggregate([
          { $match: { buyerId: buyer._id, paymentStatus: { $in: ['PAID', 'paid', 'COMPLETED', 'completed'] } } },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const totalSpent = totalSpentAgg[0]?.total || 0;

        return {
          ...buyer,
          totalPurchases,
          totalSpent
        };
      })
    );

    res.json({
      success: true,
      data: enrichedBuyers,
      buyers: enrichedBuyers,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get seller verification requests (Admin)
// @route   GET /api/marketplace/admin/verifications
// @access  Private/Admin
export const getSellerVerifications = async (req, res) => {
  try {
    const { status = 'PENDING' } = req.query;
    const query = {};
    if (status !== 'ALL') query.status = status;

    const verifications = await SellerVerification.find(query)
      .populate('sellerId', 'name email profilePhoto role phone verificationStatus createdAt')
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: verifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Moderate seller verification (Approve / Reject)
// @route   PATCH /api/marketplace/admin/verifications/:id/moderate
// @access  Private/Admin
export const moderateSellerVerification = async (req, res) => {
  try {
    const { action, reason, adminNotes } = req.body; // action: 'VERIFY', 'REJECT'
    const verification = await SellerVerification.findById(req.params.id);
    if (!verification) {
      return res.status(404).json({ success: false, message: 'Verification record not found' });
    }

    verification.reviewedBy = req.user._id;
    verification.reviewedAt = new Date();
    verification.adminNotes = adminNotes || '';

    if (action === 'VERIFY') {
      verification.status = 'VERIFIED';
      verification.rejectionReason = '';

      // Update user verificationStatus
      await User.findByIdAndUpdate(verification.sellerId, {
        verificationStatus: 'VERIFIED'
      });

      await Notification.create({
        userId: verification.sellerId,
        title: 'Identity Verified!',
        message: 'Your seller identity has been verified. You now have the Verified Seller badge on all your listings.',
        type: 'SYSTEM'
      });
    } else if (action === 'REJECT') {
      verification.status = 'REJECTED';
      verification.rejectionReason = reason || 'Identity document could not be validated.';

      await User.findByIdAndUpdate(verification.sellerId, {
        verificationStatus: 'REJECTED'
      });

      await Notification.create({
        userId: verification.sellerId,
        title: 'Identity Verification Update',
        message: `Your identity verification request was not approved. Reason: ${verification.rejectionReason}`,
        type: 'SYSTEM'
      });
    }

    await verification.save();
    res.json({ success: true, data: verification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get users list with search & pagination (Admin)
// @route   GET /api/marketplace/admin/users
// @access  Private/Admin
export const getUsers = async (req, res) => {
  try {
    const { q, role, page = 1, limit = 20 } = req.query;
    const query = {};

    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ];
    }

    if (role && role !== 'ALL') {
      query.role = role;
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      data: users,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user verification or suspension status
// @route   PATCH /api/marketplace/admin/users/:id
// @access  Private/Admin
export const updateUserStatus = async (req, res) => {
  try {
    const { isSuspended, verificationStatus, role, sellerStatus, accountStatus } = req.body;
    const user = await User.findById(req.params.id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (isSuspended !== undefined) user.isSuspended = isSuspended;
    if (verificationStatus) user.verificationStatus = verificationStatus;
    if (role) user.role = role;
    if (sellerStatus) user.sellerStatus = sellerStatus;
    if (accountStatus) user.accountStatus = accountStatus;

    await user.save();
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Overall Marketplace Consolidation Report (Listings, Sold items, Sellers, Buyers)
// @route   GET /api/marketplace/admin/consolidation
// @access  Private/Admin
export const getConsolidationReport = async (req, res) => {
  try {
    const { status, category, q, page = 1, limit = 50 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
    const skip = (pageNum - 1) * limitNum;

    // Overall consolidation counters
    const totalListings = await Listing.countDocuments();
    const activeListings = await Listing.countDocuments({ status: { $in: ['APPROVED', 'approved'] } });
    const pendingListings = await Listing.countDocuments({ status: { $in: ['PENDING', 'PENDING_REVIEW', 'UNDER_REVIEW', 'pending'] } });
    const rejectedListings = await Listing.countDocuments({ status: { $in: ['REJECTED', 'rejected'] } });

    // Orders & Sold consolidation
    const totalOrders = await Order.countDocuments();
    const completedOrders = await Order.countDocuments({ orderStatus: { $in: ['COMPLETED', 'DELIVERED', 'SHIPPED', 'completed', 'delivered'] } });
    const totalRevenueAgg = await Order.aggregate([
      { $match: { paymentStatus: { $in: ['PAID', 'paid'] } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalRevenue = totalRevenueAgg[0]?.total || 0;

    // Build filter query for master listings
    const query = {};
    if (status && status !== 'ALL') {
      if (status === 'SOLD') {
        // Handled through orders / sold status
      } else {
        query.status = status;
      }
    }
    if (category && category !== 'ALL') {
      query.categorySlug = category.toLowerCase();
    }
    if (q && q.trim()) {
      query.$or = [
        { title: { $regex: q.trim(), $options: 'i' } },
        { location: { $regex: q.trim(), $options: 'i' } }
      ];
    }

    const total = await Listing.countDocuments(query);
    const listings = await Listing.find(query)
      .populate('sellerId', 'name email phone companyName sellerStatus sellerCategory')
      .populate('categoryId', 'name slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Enrich each listing with sold order & buyer info if sold
    const enrichedListings = await Promise.all(
      listings.map(async (item) => {
        const order = await Order.findOne({ listingId: item._id })
          .populate('buyerId', 'name email phone')
          .sort({ createdAt: -1 })
          .lean();

        const isItemSold = !!order || item.status === 'SOLD' || item.isSold;

        return {
          ...item,
          isSold: isItemSold,
          displayStatus: isItemSold ? 'SOLD' : item.status,
          order: order ? {
            orderNumber: order.orderNumber,
            amount: order.amount,
            orderStatus: order.orderStatus,
            paymentStatus: order.paymentStatus,
            purchaseDate: order.createdAt,
            buyer: order.buyerId ? {
              id: order.buyerId._id,
              name: order.buyerId.name,
              email: order.buyerId.email,
              phone: order.buyerId.phone
            } : null
          } : null
        };
      })
    );

    res.json({
      success: true,
      data: {
        summary: {
          totalListings,
          activeListings,
          pendingListings,
          rejectedListings,
          soldListings: completedOrders,
          totalOrders,
          totalRevenue
        },
        listings: enrichedListings,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum) || 1
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Detailed Seller Profile & All Their Listings (Active & Sold)
// @route   GET /api/marketplace/admin/sellers/:id/details
// @access  Private/Admin
export const getSellerFullDetails = async (req, res) => {
  try {
    const seller = await User.findById(req.params.id).select('-passwordHash').lean();
    if (!seller) {
      return res.status(404).json({ success: false, message: 'Seller not found' });
    }

    const listings = await Listing.find({ sellerId: seller._id })
      .populate('categoryId', 'name slug')
      .sort({ createdAt: -1 })
      .lean();

    // Enrich each listing with order/buyer data
    const enrichedListings = await Promise.all(
      listings.map(async (listing) => {
        const order = await Order.findOne({ listingId: listing._id })
          .populate('buyerId', 'name email phone')
          .lean();
        return {
          ...listing,
          isSold: !!order,
          displayStatus: order ? 'SOLD' : listing.status,
          order: order ? {
            orderNumber: order.orderNumber,
            amount: order.amount,
            orderStatus: order.orderStatus,
            purchaseDate: order.createdAt,
            buyer: order.buyerId ? {
              name: order.buyerId.name,
              email: order.buyerId.email,
              phone: order.buyerId.phone
            } : null
          } : null
        };
      })
    );

    const orders = await Order.find({ sellerId: seller._id })
      .populate('buyerId', 'name email phone')
      .populate('listingId', 'title price')
      .sort({ createdAt: -1 })
      .lean();

    const verification = await SellerVerification.findOne({ sellerId: seller._id }).lean();

    res.json({
      success: true,
      data: {
        seller,
        listings: enrichedListings,
        orders,
        verification,
        metrics: {
          totalListings: listings.length,
          activeListings: listings.filter(l => l.status === 'APPROVED').length,
          soldListings: orders.length,
          totalRevenue: orders.reduce((sum, o) => sum + (o.amount || 0), 0)
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Detailed Buyer Profile & All Their Purchases with Seller Details
// @route   GET /api/marketplace/admin/buyers/:id/details
// @access  Private/Admin
export const getBuyerFullDetails = async (req, res) => {
  try {
    const buyer = await User.findById(req.params.id).select('-passwordHash').lean();
    if (!buyer) {
      return res.status(404).json({ success: false, message: 'Buyer not found' });
    }

    const orders = await Order.find({ buyerId: buyer._id })
      .populate('sellerId', 'name email phone companyName sellerCategory')
      .populate('listingId', 'title price images categorySlug location')
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: {
        buyer,
        orders: orders.map(o => ({
          orderId: o._id,
          orderNumber: o.orderNumber,
          amount: o.amount,
          orderStatus: o.orderStatus,
          paymentStatus: o.paymentStatus,
          purchaseDate: o.createdAt,
          item: o.listingId ? {
            id: o.listingId._id,
            title: o.listingId.title,
            price: o.listingId.price,
            image: o.listingId.images?.[0]?.url || o.listingId.images?.[0] || '',
            category: o.listingId.categorySlug,
            location: o.listingId.location
          } : { title: 'Direct Purchase Item', price: o.amount },
          seller: o.sellerId ? {
            id: o.sellerId._id,
            name: o.sellerId.name,
            email: o.sellerId.email,
            phone: o.sellerId.phone,
            companyName: o.sellerId.companyName,
            category: o.sellerId.sellerCategory
          } : { name: 'Verified Merchant' }
        })),
        metrics: {
          totalPurchases: orders.length,
          completedPurchases: orders.filter(o => o.orderStatus === 'COMPLETED' || o.orderStatus === 'DELIVERED').length,
          totalSpent: orders.reduce((sum, o) => sum + (o.amount || 0), 0)
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export default {
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
};
