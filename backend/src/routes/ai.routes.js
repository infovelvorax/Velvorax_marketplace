import express from 'express';
import {
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
} from '../controllers/ai.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { rateLimitBuyerAI, rateLimitSellerAI, rateLimitAdminAI } from '../middleware/rateLimit.middleware.js';

export const marketplaceAiRouter = express.Router();
export const buyerAiRouter = express.Router();
export const sellerAiRouter = express.Router();
export const adminAiRouter = express.Router();

// ==========================================
// 1. UNIFIED MARKETPLACE AI ROUTES (AUTHENTICATED BUYER & SELLER)
// ==========================================
marketplaceAiRouter.use(protect);
marketplaceAiRouter.post('/chat', rateLimitBuyerAI, chatWithMarketplaceAI);
marketplaceAiRouter.get('/history', getMarketplaceAIHistory);
marketplaceAiRouter.post('/clear', clearMarketplaceAIHistory);

// Legacy / Direct Sub-endpoints for backward compatibility
marketplaceAiRouter.post('/buyer/chat', rateLimitBuyerAI, chatWithBuyerAI);
marketplaceAiRouter.get('/buyer/history', getBuyerAIHistory);
marketplaceAiRouter.post('/buyer/clear', clearBuyerAIHistory);

marketplaceAiRouter.post('/seller/chat', rateLimitSellerAI, chatWithSellerAI);
marketplaceAiRouter.get('/seller/history', getSellerAIHistory);
marketplaceAiRouter.post('/seller/clear', clearSellerAIHistory);

// ==========================================
// 2. BUYER ALIAS ROUTER
// ==========================================
buyerAiRouter.post('/chat', rateLimitBuyerAI, chatWithBuyerAI);
buyerAiRouter.get('/history', getBuyerAIHistory);
buyerAiRouter.post('/clear', clearBuyerAIHistory);

// ==========================================
// 3. SELLER ALIAS ROUTER (SELLER/ADMIN ONLY)
// ==========================================
sellerAiRouter.use(protect);
sellerAiRouter.use(authorize('SELLER', 'ADMIN'));
sellerAiRouter.post('/chat', rateLimitSellerAI, chatWithSellerAI);
sellerAiRouter.get('/history', getSellerAIHistory);
sellerAiRouter.post('/clear', clearSellerAIHistory);

// ==========================================
// 4. ADMIN AI ROUTES (STRICTLY ADMIN ONLY)
// ==========================================
adminAiRouter.use(protect);
adminAiRouter.use(authorize('ADMIN'));
adminAiRouter.post('/chat', rateLimitAdminAI, chatWithAdminAI);
adminAiRouter.get('/history', getAdminAIHistory);
adminAiRouter.post('/clear', clearAdminAIHistory);

export default { marketplaceAiRouter, buyerAiRouter, sellerAiRouter, adminAiRouter };
