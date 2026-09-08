import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { favoriteService } from '../../../services/api/favorite.service';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../../hooks/useToast';
import { useLocationContext } from '../../../context/LocationContext';
import { formatListingPrice, formatCurrency, cn } from '../../../utils';

export function PropertyCard({
  _id,
  id,
  title,
  price = 0,
  currency = 'INR',
  currencySymbol = '₹',
  location = {},
  images = [],
  listingType = 'SELL',
  propertyDetails = {},
  details = {},
  sellerId = {},
  isFavorite: initialFavorite = false,
  viewMode = 'grid',
  className = ''
}) {
  const listingId = _id || id;
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [isFav, setIsFav] = useState(initialFavorite);
  const [favLoading, setFavLoading] = useState(false);
  const [activeImgIndex, setActiveImgIndex] = useState(0);

  const propSpecs = propertyDetails || details || {};
  const isRent = listingType?.toUpperCase() === 'RENT' || propSpecs.purpose === 'RENT';

  const displayImages = images && images.length > 0 
    ? images 
    : ['https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=800'];

  const seller = typeof sellerId === 'object' ? sellerId : {};
  const sellerPhone = seller?.phone || '';

  // Extract specs
  const bhk = propSpecs.bhk || propSpecs.bedrooms || (propSpecs.propertyType ? `${propSpecs.propertyType}` : 'Property');
  const baths = propSpecs.bathrooms || propSpecs.baths;
  const area = propSpecs.area || propSpecs.builtUpArea || propSpecs.superBuiltupArea || propSpecs.carpetArea;
  const areaUnit = propSpecs.areaUnit || 'sq.ft';
  const furnishing = propSpecs.furnishing || propSpecs.furnishingStatus;

  // Location string
  const locString = typeof location === 'string' 
    ? location 
    : [location?.localArea || location?.landmark, location?.city, location?.region].filter(Boolean).join(', ') || 'Prime Location';

  // Price per sqft calculation
  const pricePerSqFt = area && Number(area) > 0 && price && Number(price) > 0
    ? Math.round(Number(price) / Number(area))
    : null;

  const displayCurrency = currency || 'INR';

  const formattedPrice = formatListingPrice(price, displayCurrency, currencySymbol, {
    listingType: isRent ? 'RENT' : 'SELL',
    compact: true
  });

  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      showToast('info', 'Please sign in to save properties to your wishlist');
      return;
    }

    if (favLoading) return;
    setFavLoading(true);
    try {
      const res = await favoriteService.toggleFavorite(listingId);
      setIsFav(res?.isFavorite ?? !isFav);
      showToast('success', res?.message || (isFav ? 'Removed from wishlist' : 'Saved to wishlist!'));
    } catch (err) {
      showToast('error', err.message || 'Failed to update wishlist');
    } finally {
      setFavLoading(false);
    }
  };

  // Horizontal List View Render
  if (viewMode === 'list') {
    return (
      <div className={cn(
        "group flex flex-col md:flex-row bg-[var(--bg-surface)] border border-[var(--border-primary)] hover:border-[var(--button-primary)] rounded-3xl overflow-hidden transition-all duration-300 shadow-xs hover:shadow-lg relative text-[var(--text-primary)]",
        className
      )}>
        {/* Image Container */}
        <div className="relative md:w-80 lg:w-96 shrink-0 aspect-[16/10] md:aspect-auto overflow-hidden bg-[var(--bg-secondary)]">
          <Link to={`/properties/${listingId}`} className="block w-full h-full">
            <img 
              src={displayImages[activeImgIndex] || displayImages[0]} 
              alt={title} 
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            />
          </Link>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 pointer-events-none">
            <span className={cn(
              "px-3 py-1 rounded-xl text-[11px] font-black uppercase tracking-wider shadow-sm",
              isRent ? "bg-blue-600 text-white" : "bg-emerald-600 text-white"
            )}>
              {isRent ? 'For Rent' : 'For Sale'}
            </span>
            {propSpecs.possessionStatus && (
              <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase bg-black/70 backdrop-blur-xs text-white border border-white/20">
                {propSpecs.possessionStatus}
              </span>
            )}
          </div>

          {/* Photo Count */}
          {displayImages.length > 1 && (
            <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-xs text-white text-[11px] font-bold flex items-center gap-1 border border-white/20">
              <span>📷</span>
              <span>{displayImages.length} Photos</span>
            </div>
          )}

          {/* Save Button */}
          <button
            type="button"
            onClick={handleFavoriteClick}
            aria-label="Save to Wishlist"
            className="absolute top-3 right-3 w-9 h-9 rounded-xl bg-black/50 hover:bg-black/80 backdrop-blur-xs text-white flex items-center justify-center transition-transform active:scale-90 border border-white/20 cursor-pointer"
          >
            <span className="text-base">{isFav ? '❤️' : '🤍'}</span>
          </button>
        </div>

        {/* Content Details */}
        <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between">
          <div>
            {/* Price & Price per sqft */}
            <div className="flex items-baseline justify-between gap-2 mb-2">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl lg:text-3xl font-black text-[var(--text-primary)] tracking-tight">
                  {formattedPrice}
                </span>
                {isRent && <span className="text-xs font-bold text-[var(--text-secondary)]">/ month</span>}
              </div>
              {pricePerSqFt && (
                <span className="text-xs font-bold text-[var(--text-muted)] bg-[var(--bg-secondary)] px-2.5 py-1 rounded-lg border border-[var(--border-subtle)]">
                  {formatListingPrice(pricePerSqFt, displayCurrency, currencySymbol)} / sq.ft
                </span>
              )}
            </div>

            {/* Title */}
            <Link to={`/properties/${listingId}`} className="block group-hover:text-[var(--accent)] transition-colors">
              <h3 className="font-bold text-lg text-[var(--text-primary)] leading-snug line-clamp-1 mb-1.5">
                {title}
              </h3>
            </Link>

            {/* Location */}
            <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] font-medium mb-4">
              <span>📍</span>
              <span className="truncate">{locString}</span>
            </div>

            {/* Property Specs Ribbon */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 p-3 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-xs font-bold text-[var(--text-primary)] mb-4">
              <div className="flex items-center gap-1.5">
                <span>🛏️</span>
                <span>{bhk}</span>
              </div>
              {baths && (
                <>
                  <span className="text-[var(--text-muted)]">•</span>
                  <div className="flex items-center gap-1.5">
                    <span>🛁</span>
                    <span>{baths} Baths</span>
                  </div>
                </>
              )}
              {area && (
                <>
                  <span className="text-[var(--text-muted)]">•</span>
                  <div className="flex items-center gap-1.5">
                    <span>📐</span>
                    <span>{Number(area).toLocaleString()} {areaUnit}</span>
                  </div>
                </>
              )}
              {furnishing && (
                <>
                  <span className="text-[var(--text-muted)]">•</span>
                  <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                    <span>🛋️</span>
                    <span>{furnishing}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Card Footer: Seller info & Quick Actions */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-[var(--border-subtle)] flex-wrap">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase shrink-0">
                {seller?.name?.charAt(0) || 'S'}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-[var(--text-primary)] truncate flex items-center gap-1">
                  <span>{seller?.name || 'Verified Partner'}</span>
                  {seller?.verificationStatus === 'VERIFIED' && <span className="text-blue-500 text-[10px]">✓</span>}
                </div>
                <div className="text-[10px] text-[var(--text-muted)]">Verified Seller</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {sellerPhone && (
                <a
                  href={`tel:${sellerPhone}`}
                  className="px-3 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-colors flex items-center gap-1.5"
                  title="Call Seller Directly"
                >
                  <span>📞</span>
                  <span className="hidden sm:inline">Call</span>
                </a>
              )}
              <Link
                to={`/properties/${listingId}`}
                className="px-4 py-2 rounded-xl bg-[var(--button-primary)] hover:bg-[var(--button-primary-hover)] text-[var(--button-primary-text)] font-bold text-xs transition-all shadow-xs flex items-center gap-1.5"
              >
                <span>View Details</span>
                <span>&rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Standard Grid View Card
  return (
    <div className={cn(
      "group flex flex-col bg-[var(--bg-surface)] border border-[var(--border-primary)] hover:border-[var(--button-primary)] rounded-3xl overflow-hidden transition-all duration-300 shadow-xs hover:shadow-xl relative text-[var(--text-primary)] h-full",
      className
    )}>
      {/* Image Container */}
      <div className="relative aspect-[16/11] overflow-hidden bg-[var(--bg-secondary)]">
        <Link to={`/properties/${listingId}`} className="block w-full h-full">
          <img 
            src={displayImages[activeImgIndex] || displayImages[0]} 
            alt={title} 
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        </Link>

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none">
          <span className={cn(
            "px-3 py-1 rounded-xl text-[11px] font-black uppercase tracking-wider shadow-sm",
            isRent ? "bg-blue-600 text-white" : "bg-emerald-600 text-white"
          )}>
            {isRent ? 'For Rent' : 'For Sale'}
          </span>
          {propSpecs.possessionStatus && (
            <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase bg-black/70 backdrop-blur-xs text-white border border-white/20">
              {propSpecs.possessionStatus}
            </span>
          )}
        </div>

        {/* Photo Count */}
        {displayImages.length > 1 && (
          <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold flex items-center gap-1 border border-white/20">
            <span>📷</span>
            <span>{displayImages.length}</span>
          </div>
        )}

        {/* Save Wishlist Button */}
        <button
          type="button"
          onClick={handleFavoriteClick}
          aria-label="Save to Wishlist"
          className="absolute top-3 right-3 w-8.5 h-8.5 rounded-xl bg-black/50 hover:bg-black/80 backdrop-blur-xs text-white flex items-center justify-center transition-transform active:scale-90 border border-white/20 cursor-pointer"
        >
          <span className="text-sm">{isFav ? '❤️' : '🤍'}</span>
        </button>
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-3.5">
        <div>
          {/* Price Header */}
          <div className="flex items-baseline justify-between gap-2 mb-1.5">
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-black text-[var(--text-primary)] tracking-tight">
                {formattedPrice}
              </span>
              {isRent && <span className="text-xs font-bold text-[var(--text-secondary)]">/ mo</span>}
            </div>
            {pricePerSqFt && (
              <span className="text-[11px] font-bold text-[var(--text-muted)] bg-[var(--bg-secondary)] px-2 py-0.5 rounded-md border border-[var(--border-subtle)]">
                {formatListingPrice(pricePerSqFt, displayCurrency, currencySymbol)}/sq.ft
              </span>
            )}
          </div>

          {/* Title */}
          <Link to={`/properties/${listingId}`} className="block group-hover:text-[var(--accent)] transition-colors mb-1">
            <h3 className="font-bold text-base text-[var(--text-primary)] leading-snug line-clamp-1">
              {title}
            </h3>
          </Link>

          {/* Location */}
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] font-medium mb-3">
            <span className="text-xs">📍</span>
            <span className="truncate">{locString}</span>
          </div>

          {/* Specs Bar */}
          <div className="grid grid-cols-3 gap-1.5 p-2.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[11px] font-bold text-center">
            <div className="flex flex-col items-center">
              <span className="text-[var(--text-muted)] text-[10px]">Bedrooms</span>
              <span className="text-[var(--text-primary)] font-black truncate max-w-[80px]">{bhk}</span>
            </div>
            <div className="flex flex-col items-center border-x border-[var(--border-subtle)] px-1">
              <span className="text-[var(--text-muted)] text-[10px]">Area</span>
              <span className="text-[var(--text-primary)] font-black truncate max-w-[80px]">{area ? `${area} sq.ft` : 'Spacious'}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[var(--text-muted)] text-[10px]">Status</span>
              <span className="text-[var(--text-primary)] font-black truncate max-w-[80px]">{furnishing || 'Verified'}</span>
            </div>
          </div>
        </div>

        {/* Card Actions */}
        <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between gap-2">
          {sellerPhone ? (
            <a
              href={`tel:${sellerPhone}`}
              className="flex-1 py-2 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              title="Click to dial phone"
            >
              <span>📞</span>
              <span>Call</span>
            </a>
          ) : (
            <div className="text-[11px] font-bold text-[var(--text-muted)] truncate flex items-center gap-1">
              <span>🛡️</span>
              <span>Verified Seller</span>
            </div>
          )}

          <Link
            to={`/properties/${listingId}`}
            className="flex-1 py-2 px-3 rounded-xl bg-[var(--button-primary)] hover:bg-[var(--button-primary-hover)] text-[var(--button-primary-text)] font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-1 text-center"
          >
            <span>Details</span>
            <span>&rarr;</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default PropertyCard;
