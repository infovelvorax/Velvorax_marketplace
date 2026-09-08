import './Favorites.css';
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { favoriteService } from '../../services/api/favorite.service';
import { ListingCard } from '../../components/listing/ListingCard';
import { Loader } from '../../components/common/Loader';
import { BackButton } from '../../components/common/BackButton';
import { ROUTES } from '../../constants';

export const Favorites = () => {
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);

  const fetchFavorites = useCallback(async () => {
    setLoading(true);
    try {
      const data = await favoriteService.getFavorites();
      const items = Array.isArray(data) ? data : (data?.data || []);
      setFavorites(items);
    } catch (err) {
      console.error('Failed to load favorites:', err);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const safeFavorites = Array.isArray(favorites) ? favorites : [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto text-[var(--text-primary)]">
      <div>
        <div className="mb-3">
          <BackButton fallbackUrl="/" label="Back" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] tracking-tight">Saved Favorites</h1>
        <p className="text-[15px] text-[var(--text-secondary)] mt-1">Listings you have bookmarked to monitor or contact later.</p>
      </div>

      {loading ? (
        <div className="py-24 flex justify-center"><Loader size="lg" /></div>
      ) : safeFavorites.length === 0 ? (
        <div className="p-14 bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-3xl text-center shadow-xs">
          <div className="text-5xl mb-4">❤️</div>
          <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Your wishlist is currently empty</h3>
          <p className="text-[15px] text-[var(--text-secondary)] mb-6">Browse marketplace deals and click the heart icon on any item to save it.</p>
          <Link to={ROUTES.SEARCH} className="px-8 py-3.5 bg-[var(--button-primary)] text-[var(--button-primary-text)] hover:bg-[var(--button-primary-hover)] font-bold text-[14px] rounded-xl transition-all shadow-xs border border-[var(--button-primary)]">
            Browse Marketplace
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {safeFavorites.map(fav => {
            const listing = fav?.listingId || fav;
            if (!listing || !listing._id) return null;
            return (
              <ListingCard 
                key={fav._id || listing._id} 
                {...listing} 
                isFavorite={true} 
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Favorites;

