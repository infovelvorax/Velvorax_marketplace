import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { aiService } from '../services/ai/ai.service.js';

// Optional token extractor helper for public/buyer AI
const extractOptionalUser = async (req) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      return await User.findById(decoded.id).select('-passwordHash');
    } catch {
      return null;
    }
  }
  return null;
};

// ==========================================
// 0. UNIFIED MARKETPLACE AI (BUYER & SELLER)
// ==========================================

// @desc    Unified Marketplace AI Chat (Determines Buyer or Seller mode from authenticated backend role)
// @route   POST /api/marketplace/ai/chat
// @access  Private (Authenticated User - Buyer or Seller)
export const chatWithMarketplaceAI = async (req, res) => {
  try {
    const { message, conversationId, currentListingId, currentRoute, filters } = req.body;

    if (!message || typeof message !== 'string' || message.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Please provide a non-empty message.'
      });
    }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'AUTH_REQUIRED',
        message: 'Please sign in to use Marketplace AI.'
      });
    }

    const rawRole = (req.user.role || '').toUpperCase();

    // Strict Admin Isolation: Admin AI is separate
    if (rawRole === 'ADMIN' || rawRole === 'MODERATOR') {
      return res.status(403).json({
        success: false,
        error: 'ADMIN_ISOLATION',
        message: 'Admin AI is separate and accessible in the Admin Dashboard.'
      });
    }

    // Role-based routing: SELLER
    if (['SELLER', 'PROVIDER', 'EMPLOYER', 'BUSINESS'].includes(rawRole)) {
      const result = await aiService.handleSellerChat({
        message: message.trim(),
        conversationId,
        sellerUser: req.user
      });

      return res.json({
        success: true,
        mode: 'seller',
        data: result
      });
    }

    // Role-based routing: BUYER (Default for normal users)
    const result = await aiService.handleBuyerChat({
      message: message.trim(),
      conversationId,
      userId: req.user._id,
      currentListingId,
      currentRoute,
      filters
    });

    return res.json({
      success: true,
      mode: 'buyer',
      data: result
    });
  } catch (error) {
    console.error('[Marketplace AI] Controller Error:', error);
    return res.status(500).json({
      success: false,
      error: 'DATABASE_ERROR',
      message: 'Failed to process AI query.'
    });
  }
};

export const getMarketplaceAIHistory = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'AUTH_REQUIRED', message: 'Unauthorized' });
    }
    const rawRole = (req.user.role || '').toUpperCase();
    const isSeller = ['SELLER', 'PROVIDER', 'EMPLOYER', 'BUSINESS'].includes(rawRole);
    const { conversationId } = req.query;

    const history = await aiService.getHistory({
      conversationId,
      userId: req.user._id,
      role: isSeller ? 'SELLER' : 'BUYER'
    });

    return res.json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('getMarketplaceAIHistory error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve AI history.'
    });
  }
};

export const clearMarketplaceAIHistory = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'AUTH_REQUIRED', message: 'Unauthorized' });
    }
    const rawRole = (req.user.role || '').toUpperCase();
    const isSeller = ['SELLER', 'PROVIDER', 'EMPLOYER', 'BUSINESS'].includes(rawRole);
    const { conversationId } = req.body;

    const result = await aiService.clearHistory({
      conversationId,
      userId: req.user._id,
      role: isSeller ? 'SELLER' : 'BUYER'
    });

    return res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('clearMarketplaceAIHistory error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to clear chat history.'
    });
  }
};

// ==========================================
// 1. BUYER / PUBLIC MARKETPLACE AI
// ==========================================

// @desc    Buyer / Public Marketplace AI Chat
// @route   POST /api/marketplace/ai/buyer/chat (or /api/marketplace/ai/chat)
// @access  Public / Authenticated Buyer
export const chatWithBuyerAI = async (req, res) => {
  try {
    const { message, conversationId, sessionId, currentListingId, currentRoute, filters } = req.body;

    if (!message || typeof message !== 'string' || message.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Please provide a non-empty message.'
      });
    }

    // Extract user if logged in
    const authUser = req.user || (await extractOptionalUser(req));
    const userId = authUser ? authUser._id : null;

    const result = await aiService.handleBuyerChat({
      message: message.trim(),
      conversationId,
      userId,
      sessionId: sessionId || req.ip || '',
      currentListingId,
      currentRoute: currentRoute || '',
      filters: filters || {}
    });

    return res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('chatWithBuyerAI controller error:', error);
    return res.json({
      success: true,
      data: {
        message: "I am ready to help you explore properties, vehicles, electronics, jobs, and services on Velvorax. What are you searching for today?",
        listingCards: [],
        suggestions: ["Find 2BHK apartments in Coimbatore", "Laptops under ₹50,000", "Bikes near Chennai"]
      }
    });
  }
};

// @desc    Get Buyer AI Chat History
// @route   GET /api/marketplace/ai/buyer/history (or /api/marketplace/ai/history)
// @access  Public / Authenticated Buyer
export const getBuyerAIHistory = async (req, res) => {
  try {
    const { conversationId, sessionId } = req.query;
    const authUser = req.user || (await extractOptionalUser(req));
    const userId = authUser ? authUser._id : null;

    const history = await aiService.getHistory({
      conversationId,
      userId,
      sessionId: sessionId || req.ip || '',
      role: 'BUYER'
    });

    return res.json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('getBuyerAIHistory error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve AI history.'
    });
  }
};

// @desc    Clear Buyer AI Chat History
// @route   POST /api/marketplace/ai/buyer/clear (or /api/marketplace/ai/clear)
// @access  Public / Authenticated Buyer
export const clearBuyerAIHistory = async (req, res) => {
  try {
    const { conversationId, sessionId } = req.body;
    const authUser = req.user || (await extractOptionalUser(req));
    const userId = authUser ? authUser._id : null;

    const result = await aiService.clearHistory({
      conversationId,
      userId,
      sessionId: sessionId || req.ip || '',
      role: 'BUYER'
    });

    return res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('clearBuyerAIHistory error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to clear chat history.'
    });
  }
};

// ==========================================
// 2. SELLER / MERCHANT MARKETPLACE AI
// ==========================================

// @desc    Seller / Merchant AI Chat
// @route   POST /api/marketplace/ai/seller/chat
// @access  Private (SELLER or ADMIN role required)
export const chatWithSellerAI = async (req, res) => {
  try {
    if (!req.user || !['SELLER', 'ADMIN'].includes((req.user.role || '').toUpperCase())) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Seller or Admin authorization required for Seller AI Assistant.'
      });
    }

    const { message, conversationId } = req.body;
    if (!message || typeof message !== 'string' || message.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Please provide a seller query.'
      });
    }

    const result = await aiService.handleSellerChat({
      message: message.trim(),
      conversationId,
      sellerUser: req.user
    });

    return res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('chatWithSellerAI controller error:', error);
    return res.json({
      success: true,
      data: {
        message: "Hello! I am your Velvorax Seller Assistant. I can help you monitor your store listings, view moderation progress, track orders, and boost your sales.",
        listingCards: [],
        statsCards: [],
        actionLinks: [
          { label: 'My Listings', url: '/seller/listings' },
          { label: 'Store Orders', url: '/seller/orders' }
        ]
      }
    });
  }
};

// @desc    Get Seller AI Chat History
// @route   GET /api/marketplace/ai/seller/history
// @access  Private (SELLER or ADMIN only)
export const getSellerAIHistory = async (req, res) => {
  try {
    if (!req.user || !['SELLER', 'ADMIN'].includes((req.user.role || '').toUpperCase())) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Seller authorization required.'
      });
    }

    const { conversationId } = req.query;
    const history = await aiService.getHistory({
      conversationId,
      userId: req.user._id,
      role: 'SELLER'
    });

    return res.json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('getSellerAIHistory error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve Seller AI history.'
    });
  }
};

// @desc    Clear Seller AI Chat History
// @route   POST /api/marketplace/ai/seller/clear
// @access  Private (SELLER or ADMIN only)
export const clearSellerAIHistory = async (req, res) => {
  try {
    if (!req.user || !['SELLER', 'ADMIN'].includes((req.user.role || '').toUpperCase())) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Seller authorization required.'
      });
    }

    const { conversationId } = req.body;
    const result = await aiService.clearHistory({
      conversationId,
      userId: req.user._id,
      role: 'SELLER'
    });

    return res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('clearSellerAIHistory error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to clear Seller AI history.'
    });
  }
};

// ==========================================
// 3. ADMIN MARKETPLACE AI
// ==========================================

// @desc    Dedicated Admin AI Chat
// @route   POST /api/marketplace/admin/ai/chat (or /api/marketplace/ai/admin/chat)
// @access  Private (ADMIN role strictly required)
export const chatWithAdminAI = async (req, res) => {
  try {
    // Strict authentication & authorization guarantee
    if (!req.user || (req.user.role || '').toUpperCase() !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Admin authorization required for Admin AI Assistant.'
      });
    }

    const { message, conversationId } = req.body;
    if (!message || typeof message !== 'string' || message.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Please provide an administrative query.'
      });
    }

    const result = await aiService.handleAdminChat({
      message: message.trim(),
      conversationId,
      adminUser: req.user
    });

    return res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('chatWithAdminAI controller error:', error);
    return res.json({
      success: true,
      data: {
        message: "Hello Administrator! I can provide executive metrics, review pending sellers, monitor moderation queues, and aggregate marketplace order revenue.",
        statsCards: [],
        actionLinks: [
          { label: 'Seller Approvals', url: '/admin/sellers' },
          { label: 'Moderation Queue', url: '/admin/moderation' }
        ]
      }
    });
  }
};

// @desc    Get Admin AI Chat History
// @route   GET /api/marketplace/admin/ai/history
// @access  Private (ADMIN only)
export const getAdminAIHistory = async (req, res) => {
  try {
    if (!req.user || (req.user.role || '').toUpperCase() !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Admin role required.'
      });
    }

    const { conversationId } = req.query;
    const history = await aiService.getHistory({
      conversationId,
      userId: req.user._id,
      role: 'ADMIN'
    });

    return res.json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('getAdminAIHistory error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve Admin AI history.'
    });
  }
};

// @desc    Clear Admin AI Chat History
// @route   POST /api/marketplace/admin/ai/clear
// @access  Private (ADMIN only)
export const clearAdminAIHistory = async (req, res) => {
  try {
    if (!req.user || (req.user.role || '').toUpperCase() !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Admin role required.'
      });
    }

    const { conversationId } = req.body;
    const result = await aiService.clearHistory({
      conversationId,
      userId: req.user._id,
      role: 'ADMIN'
    });

    return res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('clearAdminAIHistory error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to clear Admin AI history.'
    });
  }
};

export default {
  chatWithMarketplaceAI,
  getMarketplaceAIHistory,
  clearMarketplaceAIHistory,
  chatWithBuyerAI,
  getBuyerAIHistory,
  clearBuyerAIHistory,
  chatWithSellerAI,
  getSellerAIHistory,
  clearSellerAIHistory,
  chatWithAdminAI,
  getAdminAIHistory,
  clearAdminAIHistory
};
