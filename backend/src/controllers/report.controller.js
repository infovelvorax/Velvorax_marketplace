import { Report } from '../models/Report.js';
import { Listing } from '../models/Listing.js';
import { Notification } from '../models/Notification.js';

// @desc    Create a trust & safety report
// @route   POST /api/marketplace/reports
// @access  Private
export const createReport = async (req, res) => {
  try {
    const { targetType, targetId, reason, description, signature, requiresSignature } = req.body;
    
    if (!targetType || !targetId) {
      return res.status(400).json({ 
        success: false, 
        code: 'TARGET_REQUIRED', 
        message: 'Report submission failed: Target item is required.' 
      });
    }

    if (!reason) {
      return res.status(400).json({ 
        success: false, 
        code: 'REASON_REQUIRED', 
        message: 'Report submission failed: Please select a valid reason for the report.' 
      });
    }

    // Normalization mapping for common reason variants
    const rawReason = String(reason).trim().toUpperCase();
    let normalizedReason = rawReason;
    const validReasons = [
      'FRAUD', 'SCAM', 'INAPPROPRIATE', 'INAPPROPRIATE_CONTENT', 'SPAM',
      'WRONG_CATEGORY', 'MISCATEGORIZED', 'DUPLICATE', 'PROHIBITED',
      'PROHIBITED_ITEM', 'MISLEADING', 'HARASSMENT', 'OFFENSIVE', 'COPYRIGHT', 'OTHER'
    ];
    if (!validReasons.includes(normalizedReason)) {
      normalizedReason = 'OTHER';
    }

    // If signature is required by report type or provided with validation
    if (requiresSignature && (!signature || typeof signature !== 'string' || !signature.trim())) {
      return res.status(400).json({
        success: false,
        code: 'SIGNATURE_REQUIRED',
        message: 'Please sign the report before submitting.'
      });
    }

    const report = await Report.create({
      reporterId: req.user._id,
      targetType: String(targetType).trim().toUpperCase(),
      targetId,
      reason: normalizedReason,
      description: description ? String(description).slice(0, 2000) : '',
      signature: signature ? String(signature).trim() : ''
    });

    res.status(201).json({ 
      success: true, 
      message: 'Thank you! Report submitted successfully for safety review.', 
      data: report 
    });
  } catch (error) {
    console.error('[Report Controller Error]:', error.message);
    res.status(500).json({ 
      success: false, 
      code: 'SERVER_ERROR', 
      message: error.message || 'An unexpected error occurred while processing the report.' 
    });
  }
};

// @desc    Get all reports (Admin)
// @route   GET /api/marketplace/reports
// @access  Private/Admin
export const getReports = async (req, res) => {
  try {
    const rawReports = await Report.find()
      .populate('reporterId', 'name email profilePhoto')
      .populate('resolvedBy', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    // Enrich reports with target listing details if targetType is LISTING
    const enrichedReports = await Promise.all(
      rawReports.map(async (rep) => {
        let targetItem = null;
        if (rep.targetType === 'LISTING' && rep.targetId) {
          targetItem = await Listing.findById(rep.targetId)
            .select('title price currency currencySymbol location images media status sellerId')
            .populate('sellerId', 'name email phone')
            .lean();
        }
        return {
          ...rep,
          targetItem
        };
      })
    );

    res.json({ success: true, data: enrichedReports, reports: enrichedReports });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update report status & resolve moderation action (Admin)
// @route   PATCH /api/marketplace/reports/:id
// @access  Private/Admin
export const updateReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, status, resolutionNotes, resolutionNote, adminAction, reason } = req.body;

    // Strict admin authorization check
    const userRole = (req.user?.role || '').toUpperCase();
    if (userRole !== 'ADMIN' && userRole !== 'MODERATOR') {
      return res.status(403).json({
        success: false,
        code: 'UNAUTHORIZED',
        message: 'You are not authorized to resolve reports.'
      });
    }

    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({
        success: false,
        code: 'REPORT_NOT_FOUND',
        message: 'The report could not be found.'
      });
    }

    const cleanAction = (action || '').toUpperCase();
    const cleanStatus = (status || '').toUpperCase();
    const notes = resolutionNotes || resolutionNote || adminAction || reason || '';

    // 1. Action: Remove Item
    if (cleanAction === 'REMOVE_ITEM' || cleanStatus === 'REMOVE_ITEM') {
      if (report.targetType === 'LISTING' && report.targetId) {
        const listing = await Listing.findById(report.targetId);
        if (listing) {
          listing.status = 'REMOVED';
          listing.removedBy = req.user._id;
          listing.removedAt = new Date();
          listing.removalReason = notes || report.reason || 'Violated marketplace safety guidelines';
          await listing.save();

          // Create notification for seller
          await Notification.create({
            userId: listing.sellerId,
            title: 'Listing removed',
            message: 'Your listing was removed after an administrator reviewed a user report.',
            type: 'LISTING_REJECTED',
            link: '/seller/dashboard'
          });
        }
      }

      report.status = 'RESOLVED';
      report.action = 'REMOVE_ITEM';
      report.adminAction = 'REMOVE_ITEM';
      report.resolvedBy = req.user._id;
      report.resolvedAt = new Date();
      report.resolutionNote = notes || 'Listing removed due to report violation';
      await report.save();

      return res.json({
        success: true,
        message: 'Listing removed successfully and report resolved.',
        data: report,
        report
      });
    }

    // 2. Action: Dismiss Flag
    if (cleanAction === 'DISMISS' || cleanAction === 'DISMISSED' || cleanStatus === 'DISMISSED') {
      report.status = 'DISMISSED';
      report.action = 'DISMISS';
      report.adminAction = 'DISMISS';
      report.resolvedBy = req.user._id;
      report.resolvedAt = new Date();
      report.resolutionNote = notes || 'Report dismissed by moderator';
      await report.save();

      return res.json({
        success: true,
        message: 'Report dismissed successfully.',
        data: report,
        report
      });
    }

    // 3. Action: Take Action / Mark Resolved
    report.status = 'RESOLVED';
    report.action = cleanAction || 'TAKE_ACTION';
    report.adminAction = cleanAction || 'TAKE_ACTION';
    report.resolvedBy = req.user._id;
    report.resolvedAt = new Date();
    report.resolutionNote = notes || 'Report resolved successfully';
    await report.save();

    return res.json({
      success: true,
      message: 'Report resolved successfully.',
      data: report,
      report
    });
  } catch (error) {
    console.error('[Report Resolve Error]:', error);
    res.status(500).json({
      success: false,
      code: 'SERVER_ERROR',
      message: error.message || 'Failed to resolve report.'
    });
  }
};

export const resolveReport = updateReportStatus;
