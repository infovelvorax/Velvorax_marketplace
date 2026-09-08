import { User } from '../../models/User.js';
import { Listing } from '../../models/Listing.js';
import { Order } from '../../models/Order.js';
import { Report } from '../../models/Report.js';
import { SellerVerification } from '../../models/SellerVerification.js';
import { aiProvider } from './ai.provider.js';

export class AdminAIService {
  /**
   * Controlled Tool 1: Aggregate overall live marketplace statistics
   */
  async getMarketplaceStats() {
    try {
      const [
        totalUsers,
        totalBuyers,
        totalSellers,
        pendingSellerApprovals,
        totalListings,
        approvedListings,
        pendingListings,
        rejectedListings,
        changesRequestedListings,
        totalReports,
        pendingVerifications,
        totalOrders,
        completedOrders,
        revenueAgg
      ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ role: { $in: ['BUYER', 'USER', 'buyer', 'user'] } }),
        User.countDocuments({ role: { $in: ['SELLER', 'seller'] } }),
        User.countDocuments({ role: { $in: ['SELLER', 'seller'] }, sellerStatus: 'PENDING_APPROVAL' }),
        Listing.countDocuments(),
        Listing.countDocuments({ status: 'APPROVED' }),
        Listing.countDocuments({ status: { $in: ['PENDING', 'PENDING_REVIEW', 'UNDER_REVIEW'] } }),
        Listing.countDocuments({ status: 'REJECTED' }),
        Listing.countDocuments({ status: 'CHANGES_REQUESTED' }),
        Report.countDocuments({ status: 'PENDING' }),
        SellerVerification.countDocuments({ status: 'PENDING' }),
        Order.countDocuments(),
        Order.countDocuments({ orderStatus: { $in: ['COMPLETED', 'completed'] } }),
        Order.aggregate([
          { $match: { paymentStatus: { $in: ['PAID', 'paid'] } } },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ])
      ]);

      const totalRevenue = revenueAgg[0]?.total || 0;

      return {
        totalUsers,
        totalBuyers,
        totalSellers,
        pendingSellerApprovals,
        totalListings,
        approvedListings,
        pendingListings,
        rejectedListings,
        changesRequestedListings,
        totalReports,
        pendingVerifications,
        totalOrders,
        completedOrders,
        totalRevenue
      };
    } catch (err) {
      console.error('AdminAIService getMarketplaceStats error:', err);
      return {};
    }
  }

  /**
   * Controlled Tool 2: Get Pending Sellers waiting for admin approval
   */
  async getPendingSellerApprovals(limit = 10) {
    try {
      const pendingSellers = await User.find({
        role: { $in: ['SELLER', 'seller'] },
        sellerStatus: 'PENDING_APPROVAL'
      })
        .select('name email phone companyName businessType sellerCategory createdAt location')
        .sort({ createdAt: -1 })
        .limit(Math.min(25, limit))
        .lean();

      return pendingSellers.map((s) => ({
        id: s._id.toString(),
        name: s.name,
        email: s.email,
        phone: s.phone || 'N/A',
        companyName: s.companyName || 'Individual Merchant',
        businessType: s.businessType || 'General',
        sellerCategory: s.sellerCategory || 'general',
        registeredAt: s.createdAt,
        city: s.location?.city || 'Unspecified'
      }));
    } catch (err) {
      console.error('getPendingSellerApprovals error:', err);
      return [];
    }
  }

  /**
   * Controlled Tool 3: Get Top Sellers and Seller Metrics
   */
  async getSellerStats(limit = 6) {
    try {
      const sellers = await User.find({ role: { $in: ['SELLER', 'seller'] } })
        .select('name email companyName sellerStatus verificationStatus rating createdAt')
        .sort({ createdAt: -1 })
        .limit(Math.min(25, limit))
        .lean();

      const enriched = await Promise.all(
        sellers.map(async (s) => {
          const [approvedCount, pendingCount, orderCount] = await Promise.all([
            Listing.countDocuments({ sellerId: s._id, status: 'APPROVED' }),
            Listing.countDocuments({ sellerId: s._id, status: { $in: ['PENDING', 'PENDING_REVIEW', 'UNDER_REVIEW'] } }),
            Order.countDocuments({ sellerId: s._id, orderStatus: { $in: ['COMPLETED', 'completed'] } })
          ]);
          return {
            id: s._id.toString(),
            name: s.name,
            companyName: s.companyName || s.name,
            sellerStatus: s.sellerStatus,
            verified: s.verificationStatus === 'VERIFIED',
            rating: s.rating,
            approvedListings: approvedCount,
            pendingListings: pendingCount,
            completedSales: orderCount
          };
        })
      );

      return enriched.sort((a, b) => b.approvedListings - a.approvedListings);
    } catch (err) {
      console.error('getSellerStats error:', err);
      return [];
    }
  }

  /**
   * Controlled Tool 4: Get Listing Moderation Statistics
   */
  async getListingModerationStats() {
    try {
      const [pendingCount, changesRequestedCount, categoryCounts] = await Promise.all([
        Listing.countDocuments({ status: { $in: ['PENDING', 'PENDING_REVIEW', 'UNDER_REVIEW'] } }),
        Listing.countDocuments({ status: 'CHANGES_REQUESTED' }),
        Listing.aggregate([
          { $match: { status: { $in: ['PENDING', 'PENDING_REVIEW', 'UNDER_REVIEW'] } } },
          { $group: { _id: '$categorySlug', count: { $sum: 1 } } }
        ])
      ]);

      return {
        pendingModerationTotal: pendingCount,
        changesRequestedTotal: changesRequestedCount,
        categoryQueue: categoryCounts.map((c) => ({ category: c._id || 'other', count: c.count }))
      };
    } catch (err) {
      console.error('getListingModerationStats error:', err);
      return { pendingModerationTotal: 0, changesRequestedTotal: 0, categoryQueue: [] };
    }
  }

  /**
   * Controlled Tool 5: Get Order Statistics & Revenue Metrics
   */
  async getOrderStats() {
    try {
      const [total, completed, pending, cancelled, revenueResult] = await Promise.all([
        Order.countDocuments(),
        Order.countDocuments({ orderStatus: { $in: ['COMPLETED', 'completed', 'DELIVERED', 'delivered'] } }),
        Order.countDocuments({ orderStatus: { $in: ['PENDING', 'pending', 'PROCESSING', 'processing'] } }),
        Order.countDocuments({ orderStatus: { $in: ['CANCELLED', 'cancelled'] } }),
        Order.aggregate([
          { $match: { paymentStatus: { $in: ['PAID', 'paid'] } } },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ])
      ]);

      return {
        totalOrders: total,
        completedOrders: completed,
        pendingOrders: pending,
        cancelledOrders: cancelled,
        totalPaidRevenue: revenueResult[0]?.total || 0
      };
    } catch (err) {
      console.error('getOrderStats error:', err);
      return { totalOrders: 0, completedOrders: 0, pendingOrders: 0, cancelledOrders: 0, totalPaidRevenue: 0 };
    }
  }

  /**
   * Process Admin AI Chat Message
   */
  async processChatMessage({ message, conversationHistory = [] }) {
    if (!message || typeof message !== 'string') {
      return {
        message: "Hello Administrator! How can I assist you with Velvorax marketplace governance today?",
        statsCards: [],
        actionLinks: []
      };
    }

    const trimmedMsg = message.trim();
    const textLower = trimmedMsg.toLowerCase();

    // 1. Gather relevant real MongoDB data according to intent
    const isSellerIntent = textLower.includes('seller') || textLower.includes('approval') || textLower.includes('merchant');
    const isModerationIntent = textLower.includes('moderation') || textLower.includes('pending listing') || textLower.includes('review');
    const isOrderIntent = textLower.includes('order') || textLower.includes('revenue') || textLower.includes('sale') || textLower.includes('transaction');
    const isBuyerIntent = textLower.includes('buyer') || textLower.includes('customer') || textLower.includes('user');

    // Always fetch live marketplace summary
    const overallStats = await this.getMarketplaceStats();
    let pendingSellers = [];
    let topSellers = [];
    let moderationStats = null;
    let orderStats = null;

    if (isSellerIntent || textLower.includes('approval')) {
      pendingSellers = await this.getPendingSellerApprovals(8);
      topSellers = await this.getSellerStats(5);
    }
    if (isModerationIntent) {
      moderationStats = await this.getListingModerationStats();
    }
    if (isOrderIntent) {
      orderStats = await this.getOrderStats();
    }

    // 2. Construct Safe Admin System Prompt
    const systemPrompt = `You are the executive Admin AI Assistant for the Velvorax Marketplace administration portal.

PRIMARY RULES & SECURITY PROTOCOLS:
1. TRUTHFULNESS & ZERO HALLUCINATIONS: All numbers, counts, metrics, and summaries MUST come strictly from the real MongoDB data provided below. Never invent or estimate metrics.
2. SENSITIVE CREDENTIALS: You must NEVER disclose passwords, hashes, JWT secrets, database connection URIs, SMTP credentials, or raw private verification identity files.
3. EXECUTIVE TONE: Deliver crisp, actionable, professional executive summaries. Use clean markdown tables, metric bullet points, and highlight areas requiring administrative attention.

REAL MONGODB LIVE DATA:
- Total Registered Users: ${overallStats.totalUsers || 0}
- Total Buyers: ${overallStats.totalBuyers || 0}
- Total Sellers: ${overallStats.totalSellers || 0}
- Sellers Pending Admin Approval: ${overallStats.pendingSellerApprovals || 0}
- Total Listings: ${overallStats.totalListings || 0}
- Live Approved Listings: ${overallStats.approvedListings || 0}
- Listings Pending Review: ${overallStats.pendingListings || 0}
- Listings Rejected: ${overallStats.rejectedListings || 0}
- Total Orders: ${overallStats.totalOrders || 0}
- Total Completed Orders: ${overallStats.completedOrders || 0}
- Total Processed Revenue: ₹${(overallStats.totalRevenue || 0).toLocaleString()}
- Pending User Reports: ${overallStats.totalReports || 0}
- Pending Seller Identity Verifications: ${overallStats.pendingVerifications || 0}

${
  pendingSellers.length > 0
    ? `PENDING SELLERS LISTING (${pendingSellers.length} retrieved):
${pendingSellers.map((s) => `• ${s.name} (${s.companyName || 'Individual'}) - Email: ${s.email} | City: ${s.city} | Registered: ${new Date(s.registeredAt).toLocaleDateString()}`).join('\n')}`
    : ''
}

${
  topSellers.length > 0
    ? `TOP SELLERS BY ACTIVITY:
${topSellers.map((s) => `• ${s.name} (${s.companyName}): ${s.approvedListings} approved listings, ${s.completedSales} sales, ${s.sellerStatus}`).join('\n')}`
    : ''
}

${
  moderationStats
    ? `MODERATION QUEUE:
• Total Pending Listings: ${moderationStats.pendingModerationTotal}
• Total Changes Requested: ${moderationStats.changesRequestedTotal}
• Breakdown by Category: ${moderationStats.categoryQueue.map((c) => `${c.category}: ${c.count}`).join(', ')}`
    : ''
}
`;

    // 3. Format history for AI provider
    const formattedMessages = [];
    for (const h of conversationHistory.slice(-6)) {
      formattedMessages.push({
        role: h.sender === 'user' ? 'user' : 'assistant',
        content: h.message
      });
    }
    formattedMessages.push({ role: 'user', content: trimmedMsg });

    // 4. Call AI provider
    let aiResponseText = await aiProvider.generateCompletion({
      systemPrompt,
      messages: formattedMessages,
      temperature: 0.4
    });

    // 5. Fallback synthesizer if provider API key is not present or offline
    if (!aiResponseText) {
      if (textLower.includes('how many seller') || textLower.includes('pending seller') || textLower.includes('approval')) {
        const pendingCount = overallStats.pendingSellerApprovals || 0;
        aiResponseText = `### Seller Approval Status\n\n` +
          `There are currently **${pendingCount} seller${pendingCount === 1 ? '' : 's'}** waiting for admin approval in the database.\n\n` +
          (pendingSellers.length > 0
            ? `**Pending Merchant Applications:**\n` +
              pendingSellers.map((s) => `• **${s.name}** (${s.companyName || 'Individual'}) — *${s.email}* [${s.city}]`).join('\n') +
              `\n\n*Click below to review applications in the Admin Seller Approvals portal.*`
            : pendingCount === 0
            ? `All seller registration requests are up to date!`
            : '');
      } else if (textLower.includes('how many buyer') || textLower.includes('buyer stats')) {
        aiResponseText = `### Buyer Metrics Summary\n\n` +
          `• **Total Buyers**: **${overallStats.totalBuyers || 0}**\n` +
          `• **Total Orders Placed**: **${overallStats.totalOrders || 0}**\n` +
          `• **Completed Transactions**: **${overallStats.completedOrders || 0}**\n` +
          `• **Total Platform Revenue**: **₹${(overallStats.totalRevenue || 0).toLocaleString()}**`;
      } else if (textLower.includes('moderation') || textLower.includes('pending listing')) {
        aiResponseText = `### Listing Moderation Queue\n\n` +
          `• **Pending Listings**: **${overallStats.pendingListings || 0}**\n` +
          `• **Approved Active Listings**: **${overallStats.approvedListings || 0}**\n` +
          `• **Rejected Listings**: **${overallStats.rejectedListings || 0}**\n` +
          `• **Open Reports**: **${overallStats.totalReports || 0}**`;
      } else if (textLower.includes('top seller') || textLower.includes('most approved')) {
        aiResponseText = `### Top Sellers by Approved Listings\n\n` +
          (topSellers.length > 0
            ? topSellers.map((s, idx) => `${idx + 1}. **${s.name}** (${s.companyName}) — **${s.approvedListings}** approved listings | **${s.completedSales}** sales`).join('\n')
            : `No seller activity recorded yet.`);
      } else {
        aiResponseText = `### Velvorax Marketplace Executive Summary\n\n` +
          `• **Users**: **${overallStats.totalUsers || 0}** total (${overallStats.totalBuyers || 0} buyers, ${overallStats.totalSellers || 0} sellers)\n` +
          `• **Sellers Waiting Approval**: **${overallStats.pendingSellerApprovals || 0}**\n` +
          `• **Listings**: **${overallStats.totalListings || 0}** total (**${overallStats.approvedListings || 0}** live approved, **${overallStats.pendingListings || 0}** in review)\n` +
          `• **Orders & Revenue**: **${overallStats.totalOrders || 0}** orders | **₹${(overallStats.totalRevenue || 0).toLocaleString()}** revenue\n` +
          `• **Pending Verifications**: **${overallStats.pendingVerifications || 0}**`;
      }
    }

    // Build structured stats cards to render rich dashboard widgets in the chat
    const statsCards = [
      { label: 'Pending Sellers', value: overallStats.pendingSellerApprovals || 0, badge: 'Approvals', color: 'amber' },
      { label: 'Live Listings', value: overallStats.approvedListings || 0, badge: 'Active', color: 'emerald' },
      { label: 'Review Queue', value: overallStats.pendingListings || 0, badge: 'Moderation', color: 'indigo' },
      { label: 'Total Revenue', value: `₹${(overallStats.totalRevenue || 0).toLocaleString()}`, badge: 'Finance', color: 'purple' }
    ];

    const actionLinks = [
      { label: 'Seller Approvals', url: '/admin/sellers', count: overallStats.pendingSellerApprovals || 0 },
      { label: 'Moderation Queue', url: '/admin/moderation', count: overallStats.pendingListings || 0 },
      { label: 'Marketplace Orders', url: '/admin/orders', count: overallStats.totalOrders || 0 },
      { label: 'Buyer Directory', url: '/admin/buyers', count: overallStats.totalBuyers || 0 }
    ];

    return {
      message: aiResponseText,
      statsCards,
      actionLinks
    };
  }
}

export const adminAiService = new AdminAIService();
export default adminAiService;
