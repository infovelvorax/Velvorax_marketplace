import { http } from './apiClient';

/**
 * Unified AI Assistant Service (Marketplace AI + Admin AI)
 * All paths resolve against baseURL (/api/marketplace)
 */
export const aiService = {
  // ==========================================
  // 1. UNIFIED MARKETPLACE AI (BUYER & SELLER)
  // ==========================================

  /**
   * Send chat message to unified Marketplace AI Assistant
   * @param {Object} payload
   * @param {string} payload.message - User query
   * @param {string} [payload.conversationId] - Active conversation ID
   * @param {string} [payload.currentListingId] - Current page listing ID context
   * @param {string} [payload.currentRoute] - Current route context
   * @param {Object} [payload.filters] - Current search filters
   */
  async chatWithMarketplaceAI(payload) {
    return await http.post('/ai/chat', payload);
  },

  /**
   * Get Marketplace AI conversation history
   */
  async getMarketplaceAIHistory(conversationId) {
    return await http.get('/ai/history', {
      params: conversationId ? { conversationId } : {}
    });
  },

  /**
   * Clear Marketplace AI conversation history
   */
  async clearMarketplaceAIHistory(conversationId) {
    return await http.post('/ai/clear', { conversationId });
  },

  // Direct / Legacy Aliases
  async chatWithBuyerAI(payload) {
    return await http.post('/ai/chat', payload);
  },
  async getBuyerAIHistory(conversationId) {
    return await http.get('/ai/history', {
      params: conversationId ? { conversationId } : {}
    });
  },
  async clearBuyerAIHistory(conversationId) {
    return await http.post('/ai/clear', { conversationId });
  },
  async chatWithSellerAI(payload) {
    return await http.post('/ai/chat', payload);
  },
  async getSellerAIHistory(conversationId) {
    return await http.get('/ai/history', {
      params: conversationId ? { conversationId } : {}
    });
  },
  async clearSellerAIHistory(conversationId) {
    return await http.post('/ai/clear', { conversationId });
  },

  // ==========================================
  // 2. ADMIN AI ASSISTANT (ADMIN ROLE ONLY)
  // ==========================================

  /**
   * Send query to dedicated Admin AI Assistant
   * @param {Object} payload
   * @param {string} payload.message - Administrative query
   * @param {string} [payload.conversationId] - Active admin conversation ID
   */
  async chatWithAdminAI(payload) {
    return await http.post('/admin/ai/chat', payload);
  },

  /**
   * Get Admin AI conversation history
   */
  async getAdminAIHistory(conversationId) {
    return await http.get('/admin/ai/history', {
      params: conversationId ? { conversationId } : {}
    });
  },

  /**
   * Clear Admin AI conversation history
   */
  async clearAdminAIHistory(conversationId) {
    return await http.post('/admin/ai/clear', { conversationId });
  }
};

export default aiService;

