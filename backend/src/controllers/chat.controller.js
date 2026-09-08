import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';
import { Notification } from '../models/Notification.js';

// @desc    Get all conversations for logged in user
// @route   GET /api/marketplace/conversations
// @access  Private
export const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id
    })
      .populate('participants', 'name email phone profilePhoto role rating verificationStatus location')
      .populate('listingId', 'title price currency currencySymbol images status categorySlug location')
      .sort({ updatedAt: -1 });

    res.json({ success: true, data: conversations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// @desc    Get or create conversation with a seller regarding a listing
// @route   POST /api/marketplace/conversations
// @access  Private
export const getOrCreateConversation = async (req, res) => {
  try {
    const { sellerId, listingId } = req.body;
    if (!sellerId) {
      return res.status(400).json({ success: false, message: 'Seller ID is required' });
    }

    // Check if conversation already exists between these 2 users (optionally for same listing)
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, sellerId] },
      ...(listingId ? { listingId } : {})
    })
      .populate('participants', 'name email phone profilePhoto role rating verificationStatus location')
      .populate('listingId', 'title price currency currencySymbol images status categorySlug location');

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user._id, sellerId],
        listingId: listingId || null,
        unreadCounts: new Map()
      });

      conversation = await Conversation.findById(conversation._id)
        .populate('participants', 'name email phone profilePhoto role rating verificationStatus location')
        .populate('listingId', 'title price currency currencySymbol images status categorySlug location');
    }

    res.json({ success: true, data: conversation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get messages for a conversation
// @route   GET /api/marketplace/conversations/:id/messages
// @access  Private
export const getMessages = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    if (!conversation.participants.some(p => p.toString() === req.user._id.toString())) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const messages = await Message.find({ conversationId: req.params.id })
      .populate('senderId', 'name profilePhoto email phone role')
      .sort({ createdAt: 1 });

    // Mark as read
    await Message.updateMany(
      { conversationId: req.params.id, senderId: { $ne: req.user._id }, isRead: false },
      { isRead: true }
    );

    res.json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Send message in a conversation
// @route   POST /api/marketplace/conversations/:id/messages
// @access  Private
export const sendMessage = async (req, res) => {
  try {
    const { text, content, images, offerDetails } = req.body;
    const messageText = (text || content || '').trim();
    if (!messageText && (!images || images.length === 0) && !offerDetails) {
      return res.status(400).json({ success: false, message: 'Message content cannot be empty' });
    }

    if (messageText.length > 2000) {
      return res.status(400).json({ success: false, message: 'Message text exceeds the maximum limit of 2000 characters' });
    }

    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    // IDOR / BOLA Prevention: Verify authenticated user is a participant of this conversation
    const isParticipant = conversation.participants.some(
      p => p.toString() === req.user._id.toString()
    );

    if (!isParticipant && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to send messages in this conversation'
      });
    }

    const sanitizedImages = Array.isArray(images) ? images.slice(0, 3) : [];

    const message = await Message.create({
      conversationId: req.params.id,
      senderId: req.user._id,
      text: messageText || (offerDetails ? `Made an offer: ${offerDetails.currency || '₹'}${offerDetails.amount}` : 'Sent an attachment'),
      images: sanitizedImages,
      offerDetails: offerDetails || undefined
    });

    // Update conversation lastMessage
    conversation.lastMessage = {
      text: message.text,
      senderId: req.user._id,
      createdAt: message.createdAt
    };
    await conversation.save();

    // Identify recipient and create notification
    const recipientId = conversation.participants.find(p => p.toString() !== req.user._id.toString());
    if (recipientId) {
      const senderName = req.user.name || 'User';
      await Notification.create({
        userId: recipientId,
        title: `New Message from ${senderName}`,
        message: `${senderName}: ${message.text.substring(0, 100)}`,
        type: 'MESSAGE',
        link: `/dashboard/messages?conversation=${conversation._id}`
      });
    }

    const populatedMessage = await Message.findById(message._id).populate('senderId', 'name profilePhoto email phone role');

    res.status(201).json({ success: true, data: populatedMessage });
  } catch (error) {
    console.error('sendMessage error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
