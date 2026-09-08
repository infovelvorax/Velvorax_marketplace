import { JobApplication } from '../models/JobApplication.js';
import { Listing } from '../models/Listing.js';
import { Notification } from '../models/Notification.js';
import { normalizeEmail } from '../utils/normalizeEmail.js';
import { isValidPhoneNumber } from '../utils/phoneValidator.js';

// @desc    Apply for a job listing
// @route   POST /api/marketplace/jobs/apply
// @access  Private
export const applyJob = async (req, res) => {
  try {
    const { listingId, name, email, phone, resumeUrl, coverLetter, experienceYears, currentCompany } = req.body;
    if (!listingId || !name || !email || !phone) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields (listing, name, email, phone)' });
    }

    if (!isValidPhoneNumber(phone)) {
      return res.status(400).json({ success: false, message: 'Invalid phone number format. Please provide a valid 7 to 15 digit number with optional country code.' });
    }

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Job listing not found' });
    }

    if (listing.sellerId?.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot apply to your own job listing' });
    }

    // Check for duplicate application
    const existing = await JobApplication.findOne({ listingId, applicantId: req.user._id });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already submitted an application for this position' });
    }

    const application = await JobApplication.create({
      listingId,
      employerId: listing.sellerId,
      applicantId: req.user._id,
      name: name.trim(),
      email: normalizeEmail(email),
      phone: phone.trim(),
      resumeUrl: resumeUrl || '',
      coverLetter: coverLetter || '',
      experienceYears: experienceYears || '',
      currentCompany: currentCompany || ''
    });

    // Notify employer
    await Notification.create({
      userId: listing.sellerId,
      title: 'New Job Application',
      message: `${name} applied for "${listing.title}".`,
      type: 'APPLICATION',
      link: `/dashboard/applications`
    });

    res.status(201).json({ success: true, data: application });
  } catch (error) {
    console.error('applyJob error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get candidate's own submitted applications
// @route   GET /api/marketplace/jobs/my-applications
// @access  Private
export const getMyApplications = async (req, res) => {
  try {
    const applications = await JobApplication.find({ applicantId: req.user._id })
      .populate('listingId', 'title location price currency currencySymbol details')
      .populate('employerId', 'name profilePhoto')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: applications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get applications for employer's posted jobs
// @route   GET /api/marketplace/jobs/employer-applications
// @access  Private
export const getEmployerApplications = async (req, res) => {
  try {
    const applications = await JobApplication.find({ employerId: req.user._id })
      .populate('listingId', 'title location')
      .populate('applicantId', 'name profilePhoto email phone')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: applications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update application status
// @route   PATCH /api/marketplace/jobs/applications/:id/status
// @access  Private
export const updateApplicationStatus = async (req, res) => {
  try {
    const { status, employerNotes } = req.body;
    const application = await JobApplication.findById(req.params.id).populate('listingId');
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    if (application.employerId.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (status) application.status = status;
    if (employerNotes !== undefined) application.employerNotes = employerNotes;
    await application.save();

    // Notify applicant
    await Notification.create({
      userId: application.applicantId,
      title: 'Application Status Updated',
      message: `Your application for "${application.listingId?.title || 'Job'}" status is now: ${status}.`,
      type: 'APPLICATION',
      link: `/dashboard/applications`
    });

    res.json({ success: true, data: application });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
