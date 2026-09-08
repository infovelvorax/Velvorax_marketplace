import './ListingCard.css';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '../../common';
import { favoriteService } from '../../../services/api/favorite.service';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../../hooks/useToast';
import { useLocationContext } from '../../../context/LocationContext';
import { cn, formatListingPrice } from '../../../utils';

export function ListingCard({
  id,
  _id,
  title,
  price,
  currency,
  currencySymbol,
  location,
  images = [],
  image,
  listingType = 'SELL',
  condition,
  categorySlug,
  subcategoryName,
  details = {},
  sellerId,
  seller,
  postedDate,
  createdAt,
  featured = false,
  isFavorite: initialFavorite = false,
  viewMode = 'grid',
  className
}) {
  const listingId = id || _id;
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const { selectedLocation } = useLocationContext();
  const [isFav, setIsFav] = useState(initialFavorite);
  const [favLoading, setFavLoading] = useState(false);

  const isServicesCategory = categorySlug === 'services';
  const displayImage = isServicesCategory 
    ? '/service-technician-standard.jpg' 
    : ((images && images.length > 0) ? images[0] : (image || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=800'));
  const photoCount = isServicesCategory ? 1 : (images?.length || (image ? 1 : 0));
  const sellerInfo = sellerId || seller || {};
  const sellerPhone = sellerInfo?.phone || details?.contactPhone || details?.phone;
  const cityLocation = typeof location === 'string' ? location : (location?.city ? `${location.city}${location.region ? `, ${location.region}` : ''}` : 'All Cities');

  // Display the authentic listing currency selected by the seller
  const displayCurrency = currency || 'INR';

  const formatPrice = () => {
    return formatListingPrice(price, displayCurrency, currencySymbol, { listingType, compact: true });
  };

  const formattedDate = postedDate || (createdAt ? new Date(createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Recently');

  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      showToast('info', 'Please sign in to save items to your favorites');
      return;
    }

    if (favLoading) return;
    setFavLoading(true);
    try {
      const res = await favoriteService.toggleFavorite(listingId);
      setIsFav(res.isFavorite);
      showToast('success', res.message || 'Updated favorites');
    } catch (err) {
      showToast('error', 'Failed to update favorites');
    } finally {
      setFavLoading(false);
    }
  };

  const targetLink = categorySlug === 'properties' ? `/properties/${listingId}` : `/listing/${listingId}`;

  // Helper metadata snippet for category cards
  const renderCategorySnippet = () => {
    if (categorySlug === 'vehicles' && details) {
      return (
        <div className="flex flex-wrap items-center gap-2 text-[12px] text-[var(--text-secondary)] font-medium mb-2.5">
          {details.year && <span className="bg-[var(--bg-secondary)] px-2 py-0.5 rounded-md border border-[var(--border-primary)]">📅 {details.year}</span>}
          {details.mileage && <span className="bg-[var(--bg-secondary)] px-2 py-0.5 rounded-md border border-[var(--border-primary)]">⚡ {details.mileage}</span>}
          {details.fuel && <span className="bg-[var(--bg-secondary)] px-2 py-0.5 rounded-md border border-[var(--border-primary)]">⛽ {details.fuel}</span>}
          {details.transmission && <span className="bg-[var(--bg-secondary)] px-2 py-0.5 rounded-md border border-[var(--border-primary)]">⚙️ {details.transmission}</span>}
        </div>
      );
    }
    if (categorySlug === 'products' && (details || condition)) {
      return (
        <div className="flex flex-wrap items-center gap-2 text-[12px] text-[var(--text-secondary)] font-medium mb-2.5">
          {details?.brand && <span className="bg-[var(--bg-secondary)] px-2 py-0.5 rounded-md border border-[var(--border-primary)] font-bold text-[var(--accent)]">🏷️ {details.brand}</span>}
          {condition && <span className="bg-[var(--bg-secondary)] px-2 py-0.5 rounded-md border border-[var(--border-primary)]">✨ {condition.replace('_', ' ')}</span>}
          {details?.warranty && <span className="bg-[var(--bg-secondary)] px-2 py-0.5 rounded-md border border-[var(--border-primary)]">🛡️ {details.warranty}</span>}
        </div>
      );
    }
    if (categorySlug === 'jobs' && details) {
      return (
        <div className="flex flex-wrap items-center gap-2 text-[12px] text-[var(--text-secondary)] font-medium mb-2.5">
          {details.company && <span className="text-[var(--accent)] font-bold bg-[var(--accent)]/10 px-2 py-0.5 rounded-md border border-[var(--accent)]/20">🏢 {details.company}</span>}
          {details.jobType && <span className="bg-[var(--bg-secondary)] px-2 py-0.5 rounded-md border border-[var(--border-primary)]">💼 {details.jobType}</span>}
          {details.salaryRange && <span className="text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">💰 {details.salaryRange}</span>}
        </div>
      );
    }
    if (categorySlug === 'services' && details) {
      return (
        <div className="flex flex-wrap items-center gap-2 text-[12px] text-[var(--text-secondary)] font-medium mb-2.5">
          {details.providerName && <span className="text-[var(--accent)] font-bold">🛠️ {details.providerName}</span>}
          {details.duration && <span className="bg-[var(--bg-secondary)] px-2 py-0.5 rounded-md border border-[var(--border-primary)]">⏱️ {details.duration}</span>}
          {subcategoryName && <span className="bg-[var(--bg-secondary)] px-2 py-0.5 rounded-md border border-[var(--border-primary)]">📋 {subcategoryName}</span>}
        </div>
      );
    }
    if (categorySlug === 'farm' && details) {
      return (
        <div className="flex flex-wrap items-center gap-2 text-[12px] text-[var(--text-secondary)] font-medium mb-2.5">
          {subcategoryName && <span className="bg-[var(--bg-secondary)] px-2 py-0.5 rounded-md border border-[var(--border-primary)]">🌾 {subcategoryName}</span>}
          {details.hp && <span className="bg-[var(--bg-secondary)] px-2 py-0.5 rounded-md border border-[var(--border-primary)]">🚜 {details.hp} HP</span>}
          {details.acreage && <span className="bg-[var(--bg-secondary)] px-2 py-0.5 rounded-md border border-[var(--border-primary)]">📐 {details.acreage} Acres</span>}
        </div>
      );
    }
    if (categorySlug === 'businesses' && details) {
      return (
        <div className="flex flex-wrap items-center gap-2 text-[12px] text-[var(--text-secondary)] font-medium mb-2.5">
          {subcategoryName && <span className="bg-[var(--bg-secondary)] px-2 py-0.5 rounded-md border border-[var(--border-primary)]">🏪 {subcategoryName}</span>}
          {details.businessType && <span className="bg-[var(--bg-secondary)] px-2 py-0.5 rounded-md border border-[var(--border-primary)]">🏢 {details.businessType}</span>}
        </div>
      );
    }
    if (subcategoryName) {
      return (
        <div className="flex items-center gap-2 text-[12px] text-[var(--text-secondary)] font-medium mb-2.5">
          <span className="bg-[var(--bg-secondary)] px-2 py-0.5 rounded-md border border-[var(--border-primary)]">📦 {subcategoryName}</span>
        </div>
      );
    }
    return null;
  };

  // Horizontal List View Render
  if (viewMode === 'list') {
    return (
      <div className={cn(
        "group flex flex-col sm:flex-row bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-3xl overflow-hidden hover:border-[var(--button-primary)] hover:shadow-lg transition-all duration-300 relative text-[var(--text-primary)] shadow-xs",
        className
      )}>
        {/* Left Image */}
        <div className="relative w-full sm:w-72 md:w-80 aspect-[16/10] sm:aspect-auto shrink-0 overflow-hidden bg-[var(--bg-secondary)]">
          <Link to={targetLink} className="block w-full h-full min-h-[220px]">
            <img 
              src={displayImage} 
              alt={title}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            />
          </Link>

          {/* Badges Top Left */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none">
            {featured && (
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-[var(--button-primary)] text-[var(--button-primary-text)] shadow-md border border-[var(--button-primary)]">
                ★ FEATURED
              </span>
            )}
            {listingType && listingType.toUpperCase() !== 'SELL' && (
              <span className={cn(
                "px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider shadow-xs",
                listingType.toUpperCase() === 'FREE' ? "bg-emerald-500/20 text-emerald-500 border border-emerald-500/30" :
                listingType.toUpperCase() === 'RENT' ? "bg-blue-500/20 text-blue-500 border border-blue-500/30" :
                "bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-primary)]"
              )}>
                {listingType}
              </span>
            )}
          </div>

          {/* Photo Count Overlay */}
          {photoCount > 0 && (
            <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-xs text-white text-[11px] font-bold flex items-center gap-1 shadow-xs pointer-events-none">
              <span>📷</span>
              <span>{photoCount} {photoCount === 1 ? 'Photo' : 'Photos'}</span>
            </div>
          )}

          {/* Favorite Heart Button */}
          <button 
            onClick={handleFavoriteClick}
            aria-label="Save listing"
            className="absolute top-3 right-3 p-2 rounded-full bg-[var(--bg-surface)]/90 hover:bg-[var(--bg-surface)] backdrop-blur-xs transition-transform active:scale-90 text-[var(--text-muted)] hover:text-[var(--error)] cursor-pointer shadow-md border border-[var(--border-primary)]"
          >
            <svg className={cn("w-4 h-4 transition-colors", isFav ? "text-[var(--error)] fill-[var(--error)]" : "text-[var(--text-muted)]")} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>

        {/* Right Info Body */}
        <div className="flex flex-col flex-1 p-5 sm:p-6 justify-between">
          <div>
            <div className="flex items-baseline justify-between gap-3 mb-1.5">
              <div className="text-2xl font-black text-[var(--text-primary)] tracking-tight">
                {formatPrice()}
                {listingType?.toUpperCase() === 'RENT' && <span className="text-[13px] text-[var(--text-secondary)] font-normal ml-1">/mo</span>}
              </div>
              <span className="text-[12px] text-[var(--text-muted)] font-medium shrink-0">{formattedDate}</span>
            </div>

            <Link to={targetLink} className="font-bold text-[var(--text-primary)] text-lg hover:text-[var(--accent)] transition-colors block mb-2 leading-snug">
              {title}
            </Link>

            {renderCategorySnippet()}

            <div className="flex items-center gap-1.5 text-[13px] text-[var(--text-secondary)] mb-4 font-medium">
              <svg className="w-4 h-4 text-[var(--accent)] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{cityLocation}</span>
            </div>
          </div>

          <div className="pt-4 border-t border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[var(--bg-secondary)] text-[var(--text-primary)] flex items-center justify-center overflow-hidden shrink-0 border border-[var(--border-primary)] text-xs font-black">
                {sellerInfo?.profilePhoto ? (
                  <img src={sellerInfo.profilePhoto} alt={sellerInfo.name} className="w-full h-full object-cover" />
                ) : (
                  <span>{sellerInfo?.name?.charAt(0) || 'U'}</span>
                )}
              </div>
              <span className="text-[13px] font-bold text-[var(--text-primary)]">{sellerInfo?.name || 'Verified Seller'}</span>
              {(sellerInfo?.verificationStatus === 'VERIFIED' || sellerInfo?.verified) && (
                <span className="text-emerald-500 text-xs font-bold" title="Verified Seller">✓</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {sellerPhone && (
                <a
                  href={`tel:${sellerPhone}`}
                  onClick={(e) => e.stopPropagation()}
                  className="px-3.5 py-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95"
                  title="Click to dial seller"
                >
                  <span>📞</span>
                  <span>Call</span>
                </a>
              )}
              <Link
                to={targetLink}
                className="px-4 py-2 rounded-xl bg-[var(--button-primary)] text-[var(--button-primary-text)] hover:bg-[var(--button-primary-hover)] font-bold text-xs transition-all shadow-xs"
              >
                View Details &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Standard Grid View Render
  return (
    <div className={cn(
      "group listing-card-container flex flex-col bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-3xl overflow-hidden hover:border-[var(--button-primary)] hover:shadow-xl transition-all duration-300 relative text-[var(--text-primary)] shadow-xs", 
      className
    )}>
      
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-[var(--bg-secondary)]">
        <Link to={targetLink} className="block w-full h-full">
          <img 
            src={displayImage} 
            alt={title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        </Link>
        
        {/* Badges Top Left */}
        <div className="absolute top-3.5 left-3.5 flex flex-col gap-1.5 pointer-events-none">
          {featured && (
            <span className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-[var(--button-primary)] text-[var(--button-primary-text)] shadow-md border border-[var(--button-primary)]">
              ★ FEATURED
            </span>
          )}
          {listingType && listingType.toUpperCase() !== 'SELL' && (
            <span className={cn(
              "px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-xs",
              listingType.toUpperCase() === 'FREE' ? "bg-emerald-500/90 text-white border border-emerald-400" :
              listingType.toUpperCase() === 'RENT' ? "bg-blue-600/90 text-white border border-blue-400" :
              "bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-primary)]"
            )}>
              {listingType}
            </span>
          )}
        </div>

        {/* Photo Count Overlay */}
        {photoCount > 0 && (
          <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-xs text-white text-[11px] font-bold flex items-center gap-1 shadow-xs pointer-events-none">
            <span>📷</span>
            <span>{photoCount}</span>
          </div>
        )}

        {/* Favorite Heart Button */}
        <button 
          onClick={handleFavoriteClick}
          aria-label="Save listing"
          className="absolute top-3.5 right-3.5 p-2.5 rounded-full bg-[var(--bg-surface)]/90 hover:bg-[var(--bg-surface)] backdrop-blur-xs transition-transform active:scale-90 text-[var(--text-muted)] hover:text-[var(--error)] cursor-pointer shadow-md border border-[var(--border-primary)]"
        >
          <svg className={cn("w-4 h-4 transition-colors", isFav ? "text-[var(--error)] fill-[var(--error)]" : "text-[var(--text-muted)]")} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>

      {/* Content Body */}
      <div className="flex flex-col flex-1 p-5 sm:p-6">
        
        {/* Price */}
        <div className="text-xl sm:text-[22px] font-black text-[var(--text-primary)] mb-1.5 tracking-tight flex items-baseline justify-between">
          <span>{formatPrice()}</span>
          {listingType?.toUpperCase() === 'RENT' && <span className="text-[12px] text-[var(--text-secondary)] font-medium">/mo</span>}
        </div>

        {/* Title */}
        <Link to={targetLink} className="font-bold text-[var(--text-primary)] text-[16px] sm:text-[17px] line-clamp-2 group-hover:text-[var(--accent)] transition-colors mb-2 leading-snug">
          {title}
        </Link>

        {/* Category metadata snippet */}
        {renderCategorySnippet()}

        {/* Footer info: Location & Seller */}
        <div className="mt-auto pt-4 border-t border-[var(--border-subtle)] space-y-2.5 text-[13px] text-[var(--text-secondary)]">
          <div className="flex items-center justify-between gap-1 text-[13px]">
            <div className="flex items-center gap-1.5 truncate text-[var(--text-secondary)]">
              <svg className="w-4 h-4 text-[var(--accent)] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="truncate font-medium">{cityLocation}</span>
            </div>
            <span className="text-[var(--text-muted)] shrink-0 font-medium text-xs">{formattedDate}</span>
          </div>
          
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2 truncate">
              <div className="w-6 h-6 rounded-full bg-[var(--bg-secondary)] text-[var(--text-primary)] flex items-center justify-center overflow-hidden shrink-0 border border-[var(--border-primary)] text-[10px] font-black">
                {sellerInfo?.profilePhoto ? (
                  <img src={sellerInfo.profilePhoto} alt={sellerInfo.name} className="w-full h-full object-cover" />
                ) : (
                  <span>{sellerInfo?.name?.charAt(0) || 'U'}</span>
                )}
              </div>
              <span className="truncate text-[var(--text-secondary)] text-[12px] font-semibold">{sellerInfo?.name || 'Verified Member'}</span>
            </div>

            {sellerPhone && (
              <a
                href={`tel:${sellerPhone}`}
                onClick={(e) => e.stopPropagation()}
                className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 font-bold text-[11px] flex items-center gap-1 shrink-0 transition-all active:scale-95"
                title="Click to dial seller"
              >
                <span>📞</span>
                <span>Call</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ListingCard;
