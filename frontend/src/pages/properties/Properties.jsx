import './Properties.css';
import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Container } from '../../components/common/Container';
import { PropertyCard } from './components/PropertyCard';
import { RealMapLocation } from '../../components/common/RealMapLocation/RealMapLocation';
import { Loader } from '../../components/common/Loader';
import { listingsService } from '../../services/api/listings.service';
import { ROUTES } from '../../constants';
import { cn } from '../../utils';

export const Properties = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list' | 'map'

  // Active URL Filter Parameters
  const purpose = searchParams.get('listingType') || '';
  const bhk = searchParams.get('bhk') || '';
  const propertyType = searchParams.get('propertyType') || '';
  const furnishing = searchParams.get('furnishing') || '';
  const possessionStatus = searchParams.get('possessionStatus') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const minArea = searchParams.get('minArea') || '';
  const maxArea = searchParams.get('maxArea') || '';
  const city = searchParams.get('city') || '';
  const sortBy = searchParams.get('sortBy') || 'newest';
  const page = parseInt(searchParams.get('page'), 10) || 1;

  // Fetch properties from backend
  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      setError(null);
      try {
        const query = {
          category: 'properties',
          listingType: purpose || undefined,
          bhk: bhk || undefined,
          propertyType: propertyType || undefined,
          furnishing: furnishing || undefined,
          possessionStatus: possessionStatus || undefined,
          minPrice: minPrice || undefined,
          maxPrice: maxPrice || undefined,
          minArea: minArea || undefined,
          maxArea: maxArea || undefined,
          city: city || undefined,
          sortBy,
          page,
          limit: 12
        };
        const res = await listingsService.getListings(query);
        const fetchedListings = res?.data?.listings || res?.listings || res?.data || [];
        setListings(fetchedListings);
        setTotalCount(res?.data?.pagination?.total || res?.pagination?.total || fetchedListings.length);
        setMobileFiltersOpen(false);
      } catch (err) {
        console.error('Failed to load properties', err);
        setError('Unable to load property listings at this time. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, [
    purpose,
    bhk,
    propertyType,
    furnishing,
    possessionStatus,
    minPrice,
    maxPrice,
    minArea,
    maxArea,
    city,
    sortBy,
    page
  ]);

  // Update filter key in URL query params
  const setFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value && value !== 'all') {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  // Clear all active filters
  const handleClearFilters = () => {
    setSearchParams({});
    setMobileFiltersOpen(false);
  };

  // Count active filters
  const activeFiltersCount = [
    purpose,
    bhk,
    propertyType,
    furnishing,
    possessionStatus,
    minPrice,
    maxPrice,
    minArea,
    maxArea,
    city
  ].filter(Boolean).length;

  const propertyTypes = [
    'Apartment',
    'Independent House',
    'Villa',
    'Penthouse',
    'Plot / Land',
    'Commercial Office',
    'Retail Shop',
    'Warehouse',
    'Farm House'
  ];

  const popularCities = ['All Cities', 'Bengaluru', 'Mumbai', 'Delhi NCR', 'Hyderabad', 'Chennai', 'Pune'];
  const bhkOptions = ['1 BHK', '2 BHK', '3 BHK', '4 BHK', '5+ BHK'];
  const furnishingOptions = ['Fully Furnished', 'Semi Furnished', 'Unfurnished'];
  const statusOptions = ['Ready to Move', 'Under Construction'];

  const budgetPresets = [
    { label: 'Under ₹50 L', min: '', max: '5000000' },
    { label: '₹50 L - ₹1 Cr', min: '5000000', max: '10000000' },
    { label: '₹1 Cr - ₹3 Cr', min: '10000000', max: '30000000' },
    { label: '₹3 Cr+', min: '30000000', max: '' }
  ];

  return (
    <div className="bg-[var(--bg-primary)] text-[var(--text-primary)] min-h-screen py-8 sm:py-10 transition-colors duration-200">
      <Container size="7xl">
        
        {/* Back to Home Navigation */}
        <div className="flex items-center gap-2 mb-4 sm:mb-6">
          <Link
            to={ROUTES.HOME}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-xs sm:text-sm font-bold text-[var(--text-primary)] hover:text-[var(--accent)] shadow-2xs transition-all active:scale-95 cursor-pointer group"
          >
            <span className="text-base group-hover:-translate-x-0.5 transition-transform">&larr;</span>
            <span>Back to Home</span>
          </Link>
        </div>

        {/* ============================================================ */}
        {/* TOP HERO & PROPERTY MARKETPLACE BANNER                       */}
        {/* ============================================================ */}
        <div className="relative mb-8 p-6 sm:p-10 rounded-3xl bg-gradient-to-br from-[var(--bg-surface)] via-[var(--bg-surface)] to-[var(--bg-secondary)] border border-[var(--border-primary)] shadow-sm overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-black uppercase tracking-wider">
                <span>🏢</span>
                <span>Verified Real Estate Marketplace</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[var(--text-primary)] tracking-tight">
                Discover Premium Properties
              </h1>
              <p className="text-sm sm:text-base text-[var(--text-secondary)] max-w-2xl leading-relaxed">
                Browse verified luxury apartments, villas, builder floors, plots, and commercial properties with 100% genuine seller contact details and real map locations.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link
                to={ROUTES.POST_LISTING}
                className="px-5 py-3 rounded-2xl bg-[var(--button-primary)] text-[var(--button-primary-text)] font-bold text-sm hover:bg-[var(--button-primary-hover)] transition-all shadow-md active:scale-95 flex items-center gap-2 select-none cursor-pointer border border-[var(--button-primary)]"
              >
                <span>➕</span>
                <span>Post Property Free</span>
              </Link>
            </div>
          </div>

          {/* Quick Purpose Filter Tabs */}
          <div className="relative z-10 mt-8 pt-6 border-t border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {[
                { label: '🏡 All Properties', value: '' },
                { label: '🔑 For Sale', value: 'sell' },
                { label: '🏢 For Rent', value: 'rent' }
              ].map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setFilter('listingType', tab.value)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer border",
                    purpose === tab.value
                      ? "bg-[var(--button-primary)] text-[var(--button-primary-text)] border-[var(--button-primary)] shadow-xs"
                      : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-[var(--border-primary)] hover:border-[var(--button-primary)] hover:text-[var(--text-primary)]"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Quick City Selector Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
              <span className="text-xs font-bold text-[var(--text-muted)] shrink-0 mr-1">Top Cities:</span>
              {popularCities.map((c) => {
                const isSelected = (!city && c === 'All Cities') || city === c;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setFilter('city', c === 'All Cities' ? '' : c)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer",
                      isSelected
                        ? "bg-[var(--text-primary)] text-[var(--bg-primary)] shadow-2xs"
                        : "bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)]"
                    )}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* CONTROLS TOOLBAR: Active Filters, Layout Switcher & Sort     */}
        {/* ============================================================ */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 bg-[var(--bg-surface)] p-4 rounded-2xl border border-[var(--border-primary)] shadow-2xs">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Mobile Filters Trigger Button */}
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(true)}
              className="lg:hidden flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-xs font-bold text-[var(--text-primary)] transition-colors shadow-2xs cursor-pointer"
            >
              <span>⚡</span>
              <span>Filters {activeFiltersCount > 0 ? `(${activeFiltersCount})` : ''}</span>
            </button>

            <span className="text-xs sm:text-sm font-bold text-[var(--text-secondary)]">
              Showing <span className="text-[var(--text-primary)] font-black">{totalCount}</span> verified properties
            </span>

            {/* Active Filter Badges */}
            {activeFiltersCount > 0 && (
              <div className="hidden md:flex items-center gap-1.5 flex-wrap">
                {purpose && (
                  <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[11px] font-bold">
                    {purpose === 'sell' ? 'For Sale' : 'For Rent'}
                  </span>
                )}
                {bhk && (
                  <span className="px-2.5 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-[11px] font-bold">
                    {bhk}
                  </span>
                )}
                {city && (
                  <span className="px-2.5 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 text-[11px] font-bold">
                    📍 {city}
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="text-[11px] font-bold text-rose-500 hover:underline ml-1 cursor-pointer"
                >
                  Clear All ({activeFiltersCount})
                </button>
              </div>
            )}
          </div>

          {/* View Mode Switcher + Sort */}
          <div className="flex items-center gap-3 self-end sm:self-auto">
            {/* View Mode Toggle: Grid / List / Map */}
            <div className="flex items-center p-1 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-subtle)]">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={cn(
                  "p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1",
                  viewMode === 'grid'
                    ? "bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-2xs"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                )}
                title="Grid View"
              >
                <span>⊞</span>
                <span className="hidden md:inline">Grid</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={cn(
                  "p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1",
                  viewMode === 'list'
                    ? "bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-2xs"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                )}
                title="List View"
              >
                <span>☰</span>
                <span className="hidden md:inline">List</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('map')}
                className={cn(
                  "p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1",
                  viewMode === 'map'
                    ? "bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-2xs"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                )}
                title="Map View"
              >
                <span>🗺️</span>
                <span className="hidden md:inline">Map</span>
              </button>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5">
              <select
                id="sortBy"
                value={sortBy}
                onChange={(e) => setFilter('sortBy', e.target.value)}
                className="px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-xs font-bold text-[var(--text-primary)] cursor-pointer focus:outline-hidden focus:border-[var(--accent)] transition-colors"
              >
                <option value="newest">⚡ Newest Listed</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="popular">⭐ Most Popular</option>
              </select>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* MAIN LAYOUT: Sidebar Filters + Property Listings            */}
        {/* ============================================================ */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* ============================================================ */}
          {/* DESKTOP FILTERS SIDEBAR                                      */}
          {/* ============================================================ */}
          <aside className="hidden lg:block w-72 xl:w-80 shrink-0 bg-[var(--bg-surface)] p-6 rounded-3xl border border-[var(--border-primary)] shadow-xs sticky top-24 space-y-6 text-[var(--text-primary)]">
            <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-2">
                <span className="text-base text-[var(--accent)] font-bold">⚡</span>
                <h2 className="text-sm font-black uppercase tracking-wider text-[var(--text-primary)]">
                  Filter Properties
                </h2>
              </div>
              {activeFiltersCount > 0 && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="text-xs font-bold text-rose-500 hover:underline cursor-pointer"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* 1. Budget Presets & Custom Range */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-2.5">
                Budget (Price Range)
              </h3>
              <div className="grid grid-cols-2 gap-1.5 mb-2.5">
                {budgetPresets.map((b) => (
                  <button
                    key={b.label}
                    type="button"
                    onClick={() => {
                      const newParams = new URLSearchParams(searchParams);
                      if (b.min) newParams.set('minPrice', b.min); else newParams.delete('minPrice');
                      if (b.max) newParams.set('maxPrice', b.max); else newParams.delete('maxPrice');
                      newParams.set('page', '1');
                      setSearchParams(newParams);
                    }}
                    className={cn(
                      "px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition-colors text-center cursor-pointer",
                      minPrice === b.min && maxPrice === b.max
                        ? "bg-[var(--button-primary)] text-[var(--button-primary-text)] border-[var(--button-primary)]"
                        : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:border-[var(--button-primary)]"
                    )}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min Price (₹)"
                  value={minPrice}
                  onChange={(e) => setFilter('minPrice', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-hidden focus:border-[var(--accent)]"
                />
                <input
                  type="number"
                  placeholder="Max Price (₹)"
                  value={maxPrice}
                  onChange={(e) => setFilter('maxPrice', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-hidden focus:border-[var(--accent)]"
                />
              </div>
            </div>

            {/* 2. BHK Bedrooms */}
            <div className="pt-4 border-t border-[var(--border-subtle)]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-2.5">
                Bedrooms (BHK)
              </h3>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setFilter('bhk', '')}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer',
                    !bhk
                      ? 'bg-[var(--button-primary)] text-[var(--button-primary-text)] border-[var(--button-primary)] shadow-xs'
                      : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border-primary)] hover:border-[var(--button-primary)]'
                  )}
                >
                  All
                </button>
                {bhkOptions.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setFilter('bhk', bhk === item ? '' : item)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer',
                      bhk === item
                        ? 'bg-[var(--button-primary)] text-[var(--button-primary-text)] border-[var(--button-primary)] shadow-xs'
                        : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border-primary)] hover:border-[var(--button-primary)]'
                    )}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Property Type */}
            <div className="pt-4 border-t border-[var(--border-subtle)]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-2.5">
                Property Type
              </h3>
              <select
                value={propertyType}
                onChange={(e) => setFilter('propertyType', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-xs font-bold text-[var(--text-primary)] cursor-pointer focus:outline-hidden focus:border-[var(--accent)]"
              >
                <option value="">All Types (Villas, Flats, Plots...)</option>
                {propertyTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* 4. Furnishing */}
            <div className="pt-4 border-t border-[var(--border-subtle)]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-2.5">
                Furnishing Status
              </h3>
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer">
                  <input
                    type="radio"
                    name="furnishing"
                    checked={!furnishing}
                    onChange={() => setFilter('furnishing', '')}
                    className="accent-[var(--accent)]"
                  />
                  <span>Any Furnishing</span>
                </label>
                {furnishingOptions.map((opt) => (
                  <label key={opt} className="flex items-center gap-2 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer">
                    <input
                      type="radio"
                      name="furnishing"
                      checked={furnishing === opt}
                      onChange={() => setFilter('furnishing', opt)}
                      className="accent-[var(--accent)]"
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 5. Possession Status */}
            <div className="pt-4 border-t border-[var(--border-subtle)]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-2.5">
                Possession Status
              </h3>
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer">
                  <input
                    type="radio"
                    name="possessionStatus"
                    checked={!possessionStatus}
                    onChange={() => setFilter('possessionStatus', '')}
                    className="accent-[var(--accent)]"
                  />
                  <span>All Statuses</span>
                </label>
                {statusOptions.map((status) => (
                  <label key={status} className="flex items-center gap-2 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer">
                    <input
                      type="radio"
                      name="possessionStatus"
                      checked={possessionStatus === status}
                      onChange={() => setFilter('possessionStatus', status)}
                      className="accent-[var(--accent)]"
                    />
                    <span>{status}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 6. Area (sq.ft) */}
            <div className="pt-4 border-t border-[var(--border-subtle)]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-2.5">
                Area (sq.ft)
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min sq.ft"
                  value={minArea}
                  onChange={(e) => setFilter('minArea', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-hidden focus:border-[var(--accent)]"
                />
                <input
                  type="number"
                  placeholder="Max sq.ft"
                  value={maxArea}
                  onChange={(e) => setFilter('maxArea', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-hidden focus:border-[var(--accent)]"
                />
              </div>
            </div>

            {/* Reset Button */}
            <div className="pt-4 border-t border-[var(--border-subtle)]">
              <button
                type="button"
                onClick={handleClearFilters}
                className="w-full py-2.5 px-4 rounded-xl border border-[var(--border-primary)] text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          </aside>

          {/* ============================================================ */}
          {/* MAIN PROPERTY LISTINGS AREA                                  */}
          {/* ============================================================ */}
          <main className="flex-1 w-full min-w-0">
            {/* Interactive Map View */}
            {viewMode === 'map' && listings.length > 0 && (
              <div className="mb-8 bg-[var(--bg-surface)] p-5 rounded-3xl border border-[var(--border-primary)] shadow-md space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🗺️</span>
                    <h3 className="font-bold text-sm text-[var(--text-primary)]">Interactive Map Exploration</h3>
                  </div>
                  <span className="text-xs text-[var(--text-muted)]">{listings.length} properties plotted</span>
                </div>

                <div className="h-[380px] rounded-2xl overflow-hidden border border-[var(--border-subtle)]">
                  {/* Render map based on the first listing with coordinates or city */}
                  {(() => {
                    const firstWithCoords = listings.find(l => l.location?.latitude && l.location?.longitude) || listings[0];
                    return (
                      <RealMapLocation 
                        location={firstWithCoords?.location || { city: city || 'Bengaluru', country: 'India' }} 
                        title="Properties in this region"
                        height="380px"
                      />
                    );
                  })()}
                </div>
              </div>
            )}

            {loading ? (
              <div className="py-24 flex flex-col items-center justify-center gap-3">
                <Loader size="lg" />
                <span className="text-sm font-bold text-[var(--text-secondary)]">Loading verified properties...</span>
              </div>
            ) : error ? (
              <div className="p-8 bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-3xl text-center text-[var(--error)] font-bold">
                {error}
              </div>
            ) : listings.length === 0 ? (
              <div className="p-12 sm:p-16 bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-3xl text-center space-y-4 shadow-xs">
                <div className="text-5xl">🏢</div>
                <h3 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">
                  No Properties Found
                </h3>
                <p className="text-[14px] sm:text-[15px] text-[var(--text-secondary)] max-w-md mx-auto">
                  We couldn't find any properties matching your current filter criteria. Try expanding your budget, changing BHK, or resetting filters.
                </p>
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="px-6 py-2.5 bg-[var(--button-primary)] text-[var(--button-primary-text)] font-bold text-xs rounded-xl shadow-xs border border-[var(--button-primary)] cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className={cn(
                viewMode === 'list' 
                  ? "flex flex-col gap-6" 
                  : "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
              )}>
                {listings.map((item) => (
                  <PropertyCard 
                    key={item._id} 
                    {...item} 
                    viewMode={viewMode}
                  />
                ))}
              </div>
            )}
          </main>

        </div>

        {/* ============================================================ */}
        {/* MOBILE FILTERS DRAWER (Bottom Sheet / Modal)                 */}
        {/* ============================================================ */}
        {mobileFiltersOpen && (
          <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in"
              onClick={() => setMobileFiltersOpen(false)}
              aria-hidden="true"
            />

            <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
              <div className="w-screen max-w-md bg-[var(--bg-surface)] border-l border-[var(--border-primary)] shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out text-[var(--text-primary)]">
                
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
                  <div className="flex items-center gap-2">
                    <span className="text-base text-[var(--accent)] font-bold">⚡</span>
                    <h2 className="text-lg font-black text-[var(--text-primary)]">Filter Properties</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMobileFiltersOpen(false)}
                    aria-label="Close filters"
                    className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {/* Purpose */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-2.5">
                      Property Purpose
                    </h3>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: 'All', value: '' },
                        { label: 'For Sale', value: 'sell' },
                        { label: 'For Rent', value: 'rent' }
                      ].map((p) => (
                        <button
                          key={p.value}
                          type="button"
                          onClick={() => setFilter('listingType', p.value)}
                          className={cn(
                            'py-2.5 text-xs font-bold rounded-xl border transition-all text-center min-h-[44px]',
                            purpose === p.value
                              ? 'bg-[var(--button-primary)] text-[var(--button-primary-text)] border-[var(--button-primary)] shadow-xs'
                              : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-[var(--border-primary)]'
                          )}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* BHK */}
                  <div className="pt-4 border-t border-[var(--border-subtle)]">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-2.5">
                      Bedrooms (BHK)
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setFilter('bhk', '')}
                        className={cn(
                          'px-4 py-2 rounded-xl text-xs font-bold border min-h-[44px]',
                          !bhk
                            ? 'bg-[var(--button-primary)] text-[var(--button-primary-text)] border-[var(--button-primary)]'
                            : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-[var(--border-primary)]'
                        )}
                      >
                        All
                      </button>
                      {bhkOptions.map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => setFilter('bhk', bhk === item ? '' : item)}
                          className={cn(
                            'px-4 py-2 rounded-xl text-xs font-bold border min-h-[44px]',
                            bhk === item
                              ? 'bg-[var(--button-primary)] text-[var(--button-primary-text)] border-[var(--button-primary)]'
                              : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-[var(--border-primary)]'
                          )}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Property Type */}
                  <div className="pt-4 border-t border-[var(--border-subtle)]">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-2.5">
                      Property Type
                    </h3>
                    <select
                      value={propertyType}
                      onChange={(e) => setFilter('propertyType', e.target.value)}
                      className="w-full px-3.5 py-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-sm font-bold text-[var(--text-primary)] min-h-[44px]"
                    >
                      <option value="">All Property Types</option>
                      {propertyTypes.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  {/* Budget */}
                  <div className="pt-4 border-t border-[var(--border-subtle)]">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-2.5">
                      Budget (Price Range)
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        placeholder="Min Price (₹)"
                        value={minPrice}
                        onChange={(e) => setFilter('minPrice', e.target.value)}
                        className="w-full px-3.5 py-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] min-h-[44px]"
                      />
                      <input
                        type="number"
                        placeholder="Max Price (₹)"
                        value={maxPrice}
                        onChange={(e) => setFilter('maxPrice', e.target.value)}
                        className="w-full px-3.5 py-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] min-h-[44px]"
                      />
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)] flex gap-3">
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="flex-1 py-3 px-4 rounded-xl border border-[var(--border-primary)] text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors min-h-[44px]"
                  >
                    Reset
                  </button>
                  <button
                    type="button"
                    onClick={() => setMobileFiltersOpen(false)}
                    className="flex-2 py-3 px-4 rounded-xl bg-[var(--button-primary)] text-[var(--button-primary-text)] font-bold text-xs shadow-xs min-h-[44px]"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </Container>
    </div>
  );
};

export default Properties;
