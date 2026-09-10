import React, { useState, useEffect, useCallback } from 'react';
import { favoriteService } from '../../services/api/favorite.service';
import { useToast } from '../../hooks/useToast';
import { Loader } from '../../components/common/Loader';
import { Link } from 'react-router-dom';
import { formatListingPrice } from '../../utils/formatters';

export function BuyerSaved() {
  const { showToast } = useToast();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchFavorites = useCallback(async () => {
    setLoading(true);
    try {
      const response = await favoriteService.getFavorites();
      setFavorites(Array.isArray(response) ? response : (response?.data || []));
    } catch (err) {
      showToast('error', err.message || 'Failed to load saved listings');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const handleRemove = async (listingId) => {
    try {
      await favoriteService.toggleFavorite(listingId);
      showToast('info', 'Removed from saved wishlist.');
      fetchFavorites();
    } catch (err) {
      showToast('error', err.message || 'Failed to update wishlist');
    }
  };

  const filteredFavorites = favorites.filter((fav) => {
    const item = fav?.listingId || fav;
    if (!item || !item.title) return false;
    const q = (searchQuery || '').trim().toLowerCase();
    return (
      !q ||
      item.title?.toLowerCase().includes(q) ||
      item.location?.city?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-[var(--text-primary)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border-subtle)]">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link to="/buyer/dashboard" className="text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
              &larr; Buyer Hub
            </Link>
            <span className="text-xs text-[var(--text-muted)]">/</span>
            <span className="text-xs font-bold text-rose-500">Wishlist</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
            Saved Properties & Items
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
            Bookmarked listings you are watching and tracking.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            type="button"
            onClick={fetchFavorites}
            className="px-4 py-2 bg-[var(--bg-surface)] hover:bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <span>🔄</span>
            <span>Refresh</span>
          </button>

          <Link
            to="/properties"
            className="px-4 py-2 bg-[var(--button-primary)] text-[var(--button-primary-text)] hover:bg-[var(--button-primary-hover)] font-bold text-xs rounded-2xl shadow-xs"
          >
            + Browse More
          </Link>
        </div>
      </div>

      {/* Search Filter */}
      {favorites.length > 0 && (
        <div className="p-4 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-primary)] shadow-xs flex items-center justify-between gap-4">
          <span className="text-xs font-bold text-[var(--text-secondary)]">
            Showing {filteredFavorites.length} saved {filteredFavorites.length === 1 ? 'item' : 'items'}
          </span>
          <div className="relative sm:w-64">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-xs text-[var(--text-muted)]">
              🔍
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search saved items..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--button-primary)]"
            />
          </div>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="py-24 flex justify-center">
          <Loader size="lg" />
        </div>
      ) : filteredFavorites.length === 0 ? (
        <div className="p-12 text-center bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-3xl space-y-4">
          <div className="text-4xl">❤️</div>
          <h3 className="text-base font-bold text-[var(--text-primary)]">Your Wishlist is Empty</h3>
          <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto">
            {searchQuery
              ? 'No saved items match your search keywords.'
              : 'Click the heart button on any property or product to save it here for quick access.'}
          </p>
          <Link
            to="/properties"
            className="px-5 py-2.5 bg-[var(--button-primary)] text-[var(--button-primary-text)] font-bold text-xs rounded-2xl inline-block shadow-md"
          >
            Browse Marketplace &rarr;
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFavorites.map((fav) => {
            const item = fav.listingId || fav;
            if (!item || !item.title) return null;
            const previewUrl =
              item.categorySlug === 'properties' ? `/properties/${item._id}` : `/listing/${item._id}`;
            const displayImg =
              item.images?.[0] ||
              item.media?.[0]?.secure_url ||
              item.media?.[0]?.url ||
              'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=800';

            return (
              <div
                key={fav._id}
                className="bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-3xl overflow-hidden shadow-xs flex flex-col justify-between hover:border-rose-500/40 hover:shadow-lg transition-all group"
              >
                <div>
                  <div className="relative aspect-[16/10] bg-[var(--bg-secondary)] overflow-hidden">
                    <img
                      src={displayImg}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400"
                    />
                    <div className="absolute top-3 right-3">
                      <button
                        type="button"
                        onClick={() => handleRemove(item._id)}
                        className="w-9 h-9 rounded-full bg-black/70 backdrop-blur-md flex items-center justify-center text-rose-500 hover:scale-110 transition-transform cursor-pointer border border-white/20 shadow-md"
                        title="Remove from saved"
                      >
                        ❤️
                      </button>
                    </div>
                    <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-xs text-[10px] font-black text-white uppercase tracking-wider">
                      {item.listingType || 'FOR SALE'}
                    </div>
                  </div>

                  <div className="p-5 space-y-2">
                    <span className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-wider">
                      {item.categorySlug || 'Marketplace'}
                    </span>
                    <h3 className="font-bold text-sm text-[var(--text-primary)] line-clamp-2 leading-snug">
                      {item.title}
                    </h3>
                    <div className="flex items-center justify-between pt-2">
                      <span className="font-black text-lg text-emerald-500 dark:text-emerald-400">
                        {formatListingPrice(item.price, item.currency || 'INR', null, { listingType: item.listingType })}
                      </span>
                      <span className="text-xs text-[var(--text-muted)] truncate max-w-[120px]">
                        📍 {item.location?.city || 'India'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-[var(--bg-secondary)]/50 border-t border-[var(--border-subtle)] flex items-center justify-between">
                  <Link
                    to={previewUrl}
                    className="px-4 py-2 bg-[var(--button-primary)] text-[var(--button-primary-text)] font-bold text-xs rounded-xl shadow-xs"
                  >
                    View Details &rarr;
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleRemove(item._id)}
                    className="text-xs font-bold text-rose-500 hover:underline cursor-pointer"
                  >
                    Remove
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

export default BuyerSaved;
