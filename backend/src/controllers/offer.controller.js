import { Offer } from '../models/Offer.js';
import { Listing } from '../models/Listing.js';
import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';
import { Notification } from '../models/Notification.js';

// @desc    Make an offer on a listing
// @route   POST /api/marketplace/offers
// @access  Private
export const makeOffer = async (req, res) => {
  try {
    const { listingId, amount, currency, currencySymbol, message } = req.body;
    if (!listingId || amount === undefined || amount === null) {
      return res.status(400).json({ success: false, code: 'VALIDATION_ERROR', message: 'Listing ID and offer amount are required' });
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ success: false, code: 'INVALID_AMOUNT', message: 'Please enter a valid positive offer amount' });
    }

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ success: false, code: 'LISTING_NOT_FOUND', message: 'Listing not found' });
    }

    if (listing.sellerId.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, code: 'OWN_LISTING_OFFER', message: 'You cannot make an offer on your own listing' });
    }

    const offer = await Offer.create({
      listingId,
      buyerId: req.user._id,
      sellerId: listing.sellerId,
      amount: numAmount,
      currency: currency || listing.currency || 'INR',
      currencySymbol: currencySymbol || listing.currencySymbol || '₹',
      message: message ? String(message).slice(0, 500) : `I'd like to offer ${currencySymbol || listing.currencySymbol || '₹'}${numAmount} for this item.`
    });

    // Create or find conversation and post offer message
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, listing.sellerId] },
      listingId
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user._id, listing.sellerId],
        listingId
      });
    }

    const offerMsg = await Message.create({
      conversationId: conversation._id,
      senderId: req.user._id,
      text: `Made an Offer: ${offer.currencySymbol}${offer.amount}. ${message || ''}`.trim(),
      offerDetails: {
        offerId: offer._id,
        amount: offer.amount,
        currency: offer.currencySymbol,
        status: 'PENDING'
      }
    });

    conversation.lastMessage = {
      text: offerMsg.text,
      senderId: req.user._id,
      createdAt: offerMsg.createdAt
    };
    await conversation.save();

    // Create notification for seller
    await Notification.create({
      userId: listing.sellerId,
      title: 'New Offer Received',
      message: `${req.user.name} offered ${offer.currencySymbol}${offer.amount} on "${listing.title}".`,
      type: 'OFFER',
      link: `/dashboard/messages?conversation=${conversation._id}`
    });

    res.status(201).json({ 
      success: true, 
      message: 'Offer submitted successfully.', 
      data: offer 
    });
  } catch (error) {
    console.error('makeOffer error:', error);
    res.status(500).json({ success: false, code: 'SERVER_ERROR', message: error.message || 'Failed to submit offer' });
  }
};


// @desc    Respond to an offer (ACCEPT, REJECT, COUNTER)
// @route   PATCH /api/marketplace/offers/:id/respond
// @access  Private
export const respondOffer = async (req, res) => {
  try {
    const { action, counterAmount, message } = req.body; // action: 'ACCEPT', 'REJECT', 'COUNTER'
    if (!action) {
      return res.status(400).json({ success: false, message: 'Action is required (ACCEPT, REJECT, COUNTER)' });
    }

    const upperAction = String(action).toUpperCase();
    if (!['ACCEPT', 'REJECT', 'COUNTER'].includes(upperAction)) {
      return res.status(400).json({ success: false, message: 'Invalid offer action' });
    }

    const offer = await Offer.findById(req.params.id).populate('listingId');
    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }

    const isSeller = offer.sellerId.toString() === req.user._id.toString();
    const isBuyer = offer.buyerId.toString() === req.user._id.toString();

    if (!isSeller && !isBuyer && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Not authorized to respond to this offer' });
    }

    // Role state machine validation
    if (offer.status === 'PENDING' && !isSeller && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Only the listing seller can respond to a pending initial offer.'
      });
    }

    if (offer.status === 'COUNTERED' && !isBuyer && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Only the buyer can accept or decline a counter-offer.'
      });
    }

    if (upperAction === 'ACCEPT') {
      offer.status = 'ACCEPTED';
    } else if (upperAction === 'REJECT') {
      offer.status = 'REJECTED';
    } else if (upperAction === 'COUNTER') {
      const numAmount = Number(counterAmount);
      if (isNaN(numAmount) || numAmount <= 0) {
        return res.status(400).json({ success: false, message: 'Valid positive counter amount is required' });
      }
      offer.status = 'COUNTERED';
      offer.counterAmount = numAmount;
      offer.counterMessage = message ? String(message).slice(0, 500) : '';
    }

    await offer.save();

    // Target recipient for notification
    const recipientId = isSeller ? offer.buyerId : offer.sellerId;
    await Notification.create({
      userId: recipientId,
      title: `Offer ${upperAction === 'ACCEPT' ? 'Accepted' : upperAction === 'REJECT' ? 'Declined' : 'Countered'}`,
      message: `The offer on "${offer.listingId?.title || 'Listing'}" was ${upperAction.toLowerCase()}ed.`,
      type: 'OFFER',
      link: `/dashboard/messages`
    });

    res.json({ success: true, data: offer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user's offers (sent or received)
// @route   GET /api/marketplace/offers/my
// @access  Private
export const getMyOffers = async (req, res) => {
  try {
    const offers = await Offer.find({
      $or: [{ buyerId: req.user._id }, { sellerId: req.user._id }]
    })
      .populate('listingId', 'title price currency currencySymbol images')
      .populate('buyerId', 'name profilePhoto')
      .populate('sellerId', 'name profilePhoto')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: offers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
