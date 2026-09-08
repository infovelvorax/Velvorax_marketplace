import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Container } from '../../components/common/Container';
import { ListingCard } from '../../components/listing/ListingCard';
import { RealMapLocation } from '../../components/common/RealMapLocation/RealMapLocation';
import { Loader } from '../../components/common/Loader';
import { EmptyState } from '../../components/common/EmptyState';
import { listingsService } from '../../services/api/listings.service';
import { ROUTES } from '../../constants';
import { cn } from '../../utils';

export const FreeGiveaways = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list' | 'map'

  // URL Filters
  const category = searchParams.get('category') || '';
  const subcategory = searchParams.get('subcategory') || '';
  const condition = searchParams.get('condition') || '';
  const city = searchParams.get('city') || '';
  const sortBy = searchParams.get('sortBy') || 'newest';
  const page = parseInt(searchParams.get('page'), 10) || 1;

  useEffect(() => {
    const fetchFree = async () => {
      setLoading(true);
      setError(null);
      try {
        const query = {
          listingType: 'free',
          category: category || undefined,
          subcategory: subcategory || undefined,
          condition: condition || undefined,
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
        console.error('Failed to load free giveaways', err);
        setError('Unable to load free community listings at this time.');
      } finally {
        setLoading(false);
      }
    };
    fetchFree();
  }, [
    category,
    subcategory,
    condition,
    city,
    sortBy,
    page
  ]);

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

  const handleClearFilters = () => {
    setSearchParams({ listingType: 'free' });
    setMobileFiltersOpen(false);
  };

  const activeFiltersCount = [
    category,
    subcategory,
    condition,
    city
  ].filter(Boolean).length;

  const giveawayCategories = [
    { label: '🛋️ Furniture & Home Decor', value: 'furniture' },
    { label: '📚 Books, Notes & Study Material', value: 'books' },
    { label: '👕 Clothes, Winter Wear & Shoes', value: 'fashion' },
    { label: '📱 Electronics & Gadgets', value: 'products' },
    { label: '🧸 Baby Gear & Kids Toys', value: 'kids' },
    { label: '🐾 Pet Adoption & Animal Care', value: 'pets' },
    { label: '🍳 Kitchen Utensils & Appliances', value: 'kitchen' }
  ];

  const conditionOptions = [
    { label: 'Unused / Brand New', value: 'NEW' },
    { label: 'Like New / Mint', value: 'LIKE_NEW' },
    { label: 'Gently Used / Functional', value: 'USED' }
  ];

  const popularCities = ['All Cities', 'Bengaluru', 'Mumbai', 'Delhi NCR', 'Hyderabad', 'Chennai', 'Pune'];

  const renderFilterContent = () => (
    <div className="space-y-6">
      {/* Category */}
      <div>
        <label className="text-xs font-black text-[var(--text-primary)] uppercase tracking-wider block mb-3">
          Giveaway Category
        </label>
        <div className="space-y-1.5">
          <button
            type="button"
            onClick={() => setFilter('category', '')}
            className={cn(
              "w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer",
              !category
                ? "bg-[var(--button-primary)] text-[var(--button-primary-text)] shadow-xs"
                : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            )}
          >
            <span>🎁 All Free Items</span>
          </button>
          {giveawayCategories.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setFilter('category', c.value)}
              className={cn(
                "w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer truncate",
                category === c.value
                  ? "bg-[var(--button-primary)] text-[var(--button-primary-text)] shadow-xs"
                  : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              )}
            >
              <span className="truncate">{c.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Item Condition */}
      <div className="pt-4 border-t border-[var(--border-subtle)]">
        <label className="text-xs font-black text-[var(--text-primary)] uppercase tracking-wider block mb-3">
          Item Condition
        </label>
        <div className="space-y-1.5">
          {conditionOptions.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setFilter('condition', condition === c.value ? '' : c.value)}
              className={cn(
                "w-full text-left px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer",
                condition === c.value
                  ? "bg-[var(--button-primary)] text-[var(--button-primary-text)]"
                  : "text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]"
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Reset Button */}
      <div className="pt-4 border-t border-[var(--border-subtle)]">
        <button
          type="button"
          onClick={handleClearFilters}
          className="w-full py-2.5 rounded-xl border border-[var(--border-primary)] text-xs font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer"
        >
          Reset All Filters
        </button>
      </div>
    </div>
  );

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
        {/* TOP HERO BANNER & FREE GIVEAWAYS PORTAL                      */}
        {/* ============================================================ */}
        <div className="relative mb-8 p-6 sm:p-10 rounded-3xl bg-gradient-to-br from-[var(--bg-surface)] via-[var(--bg-surface)] to-[var(--bg-secondary)] border border-[var(--border-primary)] shadow-sm overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-black uppercase tracking-wider">
                <span>🎁</span>
                <span>100% Free Community Sharing & Donations</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[var(--text-primary)] tracking-tight">
                Free Community Giveaways & Donations
              </h1>
              <p className="text-sm sm:text-base text-[var(--text-secondary)] max-w-2xl leading-relaxed">
                Give reusable items a second life or claim 100% free furniture, books, clothing, baby supplies, electronics, and pet adoptions from compassionate community members.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link
                to={ROUTES.POST_LISTING}
                className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all shadow-md active:scale-95 flex items-center gap-2 select-none cursor-pointer border border-emerald-500"
              >
                <span>🎁</span>
                <span>Donate an Item Free</span>
              </Link>
            </div>
          </div>

          {/* Quick Purpose Tabs */}
          <div className="relative z-10 mt-8 pt-6 border-t border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {[
                { label: '🎁 All Free Items', value: '' },
                { label: '🛋️ Free Furniture', value: 'furniture' },
                { label: '📚 Books & Study', value: 'books' },
                { label: '👕 Clothes & Shoes', value: 'fashion' },
                { label: '📱 Free Tech', value: 'products' },
                { label: '🐾 Pet Adoption', value: 'pets' }
              ].map((tab) => (
                <button
                  key={tab.label}
                  type="button"
                  onClick={() => setFilter('category', tab.value)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer border",
                    category === tab.value
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                      : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-[var(--border-primary)] hover:border-emerald-500 hover:text-[var(--text-primary)]"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Quick City Pills */}
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
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(true)}
              className="lg:hidden flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-xs font-bold text-[var(--text-primary)] transition-colors shadow-2xs cursor-pointer"
            >
              <span>⚡</span>
              <span>Filters {activeFiltersCount > 0 ? `(${activeFiltersCount})` : ''}</span>
            </button>

            <span className="text-xs sm:text-sm font-bold text-[var(--text-secondary)]">
              Showing <span className="text-[var(--text-primary)] font-black">{totalCount}</span> free community listings
            </span>

            {/* Active Filter Badges */}
            {activeFiltersCount > 0 && (
              <div className="hidden md:flex items-center gap-1.5 flex-wrap">
                {category && (
                  <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[11px] font-bold uppercase">
                    {category}
                  </span>
                )}
                {city && (
                  <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-[11px] font-bold">
                    📍 {city}
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="text-xs text-[var(--accent)] font-black hover:underline cursor-pointer ml-1"
                >
                  Clear All
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3">
            {/* View Mode Switcher */}
            <div className="flex items-center bg-[var(--bg-secondary)] p-1 rounded-xl border border-[var(--border-primary)]">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={cn(
                  "p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                  viewMode === 'grid'
                    ? "bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-2xs"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                )}
                title="Grid View"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={cn(
                  "p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                  viewMode === 'list'
                    ? "bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-2xs"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                )}
                title="List View"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('map')}
                className={cn(
                  "p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                  viewMode === 'map'
                    ? "bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-2xs"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                )}
                title="Map View"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </button>
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setFilter('sortBy', e.target.value)}
              className="px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl text-xs font-bold text-[var(--text-primary)] outline-none cursor-pointer focus:border-[var(--accent)]"
            >
              <option value="newest">Newest First</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>
        </div>

        {/* Map View Mode Split Screen */}
        {viewMode === 'map' && (
          <div className="mb-8 rounded-3xl overflow-hidden border border-[var(--border-primary)] shadow-md bg-[var(--bg-surface)] p-2">
            <RealMapLocation
              city={city || 'Bengaluru'}
              address={`${city || 'All Cities'}, Community Giveaway Pickups`}
              title="Explore Free Giveaways on Map"
              interactive={true}
              height="380px"
            />
          </div>
        )}

        {/* ============================================================ */}
        {/* MAIN BODY: Sticky Left Filters + Listings Feed              */}
        {/* ============================================================ */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block w-72 shrink-0 bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-3xl p-6 shadow-xs sticky top-24">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[var(--border-subtle)]">
              <span className="text-sm font-black text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-2">
                <span>⚡</span>
                <span>Filters</span>
              </span>
              {activeFiltersCount > 0 && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="text-xs text-[var(--accent)] font-bold hover:underline cursor-pointer"
                >
                  Reset ({activeFiltersCount})
                </button>
              )}
            </div>

            {renderFilterContent()}
          </aside>

          {/* Listings Feed */}
          <main className="flex-1 w-full min-w-0">
            {loading ? (
              <div className="py-28 flex flex-col items-center justify-center gap-3">
                <Loader size="lg" />
                <span className="text-xs font-bold text-[var(--text-muted)] animate-pulse">Loading free community items...</span>
              </div>
            ) : error ? (
              <div className="p-8 text-center bg-[var(--bg-surface)] rounded-3xl border border-rose-500/20 text-rose-500">
                <p className="font-bold text-sm mb-3">{error}</p>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-rose-500 text-white rounded-xl text-xs font-bold hover:bg-rose-600 transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : listings.length === 0 ? (
              <EmptyState
                title="No free giveaways found matching criteria"
                description="Be the first kind community member to donate something in this category!"
                action={
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-xs hover:bg-emerald-700 transition-all cursor-pointer"
                  >
                    Clear All Filters
                  </button>
                }
              />
            ) : (
              <div className={cn(
                viewMode === 'list'
                  ? "flex flex-col gap-5"
                  : "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
              )}>
                {listings.map((item) => (
                  <ListingCard
                    key={item._id}
                    {...item}
                    listingType="FREE"
                    categorySlug={item.category?.slug || item.categorySlug || 'products'}
                    viewMode={viewMode}
                  />
                ))}
              </div>
            )}
          </main>
        </div>

        {/* Mobile Filter Drawer Modal */}
        {mobileFiltersOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex justify-end" role="dialog" aria-modal="true">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in"
              onClick={() => setMobileFiltersOpen(false)}
            />
            <div className="relative w-full max-w-sm bg-[var(--bg-surface)] h-full overflow-y-auto z-10 p-6 shadow-2xl flex flex-col justify-between animate-slide-left">
              <div>
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-[var(--border-subtle)]">
                  <span className="text-base font-black text-[var(--text-primary)]">Filter Free Items</span>
                  <button
                    type="button"
                    onClick={() => setMobileFiltersOpen(false)}
                    className="p-2 rounded-xl bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  >
                    ✕
                  </button>
                </div>
                {renderFilterContent()}
              </div>

              <div className="pt-6 mt-6 border-t border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(false)}
                  className="w-full py-3 rounded-2xl bg-emerald-600 text-white font-bold text-sm shadow-md"
                >
                  Apply Filters ({totalCount} Results)
                </button>
              </div>
            </div>
          </div>
        )}

      </Container>
    </div>
  );
};

export default FreeGiveaways;
