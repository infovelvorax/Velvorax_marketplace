import { ServiceBooking } from '../models/ServiceBooking.js';
import { Listing } from '../models/Listing.js';
import { Review } from '../models/Review.js';
import { User } from '../models/User.js';
import { Notification } from '../models/Notification.js';

// @desc    Book a service
// @route   POST /api/marketplace/services/book
// @access  Private
export const bookService = async (req, res) => {
  try {
    const { serviceListingId, bookingDate, timeSlot, address, phone, notes } = req.body;
    if (!serviceListingId || !bookingDate || !timeSlot || !address || !phone) {
      return res.status(400).json({ success: false, message: 'Please provide all booking details' });
    }

    const listing = await Listing.findById(serviceListingId);
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Service listing not found' });
    }

    const booking = await ServiceBooking.create({
      serviceListingId,
      providerId: listing.sellerId,
      customerId: req.user._id,
      serviceTitle: listing.title,
      bookingDate,
      timeSlot,
      address,
      phone,
      notes: notes || '',
      priceEstimate: listing.price || 0,
      currencySymbol: listing.currencySymbol || '₹'
    });

    // Notify provider
    await Notification.create({
      userId: listing.sellerId,
      title: 'New Service Booking Request',
      message: `${req.user.name} requested "${listing.title}" for ${bookingDate} at ${timeSlot}.`,
      type: 'BOOKING',
      link: `/dashboard/bookings`
    });

    res.status(201).json({ success: true, data: booking });
  } catch (error) {
    console.error('bookService error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get customer's own service bookings
// @route   GET /api/marketplace/services/my-bookings
// @access  Private
export const getMyBookings = async (req, res) => {
  try {
    const bookings = await ServiceBooking.find({ customerId: req.user._id })
      .populate('serviceListingId', 'title images location price currency currencySymbol')
      .populate('providerId', 'name profilePhoto phone rating verificationStatus')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get provider's bookings
// @route   GET /api/marketplace/services/provider-bookings
// @access  Private
export const getProviderBookings = async (req, res) => {
  try {
    const bookings = await ServiceBooking.find({ providerId: req.user._id })
      .populate('serviceListingId', 'title images')
      .populate('customerId', 'name profilePhoto phone email')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update service booking status
// @route   PATCH /api/marketplace/services/bookings/:id/status
// @access  Private
export const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await ServiceBooking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.providerId.toString() !== req.user._id.toString() && booking.customerId.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    booking.status = status;
    await booking.save();

    // Notify customer
    await Notification.create({
      userId: booking.customerId,
      title: 'Booking Status Updated',
      message: `Your booking for "${booking.serviceTitle}" is now: ${status}.`,
      type: 'BOOKING',
      link: `/dashboard/bookings`
    });

    res.json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add review for completed service
// @route   POST /api/marketplace/services/bookings/:id/review
// @access  Private
export const addServiceReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const booking = await ServiceBooking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    booking.rating = Number(rating);
    booking.review = comment;
    await booking.save();

    // Create review entry
    await Review.create({
      authorId: req.user._id,
      targetUserId: booking.providerId,
      listingId: booking.serviceListingId,
      rating: Number(rating),
      comment
    });

    // Update provider rating average
    const reviews = await Review.find({ targetUserId: booking.providerId });
    const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
    await User.findByIdAndUpdate(booking.providerId, {
      rating: Math.round(avgRating * 10) / 10,
      reviewCount: reviews.length
    });

    res.json({ success: true, message: 'Review submitted successfully', data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
