import mongoose from 'mongoose';
import { Listing } from '../../models/Listing.js';
import { Order } from '../../models/Order.js';
import { Conversation } from '../../models/Conversation.js';
import { Message } from '../../models/Message.js';
import { Notification } from '../../models/Notification.js';
import { User } from '../../models/User.js';
import { SellerVerification } from '../../models/SellerVerification.js';
import { aiProvider } from './ai.provider.js';

// Escape regex special characters
const escapeRegex = (str = '') => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export class SellerAIService {
  /**
   * Tool 1: Get Seller's listings with optional status and search filters
   */
  async getSellerListings(sellerId, params = {}) {
    if (!sellerId) return [];
    try {
      const { status, q, limit = 8 } = params;
      const query = { sellerId: new mongoose.Types.ObjectId(sellerId) };

      if (status && status !== 'ALL') {
        const s = status.toUpperCase().trim();
        if (s === 'PENDING') {
          query.status = { $in: ['PENDING', 'PENDING_REVIEW', 'UNDER_REVIEW'] };
        } else {
          query.status = s;
        }
      }

      if (q && q.trim()) {
        const escaped = escapeRegex(q.trim());
        query.$or = [
          { title: { $regex: escaped, $options: 'i' } },
          { categorySlug: { $regex: escaped, $options: 'i' } },
          { subcategoryName: { $regex: escaped, $options: 'i' } }
        ];
      }

      const listings = await Listing.find(query)
        .populate('categoryId', 'name slug')
        .sort({ createdAt: -1 })
        .limit(Math.min(20, limit))
        .lean();

      return listings.map((item) => ({
        id: item._id.toString(),
        _id: item._id.toString(),
        title: item.title,
        price: item.price,
        currencySymbol: item.currencySymbol || '₹',
        categorySlug: item.categorySlug,
        categoryName: item.categoryId?.name || item.categorySlug,
        status: item.status,
        rejectionReason: item.rejectionReason || '',
        views: item.views || 0,
        inquiriesCount: item.inquiriesCount || 0,
        createdAt: item.createdAt,
        image: Array.isArray(item.images) && item.images.length > 0 ? item.images[0] : null,
        url: item.categorySlug === 'properties' ? `/properties/${item._id}` : `/listing/${item._id}`
      }));
    } catch (err) {
      console.error('getSellerListings error:', err);
      return [];
    }
  }

  /**
   * Tool 2: Aggregate Seller Listing statistics
   */
  async getSellerListingStats(sellerId) {
    if (!sellerId) return {};
    try {
      const sId = new mongoose.Types.ObjectId(sellerId);
      const [
        totalListings,
        approvedListings,
        pendingListings,
        changesRequestedListings,
        rejectedListings,
        draftListings,
        viewsAgg
      ] = await Promise.all([
        Listing.countDocuments({ sellerId: sId }),
        Listing.countDocuments({ sellerId: sId, status: 'APPROVED' }),
        Listing.countDocuments({ sellerId: sId, status: { $in: ['PENDING', 'PENDING_REVIEW', 'UNDER_REVIEW'] } }),
        Listing.countDocuments({ sellerId: sId, status: 'CHANGES_REQUESTED' }),
        Listing.countDocuments({ sellerId: sId, status: 'REJECTED' }),
        Listing.countDocuments({ sellerId: sId, status: 'DRAFT' }),
        Listing.aggregate([
          { $match: { sellerId: sId } },
          { $group: { _id: null, totalViews: { $sum: '$views' }, totalInquiries: { $sum: '$inquiriesCount' } } }
        ])
      ]);

      return {
        totalListings,
        approvedListings,
        pendingListings,
        changesRequestedListings,
        rejectedListings,
        draftListings,
        totalViews: viewsAgg[0]?.totalViews || 0,
        totalInquiries: viewsAgg[0]?.totalInquiries || 0
      };
    } catch (err) {
      console.error('getSellerListingStats error:', err);
      return {
        totalListings: 0,
        approvedListings: 0,
        pendingListings: 0,
        changesRequestedListings: 0,
        rejectedListings: 0,
        draftListings: 0,
        totalViews: 0,
        totalInquiries: 0
      };
    }
  }

  /**
   * Tool 3: Get Seller Orders and Sales
   */
  async getSellerOrders(sellerId, params = {}) {
    if (!sellerId) return [];
    try {
      const { orderStatus, limit = 6 } = params;
      const query = { sellerId: new mongoose.Types.ObjectId(sellerId) };

      if (orderStatus && orderStatus !== 'ALL') {
        query.orderStatus = orderStatus.toUpperCase().trim();
      }

      const orders = await Order.find(query)
        .populate('buyerId', 'name email phone')
        .populate('listingId', 'title price images categorySlug')
        .sort({ createdAt: -1 })
        .limit(Math.min(20, limit))
        .lean();

      return orders.map((o) => ({
        id: o._id.toString(),
        orderNumber: o.orderNumber,
        amount: o.amount,
        currencySymbol: o.currencySymbol || '₹',
        paymentStatus: o.paymentStatus,
        orderStatus: o.orderStatus,
        buyerName: o.buyerId?.name || 'Buyer',
        buyerEmail: o.buyerId?.email || '',
        listingTitle: o.listingId?.title || 'Marketplace Item',
        createdAt: o.createdAt
      }));
    } catch (err) {
      console.error('getSellerOrders error:', err);
      return [];
    }
  }

  /**
   * Tool 4: Aggregate Seller Sales Revenue & Metrics
   */
  async getSellerSalesStats(sellerId) {
    if (!sellerId) return {};
    try {
      const sId = new mongoose.Types.ObjectId(sellerId);
      const [
        totalOrders,
        completedOrders,
        pendingOrders,
        shippedOrders,
        cancelledOrders,
        earningsAgg
      ] = await Promise.all([
        Order.countDocuments({ sellerId: sId }),
        Order.countDocuments({ sellerId: sId, orderStatus: { $in: ['COMPLETED', 'completed', 'DELIVERED', 'delivered'] } }),
        Order.countDocuments({ sellerId: sId, orderStatus: { $in: ['PENDING', 'pending', 'PROCESSING', 'processing'] } }),
        Order.countDocuments({ sellerId: sId, orderStatus: { $in: ['SHIPPED', 'shipped'] } }),
        Order.countDocuments({ sellerId: sId, orderStatus: { $in: ['CANCELLED', 'cancelled'] } }),
        Order.aggregate([
          { $match: { sellerId: sId, paymentStatus: { $in: ['PAID', 'paid'] } } },
          { $group: { _id: null, totalEarnings: { $sum: '$amount' } } }
        ])
      ]);

      return {
        totalOrders,
        completedOrders,
        pendingOrders,
        shippedOrders,
        cancelledOrders,
        totalEarnings: earningsAgg[0]?.totalEarnings || 0
      };
    } catch (err) {
      console.error('getSellerSalesStats error:', err);
      return {
        totalOrders: 0,
        completedOrders: 0,
        pendingOrders: 0,
        shippedOrders: 0,
        cancelledOrders: 0,
        totalEarnings: 0
      };
    }
  }

  /**
   * Tool 5: Get Seller Conversations & Buyer Enquiries
   */
  async getSellerCustomerEnquiries(sellerId, limit = 5) {
    if (!sellerId) return [];
    try {
      const sId = new mongoose.Types.ObjectId(sellerId);
      const conversations = await Conversation.find({ participants: sId })
        .populate('participants', 'name email role')
        .populate('listingId', 'title price')
        .sort({ updatedAt: -1 })
        .limit(Math.min(15, limit))
        .lean();

      return conversations.map((c) => {
        const buyer = (c.participants || []).find((p) => p._id.toString() !== sellerId.toString());
        const unreadForSeller = c.unreadCounts?.get ? c.unreadCounts.get(sellerId.toString()) || 0 : (c.unreadCounts?.[sellerId.toString()] || 0);

        return {
          id: c._id.toString(),
          buyerName: buyer?.name || 'Customer',
          buyerEmail: buyer?.email || '',
          listingTitle: c.listingId?.title || 'General Enquiry',
          lastMessage: c.lastMessage?.text || '',
          lastMessageTime: c.lastMessage?.createdAt || c.updatedAt,
          unreadCount: unreadForSeller
        };
      });
    } catch (err) {
      console.error('getSellerCustomerEnquiries error:', err);
      return [];
    }
  }

  /**
   * Tool 6: Get Seller Notifications
   */
  async getSellerNotifications(sellerId, limit = 5) {
    if (!sellerId) return [];
    try {
      const sId = new mongoose.Types.ObjectId(sellerId);
      const notifications = await Notification.find({ userId: sId })
        .sort({ createdAt: -1 })
        .limit(Math.min(15, limit))
        .lean();

      return notifications.map((n) => ({
        id: n._id.toString(),
        title: n.title,
        message: n.message,
        type: n.type,
        isRead: n.isRead,
        createdAt: n.createdAt
      }));
    } catch (err) {
      console.error('getSellerNotifications error:', err);
      return [];
    }
  }

  /**
   * Tool 7: Get Seller Profile & KYC Verification Status
   */
  async getSellerProfile(sellerId) {
    if (!sellerId) return null;
    try {
      const [user, verification] = await Promise.all([
        User.findById(sellerId).select('name email phone companyName businessType sellerStatus verificationStatus rating reviewCount location createdAt').lean(),
        SellerVerification.findOne({ sellerId }).select('sellerType businessName reraId documentType status rejectionReason adminNotes updatedAt').lean()
      ]);

      if (!user) return null;

      return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        companyName: user.companyName || user.name,
        businessType: user.businessType || 'General',
        sellerStatus: user.sellerStatus || 'APPROVED',
        verificationStatus: user.verificationStatus || 'UNVERIFIED',
        rating: user.rating || 5.0,
        reviewCount: user.reviewCount || 0,
        location: user.location || {},
        verificationDetails: verification ? {
          sellerType: verification.sellerType,
          businessName: verification.businessName,
          reraId: verification.reraId,
          documentType: verification.documentType,
          status: verification.status,
          rejectionReason: verification.rejectionReason,
          updatedAt: verification.updatedAt
        } : null
      };
    } catch (err) {
      console.error('getSellerProfile error:', err);
      return null;
    }
  }

  /**
   * Extract natural seller query intent
   */
  parseSellerQuery(message = '') {
    const text = message.toLowerCase().trim();
    const params = {};

    if (text.includes('pending') || text.includes('in review') || text.includes('under review')) {
      params.listingStatus = 'PENDING';
    } else if (text.includes('approved') || text.includes('active') || text.includes('live')) {
      params.listingStatus = 'APPROVED';
    } else if (text.includes('rejected')) {
      params.listingStatus = 'REJECTED';
    } else if (text.includes('changes requested') || text.includes('revision')) {
      params.listingStatus = 'CHANGES_REQUESTED';
    }

    if (text.includes('order') || text.includes('sale') || text.includes('earnings') || text.includes('revenue')) {
      params.intent = 'orders';
    } else if (text.includes('message') || text.includes('enquir') || text.includes('buyer') || text.includes('chat')) {
      params.intent = 'messages';
    } else if (text.includes('verify') || text.includes('kyc') || text.includes('rera') || text.includes('badge') || text.includes('document')) {
      params.intent = 'verification';
    } else if (text.includes('view') || text.includes('performance') || text.includes('stat') || text.includes('how many')) {
      params.intent = 'stats';
    } else if (text.includes('listing') || text.includes('product') || text.includes('property') || text.includes('item') || text.includes('car')) {
      params.intent = 'listings';
    }

    return params;
  }

  /**
   * Process Seller AI Chat Message
   */
  async processChatMessage({ sellerId, message, conversationHistory = [] }) {
    if (!message || typeof message !== 'string') {
      return {
        message: "Hello! I am your Velvorax Seller Assistant. How can I help you manage your store and inventory today?",
        listingCards: [],
        statsCards: [],
        actionLinks: []
      };
    }

    if (!sellerId) {
      return {
        message: "Please log in to your Velvorax Seller Account to access your real-time store analytics, orders, and listings.",
        listingCards: [],
        statsCards: [],
        actionLinks: [{ label: 'Seller Login', url: '/login' }]
      };
    }

    const trimmedMsg = message.trim();
    const textLower = trimmedMsg.toLowerCase();
    const parsedIntent = this.parseSellerQuery(trimmedMsg);

    // Fetch live MongoDB seller data scoped strictly to sellerId
    const [listingStats, salesStats, profile, recentEnquiries, notifications] = await Promise.all([
      this.getSellerListingStats(sellerId),
      this.getSellerSalesStats(sellerId),
      this.getSellerProfile(sellerId),
      this.getSellerCustomerEnquiries(sellerId, 5),
      this.getSellerNotifications(sellerId, 5)
    ]);

    let targetedListings = [];
    let targetedOrders = [];

    if (parsedIntent.listingStatus || parsedIntent.intent === 'listings' || textLower.includes('my list') || textLower.includes('show list')) {
      targetedListings = await this.getSellerListings(sellerId, { status: parsedIntent.listingStatus, limit: 6 });
    }

    if (parsedIntent.intent === 'orders' || textLower.includes('order') || textLower.includes('sale')) {
      targetedOrders = await this.getSellerOrders(sellerId, { limit: 5 });
    }

    // Construct Safe Seller System Prompt
    const systemPrompt = `You are the dedicated Seller AI Assistant for Velvorax Marketplace.
Your role is to empower merchants, property agents, and business owners to manage their inventory, understand moderation status, fulfill orders, and optimize sales.

PRIMARY RULES & SECURITY PROTOCOLS:
1. TRUTHFULNESS & ZERO HALLUCINATIONS: You MUST ONLY refer to the real merchant data provided in the context. Never invent fake listings, orders, buyer details, or revenue figures.
2. PRIVACY IS PARAMOUNT: You only have access to THIS merchant's data (${profile?.name || 'Seller'}). Never mention or reveal other sellers' business metrics or buyer data outside their transactions.
3. CLEAR SELLER GUIDANCE: Provide clear next steps for listings that need attention (e.g. if a listing is PENDING_REVIEW, explain the moderation team reviews within 24 hours; if CHANGES_REQUESTED, explain how to edit).
4. TONE: Professional, encouraging, merchant-centric, and structured with concise markdown bullet points.

REAL SELLER STORE DATA (Live from MongoDB):
- Merchant Name: ${profile?.name || 'Seller'} (${profile?.companyName || 'Individual Merchant'})
- Verification Status: ${profile?.verificationStatus || 'UNVERIFIED'} (Seller Status: ${profile?.sellerStatus || 'APPROVED'})
- Store Rating: ${profile?.rating || 5.0}⭐ (${profile?.reviewCount || 0} reviews)
- Total Listings: ${listingStats.totalListings || 0}
  • Live Approved: ${listingStats.approvedListings || 0}
  • Pending Review: ${listingStats.pendingListings || 0}
  • Changes Requested: ${listingStats.changesRequestedListings || 0}
  • Rejected: ${listingStats.rejectedListings || 0}
- Total Listing Views: ${listingStats.totalViews || 0}
- Total Buyer Inquiries: ${listingStats.totalInquiries || 0}
- Total Orders: ${salesStats.totalOrders || 0} (Completed: ${salesStats.completedOrders || 0}, Pending: ${salesStats.pendingOrders || 0})
- Total Paid Revenue: ₹${(salesStats.totalEarnings || 0).toLocaleString()}
${profile?.verificationDetails ? `- KYC Verification: Status=${profile.verificationDetails.status}, Type=${profile.verificationDetails.documentType}${profile.verificationDetails.rejectionReason ? `, Note=${profile.verificationDetails.rejectionReason}` : ''}` : ''}

${
  targetedListings.length > 0
    ? `FETCHED LISTINGS (${targetedListings.length}):
${targetedListings.map((l) => `• "${l.title}" - ${l.currencySymbol}${l.price?.toLocaleString()} | Status: ${l.status} | Views: ${l.views} | URL: ${l.url}${l.rejectionReason ? ` | Reason: ${l.rejectionReason}` : ''}`).join('\n')}`
    : ''
}

${
  targetedOrders.length > 0
    ? `RECENT ORDERS (${targetedOrders.length}):
${targetedOrders.map((o) => `• Order #${o.orderNumber}: ${o.currencySymbol}${o.amount?.toLocaleString()} for "${o.listingTitle}" by ${o.buyerName} | Status: ${o.orderStatus} | Payment: ${o.paymentStatus}`).join('\n')}`
    : ''
}

${
  recentEnquiries.length > 0
    ? `RECENT BUYER ENQUIRIES:
${recentEnquiries.map((e) => `• From ${e.buyerName} regarding "${e.listingTitle}": "${e.lastMessage}" (${e.unreadCount} unread)`).join('\n')}`
    : ''
}
`;

    // Format history for AI provider
    const formattedMessages = [];
    for (const h of conversationHistory.slice(-6)) {
      formattedMessages.push({
        role: h.sender === 'user' ? 'user' : 'assistant',
        content: h.message
      });
    }
    formattedMessages.push({ role: 'user', content: trimmedMsg });

    // Call AI provider
    let aiResponseText = await aiProvider.generateCompletion({
      systemPrompt,
      messages: formattedMessages,
      temperature: 0.5
    });

    // Fallback response generator if external LLM is offline
    if (!aiResponseText) {
      if (textLower.includes('pending') || textLower.includes('review')) {
        const pendingCount = listingStats.pendingListings || 0;
        aiResponseText = `### Listing Moderation Status\n\n` +
          `You currently have **${pendingCount} listing${pendingCount === 1 ? '' : 's'}** under review by the Velvorax moderation team.\n\n` +
          (targetedListings.length > 0
            ? `**Listings Awaiting Approval:**\n` +
              targetedListings.map((l) => `• **${l.title}** (${l.currencySymbol}${l.price?.toLocaleString()}) — *Status: ${l.status}*`).join('\n') +
              `\n\n*Our team typically reviews all listings within 12 to 24 hours to ensure marketplace quality.*`
            : pendingCount === 0
            ? `All your listings have been processed! None are currently pending.`
            : `Visit your Seller Dashboard to view individual listing progress.`);
      } else if (textLower.includes('order') || textLower.includes('sale') || textLower.includes('earning')) {
        aiResponseText = `### Store Sales & Orders Overview\n\n` +
          `• **Total Orders**: **${salesStats.totalOrders || 0}**\n` +
          `• **Completed Orders**: **${salesStats.completedOrders || 0}**\n` +
          `• **Pending Processing**: **${salesStats.pendingOrders || 0}**\n` +
          `• **Total Store Revenue**: **₹${(salesStats.totalEarnings || 0).toLocaleString()}**\n\n` +
          (targetedOrders.length > 0
            ? `**Recent Orders:**\n` +
              targetedOrders.map((o) => `• **#${o.orderNumber}** — ${o.currencySymbol}${o.amount?.toLocaleString()} (*${o.orderStatus}*) for *${o.listingTitle}*`).join('\n')
            : `No recent orders to show.`);
      } else if (textLower.includes('view') || textLower.includes('stat') || textLower.includes('performance')) {
        aiResponseText = `### Inventory Performance\n\n` +
          `• **Live Approved Listings**: **${listingStats.approvedListings || 0}**\n` +
          `• **Total Views Across Listings**: **${listingStats.totalViews || 0}**\n` +
          `• **Total Customer Inquiries**: **${listingStats.totalInquiries || 0}**\n` +
          `• **Changes Requested**: **${listingStats.changesRequestedListings || 0}**`;
      } else if (textLower.includes('verify') || textLower.includes('kyc') || textLower.includes('rera') || textLower.includes('badge')) {
        const isVerified = profile?.verificationStatus === 'VERIFIED';
        aiResponseText = `### Seller Verification & Trust Badge\n\n` +
          `• **Current Status**: **${profile?.verificationStatus || 'UNVERIFIED'}**\n` +
          (isVerified
            ? `Congratulations! Your account is fully verified with the **Verified Merchant Badge** displayed on all your public listings.`
            : `To get the **Verified Merchant Badge** and boost buyer trust by up to 3x, submit your business document or ID proof in the Seller Verification section.`);
      } else {
        aiResponseText = `### Welcome to your Seller Assistant, ${profile?.name || 'Partner'}!\n\n` +
          `Here is a quick snapshot of your Velvorax store:\n\n` +
          `• **Active Listings**: **${listingStats.approvedListings || 0}** live (${listingStats.pendingListings || 0} pending review)\n` +
          `• **Total Views**: **${listingStats.totalViews || 0}** impressions\n` +
          `• **Sales & Revenue**: **${salesStats.totalOrders || 0}** orders | **₹${(salesStats.totalEarnings || 0).toLocaleString()}**\n` +
          `• **Store Rating**: **${profile?.rating || 5.0}⭐**\n\n` +
          `Ask me anything about your listings, pending reviews, buyer inquiries, or how to optimize your sales!`;
      }
    }

    const statsCards = [
      { label: 'Live Listings', value: listingStats.approvedListings || 0, badge: 'Active', color: 'emerald' },
      { label: 'Pending Review', value: listingStats.pendingListings || 0, badge: 'Moderation', color: 'amber' },
      { label: 'Listing Views', value: listingStats.totalViews || 0, badge: 'Traffic', color: 'cyan' },
      { label: 'Total Earnings', value: `₹${(salesStats.totalEarnings || 0).toLocaleString()}`, badge: 'Revenue', color: 'purple' }
    ];

    const actionLinks = [
      { label: 'My Listings', url: '/seller/listings', count: listingStats.totalListings || 0 },
      { label: 'Store Orders', url: '/seller/orders', count: salesStats.totalOrders || 0 },
      { label: 'Customer Messages', url: '/seller/messages', count: recentEnquiries.length },
      { label: 'Verification Badge', url: '/seller/verification', count: profile?.verificationStatus === 'VERIFIED' ? '✓' : '!' }
    ];

    return {
      message: aiResponseText,
      listingCards: targetedListings,
      statsCards,
      actionLinks
    };
  }
}

export const sellerAiService = new SellerAIService();
export default sellerAiService;
