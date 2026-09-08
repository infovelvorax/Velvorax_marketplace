import { AiConversation } from '../../models/AiConversation.js';
import { AiMessage } from '../../models/AiMessage.js';
import { buyerAiService } from './buyerAi.service.js';
import { sellerAiService } from './sellerAi.service.js';
import { adminAiService } from './adminAi.service.js';

export class AIService {
  /**
   * Helper to fetch or initialize conversation
   */
  async getOrCreateConversation({ conversationId, userId = null, sessionId = '', role = 'BUYER', title = 'New Conversation' }) {
    if (conversationId && conversationId.match(/^[0-9a-fA-F]{24}$/)) {
      const existing = await AiConversation.findById(conversationId);
      if (existing) {
        if (userId && !existing.userId) {
          existing.userId = userId;
          await existing.save();
        }
        return existing;
      }
    }

    // Try finding by active session or user
    if (userId) {
      const userConvo = await AiConversation.findOne({ userId, role }).sort({ updatedAt: -1 });
      if (userConvo) return userConvo;
    } else if (sessionId) {
      const sessionConvo = await AiConversation.findOne({ sessionId, role }).sort({ updatedAt: -1 });
      if (sessionConvo) return sessionConvo;
    }

    // Create new
    return await AiConversation.create({
      userId: userId || null,
      sessionId: sessionId || '',
      role,
      title
    });
  }

  /**
   * Handle Buyer AI interaction (Public / Logged in Buyer)
   */
  async handleBuyerChat({
    message,
    conversationId,
    userId = null,
    sessionId = '',
    currentListingId = null,
    currentRoute = '',
    filters = {}
  }) {
    const conversation = await this.getOrCreateConversation({
      conversationId,
      userId,
      sessionId,
      role: 'BUYER',
      title: message.substring(0, 30)
    });

    // Fetch latest 10 messages for context
    const recentMessages = await AiMessage.find({ conversationId: conversation._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Chronological order for history context
    const history = [...recentMessages].reverse();

    // Extract accumulated filters from most recent assistant message with filters
    let accumulatedFilters = {};
    for (const msg of recentMessages) {
      if (msg.sender === 'assistant') {
        const storedMeta = msg.metadata || {};
        if (storedMeta.filters && Object.keys(storedMeta.filters).length > 0) {
          accumulatedFilters = storedMeta.filters;
          break;
        }
      }
    }



    // Store user message
    await AiMessage.create({
      conversationId: conversation._id,
      sender: 'user',
      message
    });

    // Execute Buyer AI reasoning with two-stage intent analysis and real database tools
    const aiResult = await buyerAiService.processChatMessage({
      message,
      conversationHistory: history,
      currentListingId,
      currentRoute,
      filters,
      accumulatedFilters
    });

    // Store assistant message
    const assistantMsgDoc = await AiMessage.create({
      conversationId: conversation._id,
      sender: 'assistant',
      message: aiResult.message,
      metadata: {
        intent: aiResult.intent,
        filters: aiResult.filters,
        count: aiResult.count,
        listingCards: aiResult.listingCards || [],
        suggestions: aiResult.suggestions || []
      }
    });

    // Update conversation timestamp
    conversation.lastMessageAt = new Date();
    await conversation.save();

    return {
      conversationId: conversation._id.toString(),
      intent: aiResult.intent,
      filters: aiResult.filters,
      count: aiResult.count,
      results: aiResult.results || [],
      listingCards: aiResult.listingCards || [],
      message: aiResult.message,
      suggestions: aiResult.suggestions || [],
      messageId: assistantMsgDoc._id.toString()
    };
  }

  /**
   * Handle Seller AI interaction (Authenticated SELLER or ADMIN role)
   */
  async handleSellerChat({
    message,
    conversationId,
    sellerUser
  }) {
    if (!sellerUser) {
      throw new Error('Unauthorized: Authentication required for Seller AI Assistant');
    }

    const conversation = await this.getOrCreateConversation({
      conversationId,
      userId: sellerUser._id,
      role: 'SELLER',
      title: message.substring(0, 30)
    });

    const history = await AiMessage.find({ conversationId: conversation._id })
      .sort({ createdAt: 1 })
      .limit(10)
      .lean();

    // Store seller user message
    await AiMessage.create({
      conversationId: conversation._id,
      sender: 'user',
      message
    });

    // Execute Seller AI reasoning strictly scoped to authenticated seller
    const aiResult = await sellerAiService.processChatMessage({
      sellerId: sellerUser._id,
      message,
      conversationHistory: history
    });

    // Save assistant reply
    const assistantMsgDoc = await AiMessage.create({
      conversationId: conversation._id,
      sender: 'assistant',
      message: aiResult.message,
      metadata: {
        listingCards: aiResult.listingCards || [],
        statsCards: aiResult.statsCards || [],
        actionLinks: aiResult.actionLinks || []
      }
    });

    conversation.lastMessageAt = new Date();
    await conversation.save();

    return {
      conversationId: conversation._id.toString(),
      message: aiResult.message,
      listingCards: aiResult.listingCards || [],
      statsCards: aiResult.statsCards || [],
      actionLinks: aiResult.actionLinks || [],
      messageId: assistantMsgDoc._id.toString()
    };
  }

  /**
   * Handle Admin AI interaction (requires verified ADMIN role)
   */
  async handleAdminChat({
    message,
    conversationId,
    adminUser
  }) {
    if (!adminUser || (adminUser.role || '').toUpperCase() !== 'ADMIN') {
      throw new Error('Unauthorized: Admin role required for Admin AI Assistant');
    }

    const conversation = await this.getOrCreateConversation({
      conversationId,
      userId: adminUser._id,
      role: 'ADMIN',
      title: message.substring(0, 30)
    });

    const history = await AiMessage.find({ conversationId: conversation._id })
      .sort({ createdAt: 1 })
      .limit(10)
      .lean();

    // Save admin user message
    await AiMessage.create({
      conversationId: conversation._id,
      sender: 'user',
      message
    });

    // Execute Admin AI reasoning with live aggregations
    const aiResult = await adminAiService.processChatMessage({
      message,
      conversationHistory: history
    });

    // Save assistant reply
    const assistantMsgDoc = await AiMessage.create({
      conversationId: conversation._id,
      sender: 'assistant',
      message: aiResult.message,
      metadata: {
        statsCards: aiResult.statsCards || [],
        actionLinks: aiResult.actionLinks || []
      }
    });

    conversation.lastMessageAt = new Date();
    await conversation.save();

    return {
      conversationId: conversation._id.toString(),
      message: aiResult.message,
      statsCards: aiResult.statsCards || [],
      actionLinks: aiResult.actionLinks || [],
      messageId: assistantMsgDoc._id.toString()
    };
  }

  /**
   * Get conversation history
   */
  async getHistory({ conversationId, userId = null, sessionId = '', role = 'BUYER' }) {
    let conversation = null;
    if (conversationId && conversationId.match(/^[0-9a-fA-F]{24}$/)) {
      conversation = await AiConversation.findById(conversationId);
    } else if (userId) {
      conversation = await AiConversation.findOne({ userId, role }).sort({ updatedAt: -1 });
    } else if (sessionId) {
      conversation = await AiConversation.findOne({ sessionId, role }).sort({ updatedAt: -1 });
    }

    if (!conversation) {
      return { conversationId: null, messages: [] };
    }

    const messages = await AiMessage.find({ conversationId: conversation._id })
      .sort({ createdAt: 1 })
      .lean();

    return {
      conversationId: conversation._id.toString(),
      messages: messages.map((m) => ({
        id: m._id.toString(),
        sender: m.sender,
        message: m.message,
        metadata: m.metadata || {},
        createdAt: m.createdAt
      }))
    };
  }

  /**
   * Clear AI conversation
   */
  async clearHistory({ conversationId, userId = null, sessionId = '', role = 'BUYER' }) {
    const query = { role };
    if (conversationId && conversationId.match(/^[0-9a-fA-F]{24}$/)) {
      query._id = conversationId;
    } else if (userId) {
      query.userId = userId;
    } else if (sessionId) {
      query.sessionId = sessionId;
    }

    const convos = await AiConversation.find(query);
    const convoIds = convos.map((c) => c._id);

    if (convoIds.length > 0) {
      await AiMessage.deleteMany({ conversationId: { $in: convoIds } });
      await AiConversation.deleteMany({ _id: { $in: convoIds } });
    }

    return { success: true, message: 'AI conversation history cleared' };
  }
}

export const aiService = new AIService();
export default aiService;
