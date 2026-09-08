import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/api/admin.service';
import { useToast } from '../../hooks/useToast';
import { Loader } from '../../components/common/Loader';
import { cn } from '../../utils';
import { formatListingPrice } from '../../utils/formatters';

export function AdminDashboard() {
  const { showToast } = useToast();

  // Active Main Tab: 'CONSOLIDATION' | 'SELLER_APPROVALS' | 'SELLERS_CATALOG' | 'BUYERS_HISTORY' | 'MODERATION' | 'OVERVIEW'
  const [activeTab, setActiveTab] = useState('CONSOLIDATION');

  // Core Data States
  const [stats, setStats] = useState(null);
  const [consolidationData, setConsolidationData] = useState(null);
  const [sellersList, setSellersList] = useState([]);
  const [buyersList, setBuyersList] = useState([]);
  const [pendingListings, setPendingListings] = useState([]);

  // Filter & Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [consolidationStatusFilter, setConsolidationStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [sellerStatusFilter, setSellerStatusFilter] = useState('ALL');

  // Loading & Error States
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [actionInProgressId, setActionInProgressId] = useState(null);

  // Drill-down Inspection Modals
  const [selectedSellerId, setSelectedSellerId] = useState(null);
  const [sellerDetailsData, setSellerDetailsData] = useState(null);
  const [sellerDetailsLoading, setSellerDetailsLoading] = useState(false);

  const [selectedBuyerId, setSelectedBuyerId] = useState(null);
  const [buyerDetailsData, setBuyerDetailsData] = useState(null);
  const [buyerDetailsLoading, setBuyerDetailsLoading] = useState(false);

  // Reject / Reason Modal
  const [rejectModalState, setRejectModalState] = useState({
    isOpen: false,
    type: null, // 'SELLER' | 'LISTING'
    id: null,
    title: '',
    reason: ''
  });

  // Fetch Master Data
  useEffect(() => {
    let cancelled = false;

    const fetchAllData = async () => {
      setLoading(true);
      try {
        const [statsRes, consolidationRes, sellersRes, buyersRes, moderationRes] = await Promise.allSettled([
          adminService.getAdminStats(),
          adminService.getConsolidationReport(),
          adminService.getSellers({ limit: 100 }),
          adminService.getBuyers({ limit: 100 }),
          adminService.getPendingListings({ limit: 50 })
        ]);

        if (cancelled) return;

        if (statsRes.status === 'fulfilled') {
          setStats(statsRes.value?.data || statsRes.value || {});
        }

        if (consolidationRes.status === 'fulfilled') {
          setConsolidationData(consolidationRes.value?.data || consolidationRes.value || null);
        }

        if (sellersRes.status === 'fulfilled') {
          const val = sellersRes.value;
          setSellersList(val?.data || val?.sellers || (Array.isArray(val) ? val : []));
        }

        if (buyersRes.status === 'fulfilled') {
          const val = buyersRes.value;
          setBuyersList(val?.data || val?.buyers || (Array.isArray(val) ? val : []));
        }

        if (moderationRes.status === 'fulfilled') {
          const val = moderationRes.value;
          setPendingListings(val?.data || (Array.isArray(val) ? val : []));
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchAllData();

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  // Load Seller Full Details & Catalog
  const handleOpenSellerDetails = async (sellerId) => {
    setSelectedSellerId(sellerId);
    setSellerDetailsLoading(true);
    setSellerDetailsData(null);
    try {
      const res = await adminService.getSellerFullDetails(sellerId);
      setSellerDetailsData(res?.data || res);
    } catch (err) {
      console.error('Error fetching seller details:', err);
      showToast?.('error', 'Failed to load seller catalog details');
    } finally {
      setSellerDetailsLoading(false);
    }
  };

  // Load Buyer Full Details & Purchase History
  const handleOpenBuyerDetails = async (buyerId) => {
    setSelectedBuyerId(buyerId);
    setBuyerDetailsLoading(true);
    setBuyerDetailsData(null);
    try {
      const res = await adminService.getBuyerFullDetails(buyerId);
      setBuyerDetailsData(res?.data || res);
    } catch (err) {
      console.error('Error fetching buyer purchases:', err);
      showToast?.('error', 'Failed to load buyer purchase history');
    } finally {
      setBuyerDetailsLoading(false);
    }
  };

  // Seller Moderation Actions (Approve, Reject, Suspend)
  const handleApproveSeller = async (sellerId) => {
    setActionInProgressId(sellerId);
    try {
      await adminService.moderateSeller(sellerId, { action: 'APPROVE' });
      showToast?.('success', 'Seller account approved and verified successfully!');
      
      // Update local state
      setSellersList(prev => prev.map(s => s._id === sellerId ? { ...s, sellerStatus: 'APPROVED' } : s));
      setStats(prev => prev ? { 
        ...prev, 
        pendingSellerApprovals: Math.max(0, (prev.pendingSellerApprovals || 1) - 1) 
      } : prev);

      // If viewing modal
      if (sellerDetailsData?.seller?._id === sellerId) {
        setSellerDetailsData(prev => ({
          ...prev,
          seller: { ...prev.seller, sellerStatus: 'APPROVED' }
        }));
      }
    } catch (err) {
      showToast?.('error', err?.message || 'Failed to approve seller');
    } finally {
      setActionInProgressId(null);
    }
  };

  const handleOpenRejectModal = (type, id, title) => {
    setRejectModalState({
      isOpen: true,
      type,
      id,
      title: title || (type === 'SELLER' ? 'Reject Seller Application' : 'Reject Listing'),
      reason: ''
    });
  };

  const handleConfirmReject = async () => {
    const { type, id, reason } = rejectModalState;
    if (!id) return;

    setActionInProgressId(id);
    try {
      if (type === 'SELLER') {
        await adminService.moderateSeller(id, { action: 'REJECT', reason: reason || 'Application declined by administrator.' });
        showToast?.('info', 'Seller application rejected');
        setSellersList(prev => prev.map(s => s._id === id ? { ...s, sellerStatus: 'REJECTED' } : s));
      } else if (type === 'LISTING') {
        await adminService.moderateListing(id, { action: 'REJECT', reason: reason || 'Does not adhere to marketplace guidelines.' });
        showToast?.('info', 'Listing rejected');
        setPendingListings(prev => prev.filter(l => l._id !== id));
      }
      setRejectModalState({ isOpen: false, type: null, id: null, title: '', reason: '' });
    } catch (err) {
      showToast?.('error', err?.message || 'Action failed');
    } finally {
      setActionInProgressId(null);
    }
  };

  // Listing Moderation (1-Click Approve)
  const handleApproveListing = async (listingId) => {
    setActionInProgressId(listingId);
    try {
      await adminService.moderateListing(listingId, { action: 'APPROVE' });
      showToast?.('success', 'Listing approved and is now live!');
      setPendingListings(prev => prev.filter(l => l._id !== listingId));
      setStats(prev => prev ? {
        ...prev,
        pendingListings: Math.max(0, (prev.pendingListings || 1) - 1),
        activeListings: (prev.activeListings || 0) + 1
      } : prev);
    } catch (err) {
      showToast?.('error', err?.message || 'Failed to approve listing');
    } finally {
      setActionInProgressId(null);
    }
  };

  // Filtered Consolidation Listings
  const filteredConsolidationListings = useMemo(() => {
    const list = consolidationData?.listings || [];
    return list.filter(item => {
      // Status Filter
      if (consolidationStatusFilter === 'SOLD' && !item.isSold && item.status !== 'SOLD') return false;
      if (consolidationStatusFilter === 'APPROVED' && (item.isSold || item.status !== 'APPROVED')) return false;
      if (consolidationStatusFilter === 'PENDING' && !['PENDING', 'PENDING_REVIEW', 'UNDER_REVIEW'].includes(item.status)) return false;
      if (consolidationStatusFilter === 'REJECTED' && item.status !== 'REJECTED') return false;

      // Category Filter
      if (categoryFilter !== 'ALL' && item.categorySlug !== categoryFilter.toLowerCase()) return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const titleMatch = item.title?.toLowerCase().includes(q);
        const sellerMatch = item.sellerId?.name?.toLowerCase().includes(q) || item.sellerId?.email?.toLowerCase().includes(q);
        const buyerMatch = item.order?.buyer?.name?.toLowerCase().includes(q) || item.order?.buyer?.email?.toLowerCase().includes(q);
        const orderMatch = item.order?.orderNumber?.toLowerCase().includes(q);
        const locMatch = item.location?.city?.toLowerCase().includes(q) || item.location?.localArea?.toLowerCase().includes(q);
        if (!titleMatch && !sellerMatch && !buyerMatch && !orderMatch && !locMatch) return false;
      }

      return true;
    });
  }, [consolidationData, consolidationStatusFilter, categoryFilter, searchQuery]);

  // Pending Sellers
  const pendingSellers = useMemo(() => {
    return sellersList.filter(s => s.sellerStatus === 'PENDING_APPROVAL' || s.sellerStatus === 'PENDING' || s.verificationStatus === 'PENDING');
  }, [sellersList]);

  // Filtered Sellers
  const filteredSellers = useMemo(() => {
    return sellersList.filter(s => {
      if (sellerStatusFilter !== 'ALL' && s.sellerStatus !== sellerStatusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const nameMatch = s.name?.toLowerCase().includes(q);
        const emailMatch = s.email?.toLowerCase().includes(q);
        const companyMatch = s.companyName?.toLowerCase().includes(q);
        const phoneMatch = s.phone?.includes(q);
        if (!nameMatch && !emailMatch && !companyMatch && !phoneMatch) return false;
      }
      return true;
    });
  }, [sellersList, sellerStatusFilter, searchQuery]);

  // Filtered Buyers
  const filteredBuyers = useMemo(() => {
    return buyersList.filter(b => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const nameMatch = b.name?.toLowerCase().includes(q);
        const emailMatch = b.email?.toLowerCase().includes(q);
        const phoneMatch = b.phone?.includes(q);
        if (!nameMatch && !emailMatch && !phoneMatch) return false;
      }
      return true;
    });
  }, [buyersList, searchQuery]);

  if (loading && !stats) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3">
        <Loader size="lg" />
        <span className="text-xs font-bold text-[var(--text-secondary)]">Loading consolidated administration portal...</span>
      </div>
    );
  }

  const summary = consolidationData?.summary || stats || {};

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-6 sm:py-8 text-[var(--text-primary)]">
      {/* Top Banner & Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[var(--border-subtle)]">
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-black uppercase tracking-wider shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Platform Executive Command Center</span>
            </span>
            <span className="text-xs text-[var(--text-muted)] font-mono">
              Consolidated Multi-Vendor Ledger
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[var(--text-primary)] tracking-tight">
            Administrator Consolidation & Governance
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 max-w-3xl">
            Real-time consolidation of active & sold listings, seller approvals, seller inventory tracking, and buyer purchase ledgers.
          </p>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setRefreshKey(k => k + 1)}
            className="px-4 py-2.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-2"
            title="Refresh All Marketplace Data"
          >
            <span>🔄</span>
            <span>Sync Data</span>
          </button>

          {pendingSellers.length > 0 && (
            <button
              onClick={() => setActiveTab('SELLER_APPROVALS')}
              className="px-4 py-2.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-xs rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer animate-pulse"
            >
              <span>⏳</span>
              <span>{pendingSellers.length} Pending Seller{pendingSellers.length > 1 ? 's' : ''}</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MASTER KPI CONSOLIDATION CARDS                                            */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
        {/* Total Listings */}
        <div className="p-4 sm:p-5 bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-2xl shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[var(--text-muted)] text-[11px] font-bold uppercase tracking-wider">
            <span>Total Listings</span>
            <span>📋</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] mt-1.5">
            {summary.totalListings || 0}
          </div>
          <div className="text-[11px] text-emerald-400 font-semibold mt-1">
            {summary.activeListings || 0} Live Active
          </div>
        </div>

        {/* Sold Listings */}
        <div className="p-4 sm:p-5 bg-[var(--bg-surface)] border border-purple-500/30 bg-purple-500/5 rounded-2xl shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-purple-400 text-[11px] font-bold uppercase tracking-wider">
            <span>Sold Listings</span>
            <span>🏷️</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-purple-400 mt-1.5">
            {summary.soldListings || summary.completedOrders || 0}
          </div>
          <div className="text-[11px] text-purple-300 font-semibold mt-1">
            Fulfilled & Closed
          </div>
        </div>

        {/* Total Sellers */}
        <div className="p-4 sm:p-5 bg-[var(--bg-surface)] border border-emerald-500/30 bg-emerald-500/5 rounded-2xl shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-400 text-[11px] font-bold uppercase tracking-wider">
            <span>Total Sellers</span>
            <span>📦</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1.5">
            {stats?.totalSellers || sellersList.length || 0}
          </div>
          <div className="text-[11px] text-amber-400 font-semibold mt-1">
            {stats?.pendingSellerApprovals || pendingSellers.length || 0} Pending Approval
          </div>
        </div>

        {/* Total Buyers */}
        <div className="p-4 sm:p-5 bg-[var(--bg-surface)] border border-blue-500/30 bg-blue-500/5 rounded-2xl shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-blue-400 text-[11px] font-bold uppercase tracking-wider">
            <span>Total Buyers</span>
            <span>🛍️</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-blue-400 mt-1.5">
            {stats?.totalBuyers || buyersList.length || 0}
          </div>
          <div className="text-[11px] text-blue-300 font-semibold mt-1">
            Registered Customers
          </div>
        </div>

        {/* Total Orders */}
        <div className="p-4 sm:p-5 bg-[var(--bg-surface)] border border-indigo-500/30 bg-indigo-500/5 rounded-2xl shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-indigo-400 text-[11px] font-bold uppercase tracking-wider">
            <span>Total Orders</span>
            <span>💳</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-indigo-400 mt-1.5">
            {summary.totalOrders || 0}
          </div>
          <div className="text-[11px] text-indigo-300 font-semibold mt-1">
            Connected Transactions
          </div>
        </div>

        {/* Gross Volume */}
        <div className="p-4 sm:p-5 bg-[var(--bg-surface)] border border-amber-500/30 bg-amber-500/5 rounded-2xl shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-400 text-[11px] font-bold uppercase tracking-wider">
            <span>Marketplace GMV</span>
            <span>💰</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-400 mt-1.5 truncate" title={formatListingPrice(summary.totalRevenue || 0, 'INR')}>
            {formatListingPrice(summary.totalRevenue || 0, 'INR', null, { compact: true })}
          </div>
          <div className="text-[11px] text-amber-300 font-semibold mt-1">
            Processed Volume
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* INTERACTIVE DASHBOARD TABS NAVIGATION                                      */}
      {/* ========================================================================= */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[var(--border-primary)] scrollbar-none">
        <button
          onClick={() => setActiveTab('CONSOLIDATION')}
          className={cn(
            "px-4 py-2.5 rounded-xl text-xs font-black tracking-wide uppercase transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer",
            activeTab === 'CONSOLIDATION'
              ? "bg-indigo-600 text-white shadow-md"
              : "bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] border border-[var(--border-primary)]"
          )}
        >
          <span>📊</span>
          <span>Consolidated Ledger (Listings & Sold)</span>
        </button>

        <button
          onClick={() => setActiveTab('SELLER_APPROVALS')}
          className={cn(
            "px-4 py-2.5 rounded-xl text-xs font-black tracking-wide uppercase transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer relative",
            activeTab === 'SELLER_APPROVALS'
              ? "bg-amber-600 text-white shadow-md"
              : "bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] border border-[var(--border-primary)]"
          )}
        >
          <span>⏳</span>
          <span>Seller Approvals</span>
          {pendingSellers.length > 0 && (
            <span className="px-1.5 py-0.2 bg-amber-400 text-slate-950 font-black rounded-full text-[10px]">
              {pendingSellers.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('SELLERS_CATALOG')}
          className={cn(
            "px-4 py-2.5 rounded-xl text-xs font-black tracking-wide uppercase transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer",
            activeTab === 'SELLERS_CATALOG'
              ? "bg-emerald-600 text-white shadow-md"
              : "bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] border border-[var(--border-primary)]"
          )}
        >
          <span>📦</span>
          <span>Seller Details & Inventory Catalog</span>
        </button>

        <button
          onClick={() => setActiveTab('BUYERS_HISTORY')}
          className={cn(
            "px-4 py-2.5 rounded-xl text-xs font-black tracking-wide uppercase transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer",
            activeTab === 'BUYERS_HISTORY'
              ? "bg-blue-600 text-white shadow-md"
              : "bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] border border-[var(--border-primary)]"
          )}
        >
          <span>🛍️</span>
          <span>Buyer Details & Purchases</span>
        </button>

        <button
          onClick={() => setActiveTab('MODERATION')}
          className={cn(
            "px-4 py-2.5 rounded-xl text-xs font-black tracking-wide uppercase transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer",
            activeTab === 'MODERATION'
              ? "bg-purple-600 text-white shadow-md"
              : "bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] border border-[var(--border-primary)]"
          )}
        >
          <span>📋</span>
          <span>Listing Moderation Queue</span>
          {pendingListings.length > 0 && (
            <span className="px-1.5 py-0.2 bg-purple-300 text-purple-950 font-black rounded-full text-[10px]">
              {pendingListings.length}
            </span>
          )}
        </button>
      </div>

      {/* Search & Filter Row */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-[var(--bg-surface)] p-4 rounded-2xl border border-[var(--border-primary)] shadow-xs">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder={
              activeTab === 'CONSOLIDATION' ? "Search item, seller, or buyer..." :
              activeTab === 'SELLERS_CATALOG' || activeTab === 'SELLER_APPROVALS' ? "Search seller by name, email, company..." :
              activeTab === 'BUYERS_HISTORY' ? "Search buyer by name, email, phone..." :
              "Search listings..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl text-xs text-[var(--text-primary)] focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[var(--text-muted)] pointer-events-none">
            🔍
          </span>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Contextual Filter Options */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          {activeTab === 'CONSOLIDATION' && (
            <>
              <select
                value={consolidationStatusFilter}
                onChange={(e) => setConsolidationStatusFilter(e.target.value)}
                className="px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="ALL">All Listing States</option>
                <option value="APPROVED">Live Active Only</option>
                <option value="SOLD">Sold Items Only</option>
                <option value="PENDING">Pending Review</option>
                <option value="REJECTED">Rejected</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="ALL">All Categories</option>
                <option value="properties">Properties</option>
                <option value="vehicles">Vehicles</option>
                <option value="electronics">Electronics</option>
                <option value="furniture">Furniture</option>
                <option value="jobs">Jobs</option>
                <option value="services">Services</option>
                <option value="farm">Agriculture</option>
                <option value="businesses">Businesses</option>
              </select>
            </>
          )}

          {activeTab === 'SELLERS_CATALOG' && (
            <select
              value={sellerStatusFilter}
              onChange={(e) => setSellerStatusFilter(e.target.value)}
              className="px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="ALL">All Seller Statuses</option>
              <option value="APPROVED">Approved & Active</option>
              <option value="PENDING_APPROVAL">Pending Approval</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="REJECTED">Rejected</option>
            </select>
          )}

          <span className="text-xs text-[var(--text-muted)] font-mono ml-auto md:ml-2">
            {activeTab === 'CONSOLIDATION' && `${filteredConsolidationListings.length} items`}
            {activeTab === 'SELLER_APPROVALS' && `${pendingSellers.length} pending`}
            {activeTab === 'SELLERS_CATALOG' && `${filteredSellers.length} sellers`}
            {activeTab === 'BUYERS_HISTORY' && `${filteredBuyers.length} buyers`}
            {activeTab === 'MODERATION' && `${pendingListings.length} in queue`}
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: OVERALL CONSOLIDATION MASTER LEDGER (Listings & Sold)               */}
      {/* ========================================================================= */}
      {activeTab === 'CONSOLIDATION' && (
        <div className="bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-3xl overflow-hidden shadow-xs">
          <div className="p-5 border-b border-[var(--border-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-black text-[var(--text-primary)]">
                Master Marketplace Inventory & Transaction Ledger
              </h2>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Consolidated overview showing what sellers have listed, live active inventory, and items bought by buyers.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                🟢 Live Active: {summary.activeListings || 0}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                🏷️ Sold: {summary.soldListings || summary.completedOrders || 0}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--bg-secondary)] text-[var(--text-muted)] uppercase tracking-wider font-bold text-[10px] border-b border-[var(--border-primary)]">
                <tr>
                  <th className="py-3 px-4">Item & Category</th>
                  <th className="py-3 px-4">Seller Details</th>
                  <th className="py-3 px-4">Price / Valuation</th>
                  <th className="py-3 px-4">Inventory Status</th>
                  <th className="py-3 px-4">Buyer & Transaction Details</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)] font-medium">
                {filteredConsolidationListings.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-xs text-[var(--text-muted)]">
                      No listings match your search or filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredConsolidationListings.map((item) => {
                    const isSold = item.isSold || item.status === 'SOLD';
                    const coverImage = item.images?.[0]?.url || item.images?.[0] || item.media?.[0]?.url || '';

                    return (
                      <tr 
                        key={item._id} 
                        className={cn(
                          "hover:bg-[var(--bg-secondary)]/50 transition-colors",
                          isSold && "bg-purple-950/10"
                        )}
                      >
                        {/* Item Title & Category */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] overflow-hidden shrink-0 flex items-center justify-center">
                              {coverImage ? (
                                <img src={coverImage} alt={item.title} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-base">📦</span>
                              )}
                            </div>
                            <div className="min-w-0 max-w-xs">
                              <p className="font-bold text-[var(--text-primary)] truncate text-xs" title={item.title}>
                                {item.title}
                              </p>
                              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                <span className="px-2 py-0.2 rounded bg-indigo-500/10 text-indigo-400 text-[10px] font-bold uppercase">
                                  {item.categorySlug || item.categoryId?.name || 'General'}
                                </span>
                                <span className="text-[10px] text-[var(--text-muted)]">
                                  {item.location?.city || 'India'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Seller Details */}
                        <td className="py-3.5 px-4">
                          {item.sellerId ? (
                            <div>
                              <button
                                onClick={() => handleOpenSellerDetails(item.sellerId._id)}
                                className="font-bold text-indigo-400 hover:text-indigo-300 hover:underline cursor-pointer text-left block truncate max-w-[150px]"
                                title={item.sellerId.name}
                              >
                                {item.sellerId.name}
                              </button>
                              <p className="text-[11px] text-[var(--text-muted)] truncate max-w-[150px]">
                                {item.sellerId.companyName || item.sellerId.email}
                              </p>
                            </div>
                          ) : (
                            <span className="text-[var(--text-muted)]">Platform Direct</span>
                          )}
                        </td>

                        {/* Price */}
                        <td className="py-3.5 px-4 font-mono font-bold text-[var(--text-primary)]">
                          {formatListingPrice(item.price || 0, item.currency || 'INR')}
                        </td>

                        {/* Status Badge */}
                        <td className="py-3.5 px-4">
                          {isSold ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-[10px] font-black uppercase tracking-wider">
                              <span>✓</span>
                              <span>SOLD</span>
                            </span>
                          ) : item.status === 'APPROVED' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase tracking-wider">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                              <span>LIVE ACTIVE</span>
                            </span>
                          ) : item.status === 'REJECTED' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 text-[10px] font-black uppercase tracking-wider">
                              <span>REJECTED</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] font-black uppercase tracking-wider">
                              <span>UNDER REVIEW</span>
                            </span>
                          )}
                        </td>

                        {/* Buyer & Transaction Details (If Sold) */}
                        <td className="py-3.5 px-4">
                          {isSold && item.order ? (
                            <div className="space-y-0.5">
                              {item.order.buyer ? (
                                <button
                                  onClick={() => handleOpenBuyerDetails(item.order.buyer.id)}
                                  className="font-bold text-blue-400 hover:text-blue-300 hover:underline cursor-pointer text-left block truncate max-w-[170px]"
                                  title={item.order.buyer.name}
                                >
                                  👤 {item.order.buyer.name}
                                </button>
                              ) : (
                                <span className="text-xs text-[var(--text-secondary)] font-bold">👤 Verified Buyer</span>
                              )}
                              <p className="text-[10px] text-purple-400 font-mono">
                                #{item.order.orderNumber} • {formatListingPrice(item.order.amount || item.price || 0, item.order.currency || item.currency || 'INR')}
                              </p>
                              <span className="text-[9px] text-[var(--text-muted)]">
                                Sold: {new Date(item.order.purchaseDate || item.updatedAt).toLocaleDateString()}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[11px] text-[var(--text-muted)] italic">
                              Available for purchase
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <Link
                            to={`/properties/${item._id}`}
                            target="_blank"
                            className="px-3 py-1.5 bg-[var(--bg-secondary)] hover:bg-indigo-600 hover:text-white border border-[var(--border-primary)] rounded-lg text-xs font-bold transition-colors inline-block"
                          >
                            View Item &rarr;
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: SELLER APPROVALS & ONBOARDING                                      */}
      {/* ========================================================================= */}
      {activeTab === 'SELLER_APPROVALS' && (
        <div className="space-y-4">
          <div className="p-5 bg-[var(--bg-surface)] border border-amber-500/30 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg">⏳</span>
                <h2 className="text-base font-black text-[var(--text-primary)]">
                  Pending Seller Onboarding & Verification Requests
                </h2>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Review and approve merchant applications to allow them to publish live listings on Velvorax.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold font-mono">
              {pendingSellers.length} Pending Actions
            </span>
          </div>

          {pendingSellers.length === 0 ? (
            <div className="p-12 text-center bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-3xl space-y-2">
              <span className="text-3xl">🎉</span>
              <h3 className="text-sm font-black text-[var(--text-primary)]">All Seller Applications Cleared</h3>
              <p className="text-xs text-[var(--text-secondary)]">There are no pending seller approvals in the queue.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingSellers.map((seller) => (
                <div 
                  key={seller._id} 
                  className="p-5 bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-3xl shadow-xs space-y-4 hover:border-amber-500/40 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Header with Avatar & Badge */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-300 flex items-center justify-center font-black text-base uppercase">
                          {seller.name?.[0] || 'S'}
                        </div>
                        <div>
                          <h3 className="text-sm font-black text-[var(--text-primary)] leading-snug">
                            {seller.name}
                          </h3>
                          <p className="text-xs text-[var(--text-secondary)]">{seller.email}</p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] font-black uppercase">
                        Pending
                      </span>
                    </div>

                    {/* Metadata Specs */}
                    <div className="p-3 bg-[var(--bg-secondary)] rounded-2xl space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-[var(--text-muted)]">Category:</span>
                        <span className="font-bold text-[var(--text-primary)] uppercase">{seller.sellerCategory || 'General'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--text-muted)]">Company:</span>
                        <span className="font-bold text-[var(--text-primary)]">{seller.companyName || 'Independent Seller'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--text-muted)]">Phone:</span>
                        <span className="font-mono text-[var(--text-primary)]">{seller.phone || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--text-muted)]">Location:</span>
                        <span className="text-[var(--text-primary)]">{seller.location?.city || 'India'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 flex items-center gap-2">
                    <button
                      disabled={actionInProgressId === seller._id}
                      onClick={() => handleApproveSeller(seller._id)}
                      className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span>✓</span>
                      <span>Approve Seller</span>
                    </button>
                    <button
                      disabled={actionInProgressId === seller._id}
                      onClick={() => handleOpenRejectModal('SELLER', seller._id, `Reject ${seller.name}`)}
                      className="px-3.5 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold text-xs rounded-xl transition-all cursor-pointer"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: SELLER DETAILS & INVENTORY CATALOG                                  */}
      {/* ========================================================================= */}
      {activeTab === 'SELLERS_CATALOG' && (
        <div className="bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-3xl overflow-hidden shadow-xs">
          <div className="p-5 border-b border-[var(--border-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-black text-[var(--text-primary)]">
                Seller Directory & Inventory Breakdown
              </h2>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Inspect merchant accounts, their total published inventory, and what items they have sold.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--bg-secondary)] text-[var(--text-muted)] uppercase tracking-wider font-bold text-[10px] border-b border-[var(--border-primary)]">
                <tr>
                  <th className="py-3 px-4">Seller Profile</th>
                  <th className="py-3 px-4">Category & Company</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4">Total Listings</th>
                  <th className="py-3 px-4">Live / Sold</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)] font-medium">
                {filteredSellers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-xs text-[var(--text-muted)]">
                      No sellers found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredSellers.map((seller) => (
                    <tr key={seller._id} className="hover:bg-[var(--bg-secondary)]/50 transition-colors">
                      {/* Seller Profile */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold flex items-center justify-center uppercase shrink-0">
                            {seller.name?.[0] || 'S'}
                          </div>
                          <div>
                            <p className="font-bold text-[var(--text-primary)] text-xs">{seller.name}</p>
                            <p className="text-[11px] text-[var(--text-muted)]">{seller.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Category & Company */}
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-[var(--text-primary)]">{seller.companyName || 'Individual'}</p>
                        <span className="text-[10px] text-emerald-400 uppercase font-bold">{seller.sellerCategory || 'General'}</span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {seller.sellerStatus === 'APPROVED' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-bold">
                            ✓ APPROVED
                          </span>
                        ) : seller.sellerStatus === 'PENDING_APPROVAL' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 text-[10px] font-bold">
                            ⏳ PENDING
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-400 text-[10px] font-bold">
                            {seller.sellerStatus || 'ACTIVE'}
                          </span>
                        )}
                      </td>

                      {/* Total Listings */}
                      <td className="py-3.5 px-4 font-mono font-bold text-sm">
                        {seller.totalListings || 0}
                      </td>

                      {/* Live / Sold */}
                      <td className="py-3.5 px-4 space-y-0.5">
                        <span className="text-emerald-400 font-bold">{seller.approvedListings || 0} Live</span>
                        <span className="text-[var(--text-muted)]"> • </span>
                        <span className="text-purple-400 font-bold">{seller.totalSales || 0} Sold</span>
                      </td>

                      {/* Inspect Button */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleOpenSellerDetails(seller._id)}
                          className="px-3 py-1.5 bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white border border-indigo-500/30 rounded-lg text-xs font-bold transition-all cursor-pointer"
                        >
                          🔍 Inspect Listings ({seller.totalListings || 0})
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: BUYER DETAILS & PURCHASE HISTORY                                    */}
      {/* ========================================================================= */}
      {activeTab === 'BUYERS_HISTORY' && (
        <div className="bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-3xl overflow-hidden shadow-xs">
          <div className="p-5 border-b border-[var(--border-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-black text-[var(--text-primary)]">
                Buyer Accounts & Purchase Ledgers
              </h2>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Inspect registered buyers, their purchase orders, and which sellers they bought items from.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--bg-secondary)] text-[var(--text-muted)] uppercase tracking-wider font-bold text-[10px] border-b border-[var(--border-primary)]">
                <tr>
                  <th className="py-3 px-4">Buyer Name & Contact</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Registered Date</th>
                  <th className="py-3 px-4">Total Purchases</th>
                  <th className="py-3 px-4">Total Spent (₹)</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)] font-medium">
                {filteredBuyers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-xs text-[var(--text-muted)]">
                      No buyers found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredBuyers.map((buyer) => (
                    <tr key={buyer._id} className="hover:bg-[var(--bg-secondary)]/50 transition-colors">
                      {/* Buyer Name & Contact */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-300 font-bold flex items-center justify-center uppercase shrink-0">
                            {buyer.name?.[0] || 'B'}
                          </div>
                          <div>
                            <p className="font-bold text-[var(--text-primary)] text-xs">{buyer.name}</p>
                            <p className="text-[11px] text-[var(--text-muted)]">{buyer.email}</p>
                            {buyer.phone && <p className="text-[10px] text-blue-400 font-mono">{buyer.phone}</p>}
                          </div>
                        </div>
                      </td>

                      {/* Location */}
                      <td className="py-3.5 px-4 text-[var(--text-secondary)]">
                        {buyer.location?.city || 'India'}
                      </td>

                      {/* Registered Date */}
                      <td className="py-3.5 px-4 text-[var(--text-muted)] font-mono text-[11px]">
                        {new Date(buyer.createdAt || Date.now()).toLocaleDateString()}
                      </td>

                      {/* Total Purchases */}
                      <td className="py-3.5 px-4 font-mono font-bold text-sm">
                        {buyer.totalPurchases || 0} Order{buyer.totalPurchases === 1 ? '' : 's'}
                      </td>

                      {/* Total Spent */}
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-400 text-sm">
                        {formatListingPrice(buyer.totalSpent || 0, 'INR')}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleOpenBuyerDetails(buyer._id)}
                          className="px-3 py-1.5 bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/30 rounded-lg text-xs font-bold transition-all cursor-pointer"
                        >
                          🛍️ View Bought Items & Sellers &rarr;
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: LISTING MODERATION QUEUE                                           */}
      {/* ========================================================================= */}
      {activeTab === 'MODERATION' && (
        <div className="space-y-4">
          <div className="p-5 bg-[var(--bg-surface)] border border-purple-500/30 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-black text-[var(--text-primary)]">
                Marketplace Listing Submissions Moderation
              </h2>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Review pending property, vehicle, and product listings before making them public.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs font-bold font-mono">
              {pendingListings.length} In Queue
            </span>
          </div>

          {pendingListings.length === 0 ? (
            <div className="p-12 text-center bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-3xl space-y-2">
              <span className="text-3xl">🎉</span>
              <h3 className="text-sm font-black text-[var(--text-primary)]">Moderation Queue is Clean</h3>
              <p className="text-xs text-[var(--text-secondary)]">No listings are currently waiting for admin review.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingListings.map((listing) => {
                const coverImage = listing.images?.[0]?.url || listing.images?.[0] || '';

                return (
                  <div 
                    key={listing._id}
                    className="p-5 bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-3xl shadow-xs space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="h-36 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] overflow-hidden relative">
                        {coverImage ? (
                          <img src={coverImage} alt={listing.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-3xl">📦</div>
                        )}
                        <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold uppercase">
                          {listing.categorySlug || 'Product'}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-sm font-black text-[var(--text-primary)] line-clamp-2">
                          {listing.title}
                        </h3>
                        <p className="text-sm font-mono font-bold text-emerald-400 mt-1">
                          {formatListingPrice(listing.price || 0, listing.currency || 'INR')}
                        </p>
                        <p className="text-[11px] text-[var(--text-muted)] mt-1">
                          Seller: <span className="font-bold text-[var(--text-secondary)]">{listing.sellerId?.name || 'Seller'}</span>
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center gap-2">
                      <button
                        disabled={actionInProgressId === listing._id}
                        onClick={() => handleApproveListing(listing._id)}
                        className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
                      >
                        ✓ Approve
                      </button>
                      <button
                        disabled={actionInProgressId === listing._id}
                        onClick={() => handleOpenRejectModal('LISTING', listing._id, `Reject: ${listing.title}`)}
                        className="px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold text-xs rounded-xl transition-all cursor-pointer"
                      >
                        Reject
                      </button>
                      <Link
                        to={`/properties/${listing._id}`}
                        target="_blank"
                        className="p-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl text-xs"
                        title="Preview"
                      >
                        🔗
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: SELLER DETAILS & FULL INVENTORY CATALOG                          */}
      {/* ========================================================================= */}
      {selectedSellerId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-4xl bg-[var(--bg-surface)] border border-emerald-500/30 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto text-[var(--text-primary)]">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-black text-lg flex items-center justify-center">
                  📦
                </div>
                <div>
                  <h3 className="text-xl font-black text-[var(--text-primary)]">
                    {sellerDetailsData?.seller?.name || 'Seller Catalog & Inventory'}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {sellerDetailsData?.seller?.email} • {sellerDetailsData?.seller?.phone || 'No phone'} • {sellerDetailsData?.seller?.companyName || 'Individual Merchant'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedSellerId(null);
                  setSellerDetailsData(null);
                }}
                className="w-8 h-8 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] flex items-center justify-center text-xs hover:bg-[var(--bg-primary)] cursor-pointer"
              >
                ✕
              </button>
            </div>

            {sellerDetailsLoading ? (
              <div className="py-16 text-center">
                <Loader size="md" />
                <span className="text-xs font-bold text-[var(--text-secondary)] mt-2 block">Loading seller catalog...</span>
              </div>
            ) : sellerDetailsData ? (
              <div className="space-y-6">
                {/* Metrics Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-primary)]">
                    <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase">Total Listings Posted</span>
                    <p className="text-xl font-black text-[var(--text-primary)] mt-1">{sellerDetailsData.metrics?.totalListings || 0}</p>
                  </div>
                  <div className="p-3.5 bg-emerald-500/10 rounded-2xl border border-emerald-500/30">
                    <span className="text-[10px] text-emerald-400 font-bold uppercase">Live Active Listings</span>
                    <p className="text-xl font-black text-emerald-400 mt-1">{sellerDetailsData.metrics?.activeListings || 0}</p>
                  </div>
                  <div className="p-3.5 bg-purple-500/10 rounded-2xl border border-purple-500/30">
                    <span className="text-[10px] text-purple-400 font-bold uppercase">Sold Items Count</span>
                    <p className="text-xl font-black text-purple-400 mt-1">{sellerDetailsData.metrics?.soldListings || 0}</p>
                  </div>
                  <div className="p-3.5 bg-amber-500/10 rounded-2xl border border-amber-500/30">
                    <span className="text-[10px] text-amber-400 font-bold uppercase">Total Sales Generated</span>
                    <p className="text-xl font-black text-amber-400 mt-1">{formatListingPrice(sellerDetailsData.metrics?.totalRevenue || 0, 'INR')}</p>
                  </div>
                </div>

                {/* All Listings Created by this Seller */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black uppercase tracking-wider text-[var(--text-muted)]">
                      Listings Catalog Created By This Seller ({sellerDetailsData.listings?.length || 0})
                    </h4>
                  </div>

                  {sellerDetailsData.listings?.length === 0 ? (
                    <div className="p-8 text-center bg-[var(--bg-secondary)] rounded-2xl text-xs text-[var(--text-muted)]">
                      This seller has not posted any listings yet.
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                      {sellerDetailsData.listings?.map((listing) => (
                        <div
                          key={listing._id}
                          className={cn(
                            "p-3.5 rounded-2xl border flex items-center justify-between gap-3 text-xs transition-colors",
                            listing.isSold
                              ? "bg-purple-950/20 border-purple-500/30"
                              : "bg-[var(--bg-secondary)] border-[var(--border-primary)]"
                          )}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)] overflow-hidden shrink-0 flex items-center justify-center">
                              {listing.images?.[0] ? (
                                <img src={listing.images[0]?.url || listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
                              ) : (
                                <span>📦</span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-[var(--text-primary)] truncate max-w-sm">{listing.title}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] font-bold text-indigo-400 uppercase">{listing.categorySlug || 'Category'}</span>
                                <span className="text-[10px] text-[var(--text-muted)]">• {listing.views || 0} views</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 shrink-0">
                            <div className="text-right">
                              <p className="font-mono font-black text-sm text-[var(--text-primary)]">{formatListingPrice(listing.price || 0, listing.currency || 'INR')}</p>
                              {listing.isSold ? (
                                <span className="text-[10px] font-black text-purple-400 uppercase">✓ SOLD</span>
                              ) : (
                                <span className="text-[10px] font-bold text-emerald-400 uppercase">● {listing.status}</span>
                              )}
                            </div>
                            <Link
                              to={`/properties/${listing._id}`}
                              target="_blank"
                              className="px-2.5 py-1 bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-lg text-xs font-bold hover:bg-indigo-600 hover:text-white transition-colors"
                            >
                              View &rarr;
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: BUYER DETAILS & WHAT THEY BOUGHT FROM WHICH SELLER               */}
      {/* ========================================================================= */}
      {selectedBuyerId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-4xl bg-[var(--bg-surface)] border border-blue-500/30 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto text-[var(--text-primary)]">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/30 text-blue-400 font-black text-lg flex items-center justify-center">
                  🛍️
                </div>
                <div>
                  <h3 className="text-xl font-black text-[var(--text-primary)]">
                    {buyerDetailsData?.buyer?.name || 'Buyer Purchase History'}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {buyerDetailsData?.buyer?.email} • {buyerDetailsData?.buyer?.phone || 'No phone'} • Location: {buyerDetailsData?.buyer?.location?.city || 'India'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedBuyerId(null);
                  setBuyerDetailsData(null);
                }}
                className="w-8 h-8 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] flex items-center justify-center text-xs hover:bg-[var(--bg-primary)] cursor-pointer"
              >
                ✕
              </button>
            </div>

            {buyerDetailsLoading ? (
              <div className="py-16 text-center">
                <Loader size="md" />
                <span className="text-xs font-bold text-[var(--text-secondary)] mt-2 block">Loading buyer purchase ledger...</span>
              </div>
            ) : buyerDetailsData ? (
              <div className="space-y-6">
                {/* Summary Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-primary)]">
                    <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase">Total Purchases</span>
                    <p className="text-xl font-black text-[var(--text-primary)] mt-1">{buyerDetailsData.metrics?.totalPurchases || 0} Orders</p>
                  </div>
                  <div className="p-3.5 bg-emerald-500/10 rounded-2xl border border-emerald-500/30">
                    <span className="text-[10px] text-emerald-400 font-bold uppercase">Completed & Fulfilled</span>
                    <p className="text-xl font-black text-emerald-400 mt-1">{buyerDetailsData.metrics?.completedPurchases || 0}</p>
                  </div>
                  <div className="p-3.5 bg-blue-500/10 rounded-2xl border border-blue-500/30">
                    <span className="text-[10px] text-blue-400 font-bold uppercase">Total Amount Spent</span>
                    <p className="text-xl font-black text-blue-400 mt-1">{formatListingPrice(buyerDetailsData.metrics?.totalSpent || 0, 'INR')}</p>
                  </div>
                </div>

                {/* Items Bought and From Which Seller */}
                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-[var(--text-muted)]">
                    Items Bought By {buyerDetailsData.buyer?.name} & Seller Information ({buyerDetailsData.orders?.length || 0})
                  </h4>

                  {buyerDetailsData.orders?.length === 0 ? (
                    <div className="p-8 text-center bg-[var(--bg-secondary)] rounded-2xl text-xs text-[var(--text-muted)]">
                      This buyer has not made any purchases yet.
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                      {buyerDetailsData.orders?.map((order) => (
                        <div
                          key={order.orderId || order.orderNumber}
                          className="p-4 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl space-y-2.5 text-xs"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-indigo-400">#{order.orderNumber}</span>
                              <span className="px-2 py-0.2 rounded bg-emerald-500/15 text-emerald-400 font-bold text-[10px]">
                                {order.orderStatus}
                              </span>
                            </div>
                            <span className="text-[11px] text-[var(--text-muted)]">
                              Date: {new Date(order.purchaseDate).toLocaleDateString()}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                            {/* Product Info */}
                            <div className="space-y-1">
                              <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Purchased Item:</span>
                              <p className="font-bold text-[var(--text-primary)]">{order.item?.title || 'Marketplace Item'}</p>
                              <p className="font-mono font-black text-emerald-400 text-sm">{formatListingPrice(order.amount || 0, order.currency || 'INR')}</p>
                            </div>

                            {/* Seller Info */}
                            <div className="space-y-1 p-2.5 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)]">
                              <span className="text-[10px] uppercase font-bold text-indigo-400">Bought From Seller:</span>
                              <p className="font-bold text-[var(--text-primary)]">{order.seller?.name || 'Seller'}</p>
                              <p className="text-[11px] text-[var(--text-muted)]">{order.seller?.companyName || order.seller?.email || 'Registered Merchant'}</p>
                              {order.seller?.phone && <p className="text-[10px] text-[var(--text-muted)] font-mono">{order.seller.phone}</p>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* REJECT CONFIRMATION MODAL                                                 */}
      {/* ========================================================================= */}
      {rejectModalState.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md bg-[var(--bg-surface)] border border-rose-500/30 rounded-3xl p-6 space-y-4 text-[var(--text-primary)] shadow-2xl">
            <h3 className="text-base font-black text-rose-400">
              {rejectModalState.title}
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              Please enter the reason for rejection (this will be logged and communicated):
            </p>

            <textarea
              rows={3}
              placeholder="Enter reason or quality guideline feedback..."
              value={rejectModalState.reason}
              onChange={(e) => setRejectModalState(prev => ({ ...prev, reason: e.target.value }))}
              className="w-full p-3 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl text-xs text-[var(--text-primary)] focus:outline-none focus:border-rose-500 transition-colors"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectModalState({ isOpen: false, type: null, id: null, title: '', reason: '' })}
                className="px-4 py-2 bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={actionInProgressId !== null}
                onClick={handleConfirmReject}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition-all shadow-md cursor-pointer"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
