import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { orderService } from '../../services/api/order.service';
import { favoriteService } from '../../services/api/favorite.service';
import { chatService } from '../../services/api/chat.service';
import { Loader } from '../../components/common/Loader';
import { ROUTES } from '../../constants';
import { formatListingPrice } from '../../utils/formatters';

export function BuyerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalPurchases: 0,
    activeOrders: 0,
    savedCount: 0,
    contactedSellers: 0,
    totalSpent: 0
  });
  const [recentPurchases, setRecentPurchases] = useState([]);
  const [savedItems, setSavedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchBuyerData = async () => {
      setLoading(true);
      try {
        // 1. Purchases
        const ordersRes = await orderService.getBuyerPurchases();
        const orders = Array.isArray(ordersRes) ? ordersRes : (ordersRes?.data || []);
        const active = orders.filter(o => ['PENDING', 'PROCESSING', 'SHIPPED'].includes(o.orderStatus)).length;
        const totalSpent = orders.reduce((sum, o) => sum + (o.paymentStatus === 'PAID' ? (o.amount || 0) : 0), 0);

        // 2. Saved Wishlist
        let saved = [];
        try {
          const favRes = await favoriteService.getFavorites();
          saved = Array.isArray(favRes) ? favRes : (favRes?.data || []);
        } catch (e) {
          console.log('Favorites load fallback:', e.message);
        }

        // 3. Contacted Sellers
        const chatsRes = await chatService.getConversations();
        const chats = Array.isArray(chatsRes) ? chatsRes : (chatsRes?.data || []);

        if (isMounted) {
          setStats({
            totalPurchases: orders.length,
            activeOrders: active,
            savedCount: saved.length,
            contactedSellers: chats.length,
            totalSpent
          });
          setRecentPurchases(orders.slice(0, 4));
          setSavedItems(saved.slice(0, 4));
        }
      } catch (err) {
        console.error('Failed to load buyer metrics:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchBuyerData();
    return () => { isMounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="py-28 flex flex-col items-center justify-center gap-3">
        <Loader size="lg" />
        <span className="text-xs font-bold text-[var(--text-secondary)]">Loading buyer workspace...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto text-[var(--text-primary)]">
      
      {/* ============================================================ */}
      {/* HERO BANNER FOR BUYER / SHOPPER                              */}
      {/* ============================================================ */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-purple-900/40 border border-blue-500/20 p-6 sm:p-8 lg:p-10 shadow-lg">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 text-[11px] font-black uppercase tracking-wider">
                <span>🛍️</span>
                <span>Buyer Member Hub</span>
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 text-[11px] font-bold">
                ✨ Verified Account
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-[var(--text-primary)]">
              Welcome, {user?.name || 'Shopper'}!
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              Explore verified real estate properties, luxury cars, products, and contact verified sellers directly.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              to="/properties"
              className="px-5 py-3 rounded-2xl bg-[var(--button-primary)] text-[var(--button-primary-text)] hover:bg-[var(--button-primary-hover)] font-black text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <span>🔍</span>
              <span>Browse Marketplace</span>
            </Link>

            <Link
              to="/buyer/saved"
              className="px-4 py-3 rounded-2xl bg-[var(--bg-surface)] hover:bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-primary)] font-bold text-xs sm:text-sm transition-all shadow-xs flex items-center gap-1.5"
            >
              <span>❤️</span>
              <span>Saved Wishlist ({stats.savedCount})</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 4 LUXURY KPI METRICS TILES                                   */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* Metric 1: Total Purchases */}
        <div className="relative overflow-hidden p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-primary)] shadow-xs hover:border-blue-500/40 hover:shadow-md transition-all flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-blue-500 dark:text-blue-400">Purchased Items</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center text-lg">
              🛍️
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl sm:text-4xl font-black tracking-tight text-[var(--text-primary)]">
              {stats.totalPurchases}
            </div>
            <div className="flex items-center justify-between text-xs mt-3 pt-3 border-t border-[var(--border-subtle)]">
              <span className="text-[var(--text-secondary)]">Listings bought</span>
              <Link to="/buyer/purchases" className="text-blue-500 dark:text-blue-400 font-bold hover:underline">
                View All &rarr;
              </Link>
            </div>
          </div>
        </div>

        {/* Metric 2: Total Spent */}
        <div className="relative overflow-hidden p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-primary)] shadow-xs hover:border-emerald-500/40 hover:shadow-md transition-all flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-500 dark:text-emerald-400">Total Spent</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-lg">
              💰
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-black tracking-tight text-emerald-500 dark:text-emerald-400">
              {formatListingPrice(stats.totalSpent, 'INR')}
            </div>
            <div className="flex items-center justify-between text-xs mt-3 pt-3 border-t border-[var(--border-subtle)]">
              <span className="text-[var(--text-secondary)]">Total purchases value</span>
              <span className="text-xs text-[var(--text-muted)]">Verified</span>
            </div>
          </div>
        </div>

        {/* Metric 3: Saved Items */}
        <div className="relative overflow-hidden p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-primary)] shadow-xs hover:border-rose-500/40 hover:shadow-md transition-all flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-rose-500 dark:text-rose-400">Wishlist Items</span>
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center text-lg">
              ❤️
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl sm:text-4xl font-black tracking-tight text-rose-500 dark:text-rose-400">
              {stats.savedCount}
            </div>
            <div className="flex items-center justify-between text-xs mt-3 pt-3 border-t border-[var(--border-subtle)]">
              <span className="text-[var(--text-secondary)]">Saved listings</span>
              <Link to="/buyer/saved" className="text-rose-500 dark:text-rose-400 font-bold hover:underline">
                Open Saved &rarr;
              </Link>
            </div>
          </div>
        </div>

        {/* Metric 4: Contacted Sellers */}
        <div className="relative overflow-hidden p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-primary)] shadow-xs hover:border-indigo-500/40 hover:shadow-md transition-all flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-indigo-500 dark:text-indigo-400">Seller Chats</span>
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-lg">
              💬
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl sm:text-4xl font-black tracking-tight text-indigo-500 dark:text-indigo-400">
              {stats.contactedSellers}
            </div>
            <div className="flex items-center justify-between text-xs mt-3 pt-3 border-t border-[var(--border-subtle)]">
              <span className="text-[var(--text-secondary)]">Active dialogues</span>
              <Link to="/buyer/contacts" className="text-indigo-500 dark:text-indigo-400 font-bold hover:underline">
                Messages &rarr;
              </Link>
            </div>
          </div>
        </div>

      </div>

      {/* ============================================================ */}
      {/* QUICK EXPLORATION SHORTCUTS                                  */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
        
        <Link
          to="/properties"
          className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-primary)] hover:border-blue-500/50 hover:shadow-lg transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
              🏢
            </div>
            <h3 className="text-base font-black text-[var(--text-primary)] group-hover:text-blue-400 transition-colors mb-1.5">
              Verified Properties
            </h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Explore luxury villas, apartments, commercial lands, and direct verified owner listings.
            </p>
          </div>
          <span className="text-xs font-bold text-blue-500 dark:text-blue-400 mt-5 flex items-center gap-1">
            Explore Real Estate &rarr;
          </span>
        </Link>

        <Link
          to="/vehicles"
          className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-primary)] hover:border-emerald-500/50 hover:shadow-lg transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
              🚗
            </div>
            <h3 className="text-base font-black text-[var(--text-primary)] group-hover:text-emerald-400 transition-colors mb-1.5">
              Cars & Vehicles
            </h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Used cars, bikes, commercial transport, and direct owner vehicles with verified documents.
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-500 dark:text-emerald-400 mt-5 flex items-center gap-1">
            Explore Vehicles &rarr;
          </span>
        </Link>

        <Link
          to="/buyer/saved"
          className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-primary)] hover:border-rose-500/50 hover:shadow-lg transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
              ❤️
            </div>
            <h3 className="text-base font-black text-[var(--text-primary)] group-hover:text-rose-400 transition-colors mb-1.5">
              Wishlist Collection
            </h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Revisit your favorited listings, compare pricing, and contact sellers before items sell out.
            </p>
          </div>
          <span className="text-xs font-bold text-rose-500 dark:text-rose-400 mt-5 flex items-center gap-1">
            View Saved Items &rarr;
          </span>
        </Link>

      </div>

      {/* ============================================================ */}
      {/* RECENT PURCHASES & ORDERS SECTION                            */}
      {/* ============================================================ */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-primary)] shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
          <div>
            <h2 className="text-lg font-black text-[var(--text-primary)]">Recent Purchased Listings</h2>
            <p className="text-xs text-[var(--text-secondary)]">Listings and items you have bought on Velvorax Marketplace</p>
          </div>
          <Link to="/buyer/purchases" className="text-xs font-bold text-[var(--button-primary)] hover:underline">
            View All Purchases &rarr;
          </Link>
        </div>

        {recentPurchases.length === 0 ? (
          <div className="py-12 text-center text-xs text-[var(--text-secondary)]">
            <span className="text-3xl block mb-2">🛍️</span>
            You have not purchased any marketplace listings yet. Start exploring to buy items!
          </div>
        ) : (
          <div className="space-y-3">
            {recentPurchases.map((order) => (
              <div
                key={order._id}
                className="p-4 rounded-2xl bg-[var(--bg-secondary)]/60 border border-[var(--border-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[var(--border-primary)] transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-[var(--bg-surface)] flex items-center justify-center font-bold text-sm shrink-0 border border-[var(--border-primary)]">
                    🛍️
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-black text-[var(--text-primary)] truncate">
                      {order.listingId?.title || `Order #${order.orderNumber}`}
                    </div>
                    <div className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                      Seller: {order.sellerId?.name || 'Verified Seller'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                  <div className="text-right">
                    <div className="text-xs font-black text-emerald-500 dark:text-emerald-400">
                      {formatListingPrice(order.amount, order.currency || 'INR')}
                    </div>
                    <div className="text-[10px] text-[var(--text-muted)]">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : ''}
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <span>✓</span>
                    <span>Purchased</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

export default BuyerDashboard;
