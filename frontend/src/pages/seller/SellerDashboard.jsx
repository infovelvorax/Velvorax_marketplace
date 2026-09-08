import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { listingService } from '../../services/api/listings.service';
import { chatService } from '../../services/api/chat.service';
import { Loader } from '../../components/common/Loader';
import { ROUTES } from '../../constants';
import { 
  MARKETPLACE_CATEGORIES, 
  getCategoryById, 
  normalizeCategoryId,
  getCategoryDashboardRoute 
} from '../../constants/categories';

export function SellerDashboard() {
  const { user, activeCategory: authCategory, switchCategory } = useAuth();
  const { category: routeCategory } = useParams();
  const navigate = useNavigate();

  // Resolve active category from route or auth context
  const effectiveCategorySlug = normalizeCategoryId(routeCategory || authCategory || user?.activeCategory || user?.sellerCategory || 'properties');
  const currentCategoryMeta = getCategoryById(effectiveCategorySlug);

  const [stats, setStats] = useState({
    totalListings: 0,
    approvedListings: 0,
    pendingListings: 0,
    soldListings: 0,
    buyerContacts: 0
  });
  const [recentInquiries, setRecentInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  const isApproved = user?.sellerStatus === 'APPROVED';
  const isPending = user?.sellerStatus === 'PENDING_APPROVAL';
  const isRejected = user?.sellerStatus === 'REJECTED';

  // Sync category if URL parameter is present
  useEffect(() => {
    if (routeCategory) {
      const normalized = normalizeCategoryId(routeCategory);
      if (normalized !== authCategory) {
        switchCategory(normalized);
      }
    }
  }, [routeCategory, authCategory, switchCategory]);

  useEffect(() => {
    let isMounted = true;
    const fetchSellerData = async () => {
      setLoading(true);
      try {
        // 1. Listings (fetch all listings for this seller and filter for current sector)
        const listingsRes = await listingService.getMyListings();
        const allListings = Array.isArray(listingsRes) ? listingsRes : (listingsRes?.data || []);
        
        // Filter by active sector if available, or compute metrics
        const sectorListings = allListings.filter(l => {
          const lSlug = l.categorySlug || l.categoryId?.slug;
          return !effectiveCategorySlug || effectiveCategorySlug === 'general' || normalizeCategoryId(lSlug) === effectiveCategorySlug;
        });

        const activeSet = sectorListings.length > 0 ? sectorListings : allListings;
        const approved = activeSet.filter(l => l.status === 'APPROVED').length;
        const pending = activeSet.filter(l => ['PENDING', 'PENDING_REVIEW', 'UNDER_REVIEW'].includes(l.status)).length;
        const sold = activeSet.filter(l => l.status === 'SOLD').length;

        // 2. Buyer Contacts / Conversations
        const chatsRes = await chatService.getConversations();
        const chats = Array.isArray(chatsRes) ? chatsRes : (chatsRes?.data || []);

        if (isMounted) {
          setStats({
            totalListings: activeSet.length,
            approvedListings: approved,
            pendingListings: pending,
            soldListings: sold,
            buyerContacts: chats.length
          });
          setRecentInquiries(chats.slice(0, 6));
        }
      } catch (err) {
        console.error('Failed to load seller metrics:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchSellerData();
    return () => { isMounted = false; };
  }, [effectiveCategorySlug]);

  const handleCategorySwitch = async (newCat) => {
    const normalized = await switchCategory(newCat);
    navigate(getCategoryDashboardRoute(normalized));
  };

  if (loading) {
    return (
      <div className="py-28 flex flex-col items-center justify-center gap-3">
        <Loader size="lg" />
        <span className="text-xs font-bold text-[var(--text-secondary)]">Loading seller workspace...</span>
      </div>
    );
  }

  const livePercent = stats.totalListings > 0 ? Math.round((stats.approvedListings / stats.totalListings) * 100) : 0;
  const pendingPercent = stats.totalListings > 0 ? Math.round((stats.pendingListings / stats.totalListings) * 100) : 0;

  return (
    <div className="space-y-8 max-w-7xl mx-auto text-[var(--text-primary)]">
      
      {/* ============================================================ */}
      {/* CATEGORY SWITCHER BAR (SEAMLESS MULTI-SECTOR MANAGEMENT)      */}
      {/* ============================================================ */}
      <div className="p-4 sm:p-5 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-primary)] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xl shrink-0">
            {currentCategoryMeta.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-black text-[var(--text-primary)]">
                {currentCategoryMeta.portalLabel}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Active Sector
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)]">
              One account for all sectors. Switch categories anytime without logging out.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <span className="text-xs font-bold text-[var(--text-secondary)] shrink-0 hidden sm:inline">
            Switch Sector:
          </span>
          <select
            value={effectiveCategorySlug}
            onChange={(e) => handleCategorySwitch(e.target.value)}
            className="bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-primary)] rounded-2xl px-3.5 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer shadow-xs"
          >
            {MARKETPLACE_CATEGORIES.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ============================================================ */}
      {/* SELLER KYC & APPROVAL STATUS BANNERS                         */}
      {/* ============================================================ */}
      {isPending && (
        <div className="p-5 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm animate-fade-in">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-xl shrink-0">
              ⏳
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-amber-300">
                Your seller account is awaiting admin approval.
              </h3>
              <p className="text-xs text-amber-200/80 mt-0.5 leading-relaxed">
                Our administration team is currently reviewing your identity verification credentials (Aadhaar & PAN). You can prepare and manage your account details, but listing publishing is restricted until verification approval.
              </p>
            </div>
          </div>
          <span className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-black shrink-0">
            Pending Approval
          </span>
        </div>
      )}

      {isRejected && (
        <div className="p-5 rounded-3xl bg-rose-500/10 border border-rose-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm animate-fade-in">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center text-xl shrink-0">
              ❌
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-rose-300">
                Your seller verification was rejected.
              </h3>
              <p className="text-xs text-rose-200/90 mt-0.5 leading-relaxed">
                <strong>Reason:</strong> {user?.sellerRejectionReason || user?.verification?.rejectionReason || 'Identity credentials could not be validated.'}
              </p>
            </div>
          </div>
          <span className="px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-black shrink-0">
            Verification Rejected
          </span>
        </div>
      )}

      {isApproved && (
        <div className="p-4 rounded-3xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-sm font-black">
              ✓
            </span>
            <span className="text-xs sm:text-sm font-bold text-emerald-300">
              Seller account verified & live. Listing publishing is enabled across all sectors.
            </span>
          </div>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 text-[11px] font-black uppercase">
            Active Verified
          </span>
        </div>
      )}

      {/* ============================================================ */}
      {/* 3 LUXURY KPI METRIC TILES                                    */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        
        {/* Metric 1: My Listings */}
        <div className="relative overflow-hidden p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-primary)] shadow-xs hover:border-emerald-500/40 hover:shadow-md transition-all flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-[var(--text-secondary)]">Total Inventory</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-lg">
              📋
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl sm:text-4xl font-black tracking-tight text-[var(--text-primary)]">
              {stats.totalListings}
            </div>
            <div className="flex items-center justify-between text-xs mt-3 pt-3 border-t border-[var(--border-subtle)]">
              <span className="text-emerald-500 dark:text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                {stats.approvedListings} Live
              </span>
              <span className="text-amber-500 dark:text-amber-400 font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                {stats.pendingListings} In Review
              </span>
            </div>
          </div>
        </div>

        {/* Metric 2: Buyer Inquiries */}
        <div className="relative overflow-hidden p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-primary)] shadow-xs hover:border-blue-500/40 hover:shadow-md transition-all flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-blue-500 dark:text-blue-400">Buyer Inquiries</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center text-lg">
              💬
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl sm:text-4xl font-black tracking-tight text-blue-500 dark:text-blue-400">
              {stats.buyerContacts}
            </div>
            <div className="flex items-center justify-between text-xs mt-3 pt-3 border-t border-[var(--border-subtle)]">
              <span className="text-[var(--text-secondary)]">Direct buyer leads</span>
              <Link to="/seller/contacts" className="text-blue-500 dark:text-blue-400 font-bold hover:underline">
                View All &rarr;
              </Link>
            </div>
          </div>
        </div>

        {/* Metric 3: Live Publishing Health */}
        <div className="relative overflow-hidden p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-primary)] shadow-xs hover:border-purple-500/40 hover:shadow-md transition-all flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-purple-500 dark:text-purple-400">Publishing Rate</span>
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center text-lg">
              ⚡
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl sm:text-4xl font-black tracking-tight text-purple-500 dark:text-purple-400">
              {livePercent}%
            </div>
            <div className="flex items-center justify-between text-xs mt-3 pt-3 border-t border-[var(--border-subtle)]">
              <span className="text-[var(--text-secondary)]">Active in circulation</span>
              <Link to="/seller/listings" className="text-purple-500 dark:text-purple-400 font-bold hover:underline">
                Manage &rarr;
              </Link>
            </div>
          </div>
        </div>

      </div>

      {/* ============================================================ */}
      {/* INVENTORY HEALTH PROGRESS VISUALIZER                         */}
      {/* ============================================================ */}
      <div className="p-6 sm:p-7 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-primary)] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-black text-[var(--text-primary)]">Inventory & Publishing Health</h2>
            <p className="text-xs text-[var(--text-secondary)]">Live overview of your listings in marketplace circulation</p>
          </div>
          <span className="text-xs font-bold text-[var(--text-secondary)]">
            {stats.approvedListings} of {stats.totalListings} Active ({livePercent}%)
          </span>
        </div>

        {/* Multi-segment Progress Bar */}
        <div className="w-full h-3 rounded-full bg-[var(--bg-secondary)] overflow-hidden flex gap-0.5">
          <div
            className="h-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${livePercent}%` }}
            title={`Approved Live: ${livePercent}%`}
          />
          <div
            className="h-full bg-amber-500 transition-all duration-500"
            style={{ width: `${pendingPercent}%` }}
            title={`In Review: ${pendingPercent}%`}
          />
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs font-bold pt-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            <span className="text-[var(--text-primary)]">Live on Marketplace ({stats.approvedListings})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
            <span className="text-[var(--text-primary)]">Under Moderation ({stats.pendingListings})</span>
          </div>
          {stats.soldListings > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-500 inline-block" />
              <span className="text-[var(--text-primary)]">Sold Out ({stats.soldListings})</span>
            </div>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* QUICK ACTION TILES (3D Interactive Cards)                    */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
        
        <Link
          to="/seller/listings"
          className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-primary)] hover:border-emerald-500/50 hover:shadow-lg transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
              📋
            </div>
            <h3 className="text-base font-black text-[var(--text-primary)] group-hover:text-emerald-400 transition-colors mb-1.5">
              Manage Listings
            </h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Edit properties, cars, electronics, update photos, adjust pricing, and mark items as sold.
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-500 dark:text-emerald-400 mt-5 flex items-center gap-1">
            Open Inventory Manager &rarr;
          </span>
        </Link>

        <Link
          to="/seller/contacts"
          className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-primary)] hover:border-blue-500/50 hover:shadow-lg transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
              💬
            </div>
            <h3 className="text-base font-black text-[var(--text-primary)] group-hover:text-blue-400 transition-colors mb-1.5">
              Buyer Inquiries & Leads
            </h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Real-time prospective buyers asking questions about your listings. Respond fast to close deals.
            </p>
          </div>
          <span className="text-xs font-bold text-blue-500 dark:text-blue-400 mt-5 flex items-center gap-1">
            View Buyer Contacts &rarr;
          </span>
        </Link>

        <Link
          to="/dashboard/messages"
          className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-primary)] hover:border-purple-500/50 hover:shadow-lg transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
              ✉️
            </div>
            <h3 className="text-base font-black text-[var(--text-primary)] group-hover:text-purple-400 transition-colors mb-1.5">
              Direct Messages Hub
            </h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Chat live with customers, answer product inquiries, provide details, and organize transactions.
            </p>
          </div>
          <span className="text-xs font-bold text-purple-500 dark:text-purple-400 mt-5 flex items-center gap-1">
            Open Inbox &rarr;
          </span>
        </Link>

      </div>

      {/* ============================================================ */}
      {/* RECENT ACTIVITY: BUYER LEADS & INQUIRIES FEED                */}
      {/* ============================================================ */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-primary)] shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
          <div>
            <h2 className="text-base font-black text-[var(--text-primary)] flex items-center gap-2">
              <span>💬</span>
              <span>Recent Buyer Inquiries & Leads ({recentInquiries.length})</span>
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">Direct prospective buyers inquiring about your listings</p>
          </div>

          <Link
            to="/seller/contacts"
            className="text-xs font-bold text-[var(--button-primary)] hover:underline flex items-center gap-1 self-end sm:self-auto"
          >
            <span>View All Buyer Contacts</span>
            <span>&rarr;</span>
          </Link>
        </div>

        {recentInquiries.length === 0 ? (
          <div className="py-12 text-center text-xs text-[var(--text-secondary)]">
            <span className="text-3xl block mb-2">💬</span>
            No buyer inquiries yet. When buyers message you about your items, their leads will appear here in real-time.
          </div>
        ) : (
          <div className="space-y-3">
            {recentInquiries.map((c) => {
              const partner = c.participants?.find((p) => p._id !== user?._id) || {};
              return (
                <div
                  key={c._id}
                  className="p-4 rounded-2xl bg-[var(--bg-secondary)]/60 border border-[var(--border-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[var(--border-primary)] transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 text-white font-black flex items-center justify-center text-xs shrink-0">
                      {partner.name?.[0] || 'B'}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-black text-[var(--text-primary)] truncate">
                        {partner.name || 'Interested Buyer'}
                      </div>
                      <div className="text-[11px] text-[var(--text-secondary)] truncate mt-0.5">
                        {c.lastMessage?.content || 'Inquired about your listing'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                    <Link
                      to={`/dashboard/messages?conversation=${c._id}`}
                      className="px-4 py-2 rounded-xl bg-[var(--button-primary)] text-[var(--button-primary-text)] font-bold text-xs shadow-xs hover:bg-[var(--button-primary-hover)] transition-all cursor-pointer"
                    >
                      Reply &rarr;
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

    </div>
  );
}

export default SellerDashboard;
