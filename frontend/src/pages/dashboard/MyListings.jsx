import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { listingsService } from '../../services/api/listings.service';
import { useToast } from '../../hooks/useToast';
import { Loader } from '../../components/common/Loader';
import { ROUTES } from '../../constants';
import { formatCurrency } from '../../utils';

export function MyListings() {
  const { showToast } = useToast();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listingsService.getMyListings();
      setListings(data?.listings || data?.data || data || []);
    } catch (err) {
      console.error(err);
      showToast('error', 'Failed to load your listings');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const handleStatusChange = async (id, status) => {
    try {
      await listingsService.updateListingStatus(id, status);
      showToast('success', `Listing marked as ${status}`);
      setListings((prev) => prev.map((item) => (item._id === id ? { ...item, status } : item)));
    } catch (e) {
      showToast('error', 'Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this listing? This action cannot be undone.')) return;
    try {
      await listingsService.deleteListing(id);
      showToast('success', 'Listing deleted successfully');
      setListings((prev) => prev.filter((item) => item._id !== id));
    } catch (e) {
      showToast('error', 'Failed to delete listing');
    }
  };

  const filteredListings = listings.filter((item) => {
    if (!item) return false;
    const matchesStatus =
      statusFilter === 'ALL'
        ? true
        : statusFilter === 'PENDING_REVIEW'
        ? ['PENDING', 'PENDING_REVIEW', 'UNDER_REVIEW'].includes(item.status)
        : item.status === statusFilter;

    const q = (searchQuery || '').trim().toLowerCase();
    const matchesSearch =
      !q ||
      item.title?.toLowerCase().includes(q) ||
      item.location?.city?.toLowerCase().includes(q);

    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            ✓ Live (Approved)
          </span>
        );
      case 'PENDING_REVIEW':
      case 'UNDER_REVIEW':
      case 'PENDING':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30 animate-pulse">
            ⏳ In Review
          </span>
        );
      case 'CHANGES_REQUESTED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/15 text-blue-400 border border-blue-500/30">
            📝 Changes Requested
          </span>
        );
      case 'REJECTED':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/15 text-rose-400 border border-rose-500/30">
            ✕ Rejected
          </span>
        );
      case 'SOLD':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/15 text-purple-400 border border-purple-500/30">
            🏷️ Sold
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border-primary)]">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-[var(--text-primary)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border-subtle)]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-xs font-bold uppercase tracking-wider mb-2">
            <span>📦</span>
            <span>Seller Inventory</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
            Manage My Listings
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
            Track approval status, feedback, and manage your active advertisements.
          </p>
        </div>

        <Link
          to={ROUTES.POST_LISTING}
          className="px-5 py-2.5 bg-[var(--button-primary)] text-[var(--button-primary-text)] hover:bg-[var(--button-primary-hover)] font-black text-xs sm:text-sm rounded-2xl self-start sm:self-auto transition-all shadow-md active:scale-95"
        >
          + Post New Listing
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-primary)] shadow-xs">
        {/* Status Pills */}
        <div className="flex flex-wrap gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: 'ALL', label: 'All Listings' },
            { id: 'APPROVED', label: 'Live' },
            { id: 'PENDING_REVIEW', label: 'In Review' },
            { id: 'SOLD', label: 'Sold' },
            { id: 'CHANGES_REQUESTED', label: 'Changes' },
            { id: 'REJECTED', label: 'Rejected' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-[var(--button-primary)] text-[var(--button-primary-text)] shadow-xs'
                  : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & View Toggle */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-xs text-[var(--text-muted)]">
              🔍
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search listings..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--button-primary)]"
            />
          </div>

          <div className="flex items-center gap-1 p-1 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-subtle)]">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs cursor-pointer ${viewMode === 'grid' ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-2xs' : 'text-[var(--text-muted)]'}`}
              title="Grid View"
            >
              ⊞
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg text-xs cursor-pointer ${viewMode === 'list' ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-2xs' : 'text-[var(--text-muted)]'}`}
              title="List View"
            >
              ☰
            </button>
          </div>
        </div>
      </div>

      {/* Listings Body */}
      {loading ? (
        <div className="py-24 flex justify-center">
          <Loader size="lg" />
        </div>
      ) : filteredListings.length === 0 ? (
        <div className="p-14 bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-3xl text-center shadow-xs space-y-4">
          <div className="text-5xl">📦</div>
          <h3 className="text-lg font-bold text-[var(--text-primary)]">No listings found</h3>
          <p className="text-xs text-[var(--text-secondary)] max-w-md mx-auto">
            {searchQuery ? 'No items match your search.' : 'You have no listings under this filter.'}
          </p>
          <Link
            to={ROUTES.POST_LISTING}
            className="inline-flex px-6 py-3 bg-[var(--button-primary)] text-[var(--button-primary-text)] hover:bg-[var(--button-primary-hover)] font-bold text-xs rounded-xl shadow-xs"
          >
            Post Property or Product Now
          </Link>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map((item) => {
            const previewUrl =
              item.categorySlug === 'properties' ? `/properties/${item._id}` : `/listing/${item._id}`;
            const displayImg =
              item.images?.[0] ||
              item.media?.[0]?.secure_url ||
              item.media?.[0]?.url ||
              'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=800';

            return (
              <div
                key={item._id}
                className="bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-3xl overflow-hidden flex flex-col justify-between shadow-xs hover:border-emerald-500/40 hover:shadow-lg transition-all group"
              >
                <div>
                  <div className="relative aspect-[16/10] bg-[var(--bg-secondary)] overflow-hidden">
                    <img
                      src={displayImg}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400"
                    />
                    <div className="absolute top-3 right-3">{getStatusBadge(item.status)}</div>
                    <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-xs text-[10px] font-black text-white uppercase tracking-wider">
                      {item.listingType}
                    </div>
                  </div>

                  <div className="p-5 space-y-2">
                    <div className="text-lg font-black text-emerald-500 dark:text-emerald-400">
                      {formatCurrency(item.price, item.currency)}
                    </div>
                    <Link
                      to={previewUrl}
                      className="text-sm font-bold text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors line-clamp-2"
                    >
                      {item.title}
                    </Link>
                    <div className="text-xs text-[var(--text-secondary)] flex items-center justify-between pt-1">
                      <span>📍 {item.location?.city || 'India'}</span>
                      <span>👁️ {item.views || 0} views</span>
                    </div>

                    {/* Admin Feedback Box */}
                    {item.status === 'CHANGES_REQUESTED' && item.changeRequestReason && (
                      <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-xs text-blue-400 space-y-1 mt-2">
                        <span className="font-bold">📝 Admin Feedback:</span>
                        <p className="text-[11px]">{item.changeRequestReason}</p>
                      </div>
                    )}

                    {item.status === 'REJECTED' && item.rejectionReason && (
                      <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-xs text-rose-400 space-y-1 mt-2">
                        <span className="font-bold">✕ Rejection Reason:</span>
                        <p className="text-[11px]">{item.rejectionReason}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-[var(--bg-secondary)]/50 border-t border-[var(--border-subtle)] flex items-center justify-between gap-2">
                  <Link
                    to={previewUrl}
                    className="px-3.5 py-1.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl text-xs font-bold text-[var(--text-primary)] transition-colors"
                  >
                    View Page &rarr;
                  </Link>

                  <div className="flex items-center gap-1.5">
                    {item.status !== 'SOLD' && (
                      <button
                        type="button"
                        onClick={() => handleStatusChange(item._id, 'SOLD')}
                        className="px-3 py-1.5 bg-purple-600/10 hover:bg-purple-600/20 text-purple-400 border border-purple-600/20 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                      >
                        Sold
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDelete(item._id)}
                      className="px-2.5 py-1.5 bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 border border-rose-600/20 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="space-y-3">
          {filteredListings.map((item) => {
            const previewUrl =
              item.categorySlug === 'properties' ? `/properties/${item._id}` : `/listing/${item._id}`;
            const displayImg =
              item.images?.[0] ||
              item.media?.[0]?.secure_url ||
              item.media?.[0]?.url ||
              'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=800';

            return (
              <div
                key={item._id}
                className="p-4 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-primary)] shadow-xs hover:border-emerald-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-16 h-14 sm:w-20 sm:h-16 rounded-2xl overflow-hidden bg-[var(--bg-secondary)] shrink-0 border border-[var(--border-subtle)]">
                    <img src={displayImg} alt={item.title} className="w-full h-full object-cover" />
                  </div>

                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-xs sm:text-sm text-[var(--text-primary)] truncate">
                        {item.title}
                      </span>
                      {getStatusBadge(item.status)}
                    </div>
                    <div className="text-xs text-[var(--text-secondary)]">
                      <span className="font-bold text-emerald-500 dark:text-emerald-400 mr-2">
                        {formatCurrency(item.price, item.currency)}
                      </span>
                      • 📍 {item.location?.city || 'India'} • 👁️ {item.views || 0} views
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  <Link
                    to={previewUrl}
                    className="px-3.5 py-1.5 bg-[var(--bg-secondary)] hover:bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-xl text-xs font-bold text-[var(--text-primary)]"
                  >
                    View &rarr;
                  </Link>
                  {item.status !== 'SOLD' && (
                    <button
                      type="button"
                      onClick={() => handleStatusChange(item._id, 'SOLD')}
                      className="px-3 py-1.5 bg-purple-600/10 hover:bg-purple-600/20 text-purple-400 border border-purple-600/20 rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Sold
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(item._id)}
                    className="px-2.5 py-1.5 bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 border border-rose-600/20 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MyListings;
