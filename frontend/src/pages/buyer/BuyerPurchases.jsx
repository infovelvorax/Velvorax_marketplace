import React, { useState, useEffect, useCallback } from 'react';
import { orderService } from '../../services/api/order.service';
import { useToast } from '../../hooks/useToast';
import { Loader } from '../../components/common/Loader';
import { BackButton } from '../../components/common/BackButton';
import { Link } from 'react-router-dom';
import { formatListingPrice } from '../../utils/formatters';

export function BuyerPurchases() {
  const { showToast } = useToast();
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchPurchases = useCallback(async () => {
    setLoading(true);
    try {
      const response = await orderService.getBuyerPurchases();
      setPurchases(Array.isArray(response) ? response : (response?.data || []));
    } catch (err) {
      showToast('error', err.response?.data?.message || err.message || 'Failed to load purchased listings');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchPurchases();
  }, [fetchPurchases]);

  const filteredPurchases = purchases.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      item.orderNumber?.toString().toLowerCase().includes(q) ||
      item.listingId?.title?.toLowerCase().includes(q) ||
      item.listingId?.categorySlug?.toLowerCase().includes(q) ||
      item.sellerId?.name?.toLowerCase().includes(q) ||
      item.sellerId?.location?.city?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-[var(--text-primary)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border-subtle)]">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <BackButton fallbackUrl="/buyer/dashboard" label="Buyer Hub" />
            <span className="text-xs text-[var(--text-muted)]">/</span>
            <span className="text-xs font-bold text-blue-400">Purchases</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
            Purchased Listings
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
            All marketplace listings and products you have purchased.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchPurchases}
          className="px-4 py-2.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
        >
          <span>🔄</span>
          <span>Refresh</span>
        </button>
      </div>

      {/* Summary and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-primary)] shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[var(--text-secondary)]">
            Total Purchased Items:
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-black">
            {purchases.length}
          </span>
        </div>

        <div className="relative sm:w-80">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-xs text-[var(--text-muted)]">
            🔍
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search purchased listings by title, seller, or ID..."
            className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--button-primary)]"
          />
        </div>
      </div>

      {/* Purchased Listings Cards */}
      {loading ? (
        <div className="py-24 flex justify-center">
          <Loader size="lg" />
        </div>
      ) : filteredPurchases.length === 0 ? (
        <div className="p-12 text-center bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-3xl space-y-4">
          <div className="text-4xl">🛍️</div>
          <h3 className="text-base font-bold text-[var(--text-primary)]">No Purchased Listings Found</h3>
          <p className="text-xs text-[var(--text-secondary)]">
            {searchQuery ? 'No purchased items match your search filter.' : 'You have not purchased any listings yet.'}
          </p>
          <Link
            to="/properties"
            className="px-5 py-2.5 bg-[var(--button-primary)] text-[var(--button-primary-text)] font-bold text-xs rounded-xl inline-block shadow-xs"
          >
            Explore Marketplace &rarr;
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {filteredPurchases.map((purchase) => {
            const previewUrl =
              purchase.listingId?.categorySlug === 'properties'
                ? `/properties/${purchase.listingId?._id}`
                : `/listing/${purchase.listingId?._id}`;
            const displayImg =
              purchase.listingId?.images?.[0] ||
              purchase.listingId?.media?.[0]?.secure_url ||
              purchase.listingId?.media?.[0]?.url ||
              'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=800';

            const purchaseDate = purchase.createdAt
              ? new Date(purchase.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })
              : 'Recently';

            return (
              <div
                key={purchase._id}
                className="p-5 bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-3xl shadow-xs hover:border-emerald-500/40 hover:shadow-md transition-all flex flex-col justify-between gap-4 group"
              >
                <div className="flex items-start gap-4">
                  {/* Listing Image */}
                  <div className="w-24 h-24 rounded-2xl bg-[var(--bg-secondary)] overflow-hidden shrink-0 border border-[var(--border-subtle)] relative">
                    <img
                      src={displayImg}
                      alt={purchase.listingId?.title || 'Purchased item'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-black/70 backdrop-blur-xs text-[9px] font-black text-emerald-400 border border-emerald-500/30 flex items-center gap-0.5">
                      <span>✓</span> Bought
                    </div>
                  </div>

                  {/* Listing Details */}
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20">
                        {purchase.listingId?.categorySlug || 'Marketplace'}
                      </span>
                      <span className="text-[11px] text-[var(--text-muted)] font-medium">
                        {purchaseDate}
                      </span>
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-[var(--text-primary)] leading-tight line-clamp-2">
                      {purchase.listingId?.title || 'Marketplace Listing'}
                    </h3>

                    {/* Seller attribution */}
                    <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                      <span>Seller:</span>
                      <span className="font-bold text-[var(--text-primary)]">
                        {purchase.sellerId?.name || 'Verified Seller'}
                      </span>
                      {purchase.sellerId?.location?.city && (
                        <span className="text-[var(--text-muted)] text-[11px]">
                          • {purchase.sellerId.location.city}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Price, Badge & Action Links */}
                <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">
                      Amount Paid
                    </span>
                    <span className="text-base sm:text-lg font-black text-emerald-500 dark:text-emerald-400">
                      {formatListingPrice(purchase.amount, purchase.currency || 'INR')}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {purchase.sellerId?._id && (
                      <Link
                        to={`/dashboard/messages?seller=${purchase.sellerId._id}`}
                        className="px-3 py-2 bg-[var(--bg-secondary)] hover:bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-xl text-xs font-bold text-[var(--text-primary)] transition-colors"
                      >
                        Contact Seller
                      </Link>
                    )}
                    {purchase.listingId?._id && (
                      <Link
                        to={previewUrl}
                        className="px-4 py-2 bg-[var(--button-primary)] text-[var(--button-primary-text)] font-black text-xs rounded-xl shadow-xs hover:opacity-90 transition-opacity"
                      >
                        View Listing &rarr;
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default BuyerPurchases;
