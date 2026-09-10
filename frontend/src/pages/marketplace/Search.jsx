import './Search.css';
import React, { useState, useEffect, useRef, useTransition } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { listingsService } from '../../services/api/listings.service';
import { categoryService } from '../../services/api/category.service';
import { useLocationContext } from '../../context/LocationContext';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { Container } from '../../components/common/Container';
import { ListingCard } from '../../components/listing/ListingCard';
import { LocationSelector } from '../../components/common/LocationSelector';
import { Loader } from '../../components/common/Loader';
import { ROUTES } from '../../constants';
import { cn } from '../../utils';

export const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const { selectedLocation, setCity, locations, popularCities } = useLocationContext();
  const [isPending, startTransition] = useTransition();

  // Read all filter params from URL (Single source of truth)
  const q = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || '';
  const subcategoryParam = searchParams.get('subcategory') || '';
  const listingTypeParam = searchParams.get('listingType') || '';
  const countryParam = searchParams.get('country') || '';
  const regionParam = searchParams.get('region') || searchParams.get('state') || '';
  const cityParam = searchParams.get('city') || '';
  const localAreaParam = searchParams.get('localArea') || '';
  const minPriceParam = searchParams.get('minPrice') || '';
  const maxPriceParam = searchParams.get('maxPrice') || '';
  const conditionParam = searchParams.get('condition') || '';
  const datePostedParam = searchParams.get('datePosted') || '';
  const distanceParam = searchParams.get('distance') || '';
  const latParam = searchParams.get('lat') || searchParams.get('latitude') || '';
  const lngParam = searchParams.get('lng') || searchParams.get('longitude') || '';
  const sortByParam = searchParams.get('sortBy') || 'newest';
  const pageParam = parseInt(searchParams.get('page'), 10) || 1;

  // Category-specific parameters from URL
  const bedroomsParam = searchParams.get('bedrooms') || searchParams.get('bhk') || '';
  const propertyTypeParam = searchParams.get('propertyType') || '';
  const furnishingParam = searchParams.get('furnishing') || '';
  const brandParam = searchParams.get('brand') || '';
  const modelParam = searchParams.get('model') || '';
  const fuelParam = searchParams.get('fuel') || '';
  const transmissionParam = searchParams.get('transmission') || '';
  const jobTypeParam = searchParams.get('jobType') || '';
  const workModeParam = searchParams.get('workMode') || '';

  // Local UI State
  const [categories, setCategories] = useState([]);
  const [listings, setListings] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 12, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search input & auto-suggestions
  const [searchInput, setSearchInput] = useState(q);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Mobile drawer state
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Location modal & saved searches
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [savedSearchTitle, setSavedSearchTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Price inputs local state for smooth typing before submit
  const [localMinPrice, setLocalMinPrice] = useState(minPriceParam);
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPriceParam);

  const searchInputRef = useRef(null);
  const suggestionsBoxRef = useRef(null);

  // Sync search input with URL query param if URL changes externally
  useEffect(() => {
    setSearchInput(q);
    setLocalMinPrice(minPriceParam);
    setLocalMaxPrice(maxPriceParam);
  }, [q, minPriceParam, maxPriceParam]);

  // Load Categories on mount
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const data = await categoryService.getCategories();
        setCategories(data || []);
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    };
    fetchCats();
  }, []);

  // Click outside to close suggestion dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        suggestionsBoxRef.current && !suggestionsBoxRef.current.contains(e.target) &&
        searchInputRef.current && !searchInputRef.current.contains(e.target)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch Listings whenever URL Search Parameters Change
  useEffect(() => {
    let isCancelled = false;

    const fetchFilteredListings = async () => {
      setLoading(true);
      setError(null);

      try {
        const query = {
          q: q || undefined,
          category: categoryParam || undefined,
          subcategory: subcategoryParam || undefined,
          listingType: listingTypeParam || undefined,
          country: countryParam || undefined,
          region: regionParam || undefined,
          city: cityParam || undefined,
          localArea: localAreaParam || undefined,
          minPrice: minPriceParam || undefined,
          maxPrice: maxPriceParam || undefined,
          condition: conditionParam || undefined,
          datePosted: datePostedParam || undefined,
          distance: distanceParam || undefined,
          latitude: latParam || undefined,
          longitude: lngParam || undefined,
          bedrooms: bedroomsParam || undefined,
          propertyType: propertyTypeParam || undefined,
          furnishing: furnishingParam || undefined,
          brand: brandParam || undefined,
          model: modelParam || undefined,
          fuel: fuelParam || undefined,
          transmission: transmissionParam || undefined,
          jobType: jobTypeParam || undefined,
          workMode: workModeParam || undefined,
          sortBy: sortByParam || 'newest',
          page: pageParam,
          limit: 12,
        };

        const res = await listingsService.getListings(query);

        if (!isCancelled) {
          const items = Array.isArray(res?.data)
            ? res.data
            : (res?.data?.listings || res?.listings || (Array.isArray(res) ? res : []));
          const pag = res?.pagination || res?.data?.pagination || {
            total: items.length,
            page: pageParam,
            limit: 12,
            totalPages: Math.max(1, Math.ceil((items.length || 1) / 12)),
            hasNextPage: pageParam < Math.ceil((items.length || 1) / 12),
            hasPrevPage: pageParam > 1
          };
          setListings(items);
          setPagination(pag);
          setShowSuggestions(false);
          setIsMobileDrawerOpen(false);
        }
      } catch (err) {
        if (!isCancelled) {
          console.error('Error fetching search results:', err);
          setError('Failed to load marketplace listings. Please try again.');
        }
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };

    startTransition(() => {
      fetchFilteredListings();
    });

    return () => {
      isCancelled = true;
    };
  }, [
    q,
    categoryParam,
    subcategoryParam,
    listingTypeParam,
    countryParam,
    regionParam,
    cityParam,
    localAreaParam,
    minPriceParam,
    maxPriceParam,
    conditionParam,
    datePostedParam,
    distanceParam,
    latParam,
    lngParam,
    bedroomsParam,
    propertyTypeParam,
    furnishingParam,
    brandParam,
    modelParam,
    fuelParam,
    transmissionParam,
    jobTypeParam,
    workModeParam,
    sortByParam,
    pageParam
  ]);

  // Debounced Auto-suggestions
  useEffect(() => {
    if (!searchInput || searchInput.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await listingsService.getSuggestions(searchInput.trim());
        if (res?.suggestions) {
          setSuggestions(res.suggestions);
        }
      } catch (e) {
        console.error('Failed to get suggestions:', e);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Handle URL Parameter Updates
  const updateParam = (key, value) => {
    const nextParams = new URLSearchParams(searchParams);
    if (value !== undefined && value !== null && value !== '') {
      nextParams.set(key, value);
    } else {
      nextParams.delete(key);
    }
    // Always reset page to 1 when any filter changes except page itself
    if (key !== 'page') {
      nextParams.set('page', '1');
    }
    setSearchParams(nextParams);
  };

  const updateParams = (updates) => {
    const nextParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        nextParams.set(k, v);
      } else {
        nextParams.delete(k);
      }
    });
    if (!updates.page) {
      nextParams.set('page', '1');
    }
    setSearchParams(nextParams);
  };

  const clearAllFilters = () => {
    setSearchInput('');
    setLocalMinPrice('');
    setLocalMaxPrice('');
    setSearchParams(new URLSearchParams());
  };

  // Submit search from main input
  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    setShowSuggestions(false);
    setIsMobileDrawerOpen(false);
    if (searchInputRef.current) searchInputRef.current.blur();
    updateParam('q', searchInput.trim());
  };

  const handleSelectSuggestion = (item) => {
    setSearchInput(item.title);
    setShowSuggestions(false);
    setIsMobileDrawerOpen(false);
    if (searchInputRef.current) searchInputRef.current.blur();
    updateParams({
      q: item.title,
      category: item.category ? item.category.toLowerCase() : categoryParam,
      city: item.city || cityParam
    });
  };

  // Price range submission
  const handlePriceApply = (e) => {
    e.preventDefault();
    setShowSuggestions(false);
    setIsMobileDrawerOpen(false);
    updateParams({
      minPrice: localMinPrice || '',
      maxPrice: localMaxPrice || '',
    });
  };

  // Geolocation Near Me trigger
  const handleNearMe = () => {
    if (!navigator.geolocation) {
      showToast('error', 'Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        updateParams({
          lat: pos.coords.latitude.toFixed(4),
          lng: pos.coords.longitude.toFixed(4),
          distance: '25',
          city: '',
          region: '',
          country: ''
        });
        showToast('success', 'Found listings within 25km of your current location.');
      },
      (err) => {
        showToast('error', 'Unable to retrieve your location. Please check browser permissions.');
      }
    );
  };

  // Save Search Alert
  const handleSaveSearch = async () => {
    if (!isAuthenticated) {
      showToast('info', 'Please sign in to save search alerts');
      return;
    }
    setIsSaving(true);
    try {
      showToast('success', 'Search alert saved! You will receive notifications when new matching items are listed.');
      setShowSaveModal(false);
    } catch (err) {
      showToast('error', 'Failed to save search alert');
    } finally {
      setIsSaving(false);
    }
  };

  // Active Category Object
  const selectedCatObj = categories.find(c => c.slug === categoryParam);

  // Active filter badges list calculation
  const getActiveFilters = () => {
    const list = [];
    if (q) list.push({ key: 'q', label: `Keyword: "${q}"` });
    if (categoryParam) list.push({ key: 'category', label: `Category: ${selectedCatObj?.name || categoryParam}` });
    if (subcategoryParam) list.push({ key: 'subcategory', label: `Subcategory: ${subcategoryParam}` });
    if (listingTypeParam) list.push({ key: 'listingType', label: `Type: ${listingTypeParam.toUpperCase()}` });
    if (cityParam) list.push({ key: 'city', label: `City: ${cityParam}` });
    else if (countryParam) list.push({ key: 'country', label: `Country: ${countryParam}` });
    if (minPriceParam || maxPriceParam) list.push({ key: 'price', label: `Price: ${minPriceParam || '0'} - ${maxPriceParam || 'Max'}` });
    if (conditionParam) list.push({ key: 'condition', label: `Condition: ${conditionParam}` });
    if (distanceParam) list.push({ key: 'distance', label: `Within ${distanceParam}km` });
    if (bedroomsParam) list.push({ key: 'bedrooms', label: `BHK: ${bedroomsParam}` });
    if (brandParam) list.push({ key: 'brand', label: `Brand: ${brandParam}` });
    if (fuelParam) list.push({ key: 'fuel', label: `Fuel: ${fuelParam}` });
    if (jobTypeParam) list.push({ key: 'jobType', label: `Job: ${jobTypeParam}` });
    return list;
  };

  const activeFiltersList = getActiveFilters();

  // Filter Schema Renderer
  const renderFilterControls = () => (
    <div className="space-y-6 text-[var(--text-primary)]">
      
      {/* 1. Category & Subcategory */}
      <div>
        <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider mb-3.5 flex items-center justify-between">
          <span>Categories</span>
          {categoryParam && (
            <button onClick={() => updateParam('category', '')} className="text-[11px] text-[var(--accent)] underline cursor-pointer">
              All
            </button>
          )}
        </h3>
        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1 filter-scrollbar">
          <button
            type="button"
            onClick={() => updateParams({ category: '', subcategory: '' })}
            className={cn(
              "w-full text-left px-3.5 py-2.5 rounded-xl text-[14px] flex items-center justify-between transition-colors font-medium cursor-pointer",
              !categoryParam ? "bg-[var(--button-primary)] text-[var(--button-primary-text)] font-bold shadow-xs border border-[var(--button-primary)]" : "text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
            )}
          >
            <span>All Categories</span>
          </button>
          {categories.map((c) => (
            <button
              key={c.slug}
              type="button"
              onClick={() => updateParams({ category: c.slug, subcategory: '' })}
              className={cn(
                "w-full text-left px-3.5 py-2.5 rounded-xl text-[14px] flex items-center justify-between transition-colors font-medium cursor-pointer",
                categoryParam === c.slug ? "bg-[var(--button-primary)] text-[var(--button-primary-text)] font-bold shadow-xs border border-[var(--button-primary)]" : "text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
              )}
            >
              <span className="truncate">{c.name}</span>
              {categoryParam === c.slug && <span className="text-xs">✓</span>}
            </button>
          ))}
        </div>

        {/* Dynamic Subcategories when category selected */}
        {selectedCatObj?.subcategories?.length > 0 && (
          <div className="mt-4 pt-3.5 border-t border-[var(--border-subtle)]">
            <h4 className="text-[12px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2.5">
              {selectedCatObj.name} Subcategories
            </h4>
            <div className="space-y-1 max-h-40 overflow-y-auto pr-1 filter-scrollbar">
              <button
                type="button"
                onClick={() => updateParam('subcategory', '')}
                className={cn(
                  "w-full text-left px-3 py-1.5 rounded-lg text-[13px] transition-colors cursor-pointer font-bold",
                  !subcategoryParam ? "text-[var(--accent)]" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                )}
              >
                All {selectedCatObj.name}
              </button>
              {selectedCatObj.subcategories.map((sub) => (
                <button
                  key={sub.slug}
                  type="button"
                  onClick={() => updateParam('subcategory', sub.name)}
                  className={cn(
                    "w-full text-left px-3 py-1.5 rounded-lg text-[13px] transition-colors truncate cursor-pointer",
                    subcategoryParam === sub.name ? "bg-[var(--bg-secondary)] text-[var(--accent)] font-bold" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  )}
                >
                  {sub.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 2. Listing Purpose / Type */}
      <div className="pt-4 border-t border-[var(--border-subtle)]">
        <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider mb-3">Listing Purpose</h3>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'All', value: '' },
            { label: 'Sell', value: 'sell' },
            { label: 'Rent', value: 'rent' },
            { label: 'Exchange', value: 'exchange' },
            { label: 'Free', value: 'free' }
          ].map(t => (
            <button
              key={t.value}
              type="button"
              onClick={() => updateParam('listingType', t.value)}
              className={cn(
                "py-2 px-3 rounded-xl text-[13px] font-bold text-center border transition-all cursor-pointer",
                ((listingTypeParam || '').toLowerCase() === t.value) || (!listingTypeParam && t.value === '')
                  ? "bg-[var(--button-primary)] border-[var(--button-primary)] text-[var(--button-primary-text)] shadow-xs"
                  : "bg-[var(--bg-surface)] border-[var(--border-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--button-primary)]"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Location Filter */}
      <div className="pt-4 border-t border-[var(--border-subtle)]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">Location</h3>
          <button 
            type="button" 
            onClick={() => setShowLocationPicker(true)}
            className="text-[12px] text-[var(--accent)] font-bold hover:underline cursor-pointer"
          >
            Change Location
          </button>
        </div>

        {cityParam ? (
          <div className="flex items-center justify-between p-3 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl text-[13px] text-[var(--text-primary)]">
            <div className="flex items-center gap-2 truncate">
              <span className="text-[var(--accent)]">📍</span>
              <span className="font-bold truncate">{cityParam}</span>
            </div>
            <button 
              onClick={() => updateParams({ city: '', region: '', country: '' })} 
              className="text-[var(--text-muted)] hover:text-[var(--error)] text-xs px-1 cursor-pointer font-bold"
            >
              ✕
            </button>
          </div>
        ) : (
          <div className="space-y-1.5">
            <button
              type="button"
              onClick={() => setShowLocationPicker(true)}
              className="w-full text-left p-3 bg-[var(--bg-secondary)] border border-[var(--border-primary)] hover:border-[var(--button-primary)] rounded-xl text-[13px] text-[var(--text-secondary)] flex items-center justify-between cursor-pointer"
            >
              <span>{selectedLocation.city ? `${selectedLocation.city} (Active)` : 'Worldwide'}</span>
              <span className="text-[11px] text-[var(--accent)] font-bold">Select</span>
            </button>
          </div>
        )}

        {/* Distance / Near Me */}
        <div className="mt-4 pt-3.5 border-t border-[var(--border-subtle)] space-y-2.5">
          <div className="flex items-center justify-between text-[13px]">
            <span className="text-[var(--text-secondary)]">Radius Search:</span>
            <button
              type="button"
              onClick={handleNearMe}
              className="text-[12px] text-[var(--accent)] font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>🎯 Near Me</span>
            </button>
          </div>

          <div className="flex gap-1.5">
            {['5', '10', '25', '50', '100'].map(d => (
              <button
                key={d}
                type="button"
                onClick={() => updateParams({ distance: distanceParam === d ? '' : d, lat: latParam || '12.9716', lng: lngParam || '77.5946' })}
                className={cn(
                  "flex-1 py-1.5 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer",
                  distanceParam === d ? "bg-[var(--button-primary)] text-[var(--button-primary-text)] border-[var(--button-primary)]" : "bg-[var(--bg-surface)] border-[var(--border-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                )}
              >
                {d}km
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Price Range */}
      <div className="pt-4 border-t border-[var(--border-subtle)]">
        <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider mb-3">
          Price Range ({selectedLocation.currencySymbol || '$'})
        </h3>
        <form onSubmit={handlePriceApply} className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs text-[var(--text-muted)] font-bold">{selectedLocation.currencySymbol || '$'}</span>
              <input
                type="number"
                placeholder="Min"
                value={localMinPrice}
                onChange={(e) => setLocalMinPrice(e.target.value)}
                className="w-full bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-xl pl-7 pr-2.5 py-2 text-[13px] text-[var(--text-primary)] focus:outline-none focus:border-[var(--button-primary)]"
              />
            </div>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs text-[var(--text-muted)] font-bold">{selectedLocation.currencySymbol || '$'}</span>
              <input
                type="number"
                placeholder="Max"
                value={localMaxPrice}
                onChange={(e) => setLocalMaxPrice(e.target.value)}
                className="w-full bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-xl pl-7 pr-2.5 py-2 text-[13px] text-[var(--text-primary)] focus:outline-none focus:border-[var(--button-primary)]"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-2.5 bg-[var(--bg-secondary)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-primary)] font-bold text-[13px] rounded-xl transition-colors cursor-pointer border border-[var(--border-primary)]"
          >
            Apply Price
          </button>
        </form>
      </div>

      {/* 5. DYNAMIC CATEGORY-SPECIFIC FILTERS */}

      {/* A. PROPERTIES FILTERS */}
      {categoryParam === 'properties' && (
        <div className="pt-4 border-t border-[var(--border-subtle)] space-y-4">
          <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">Property Specs</h3>
          
          {/* Bedrooms / BHK */}
          <div>
            <label className="block text-[11px] text-[var(--text-muted)] uppercase font-bold mb-2">Bedrooms (BHK)</label>
            <div className="grid grid-cols-2 gap-2">
              {['1 BHK', '2 BHK', '3 BHK', '4+ BHK'].map(b => (
                <button
                  key={b}
                  type="button"
                  onClick={() => updateParam('bedrooms', bedroomsParam === b ? '' : b)}
                  className={cn(
                    "py-2 px-2.5 rounded-xl text-[12px] text-center border transition-all cursor-pointer font-semibold",
                    bedroomsParam === b ? "bg-[var(--button-primary)] text-[var(--button-primary-text)] font-bold border-[var(--button-primary)] shadow-xs" : "bg-[var(--bg-surface)] border-[var(--border-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  )}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* Property Type */}
          <div>
            <label className="block text-[11px] text-[var(--text-muted)] uppercase font-bold mb-2">Property Type</label>
            <select
              value={propertyTypeParam}
              onChange={(e) => updateParam('propertyType', e.target.value)}
              className="w-full bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-xl px-3.5 py-2.5 text-[13px] text-[var(--text-primary)] focus:outline-none focus:border-[var(--button-primary)] font-medium"
            >
              <option value="">All Property Types</option>
              <option value="Apartment">Apartment / Flat</option>
              <option value="Villa">Independent House / Villa</option>
              <option value="Commercial">Commercial Space / Office</option>
              <option value="Land">Plots & Land</option>
              <option value="PG">PG & Guest Houses</option>
            </select>
          </div>

          {/* Furnishing */}
          <div>
            <label className="block text-[11px] text-[var(--text-muted)] uppercase font-bold mb-2">Furnishing Status</label>
            <div className="space-y-1.5">
              {['Fully Furnished', 'Semi-Furnished', 'Unfurnished'].map(f => (
                <label key={f} className="flex items-center gap-2.5 text-[13px] text-[var(--text-primary)] cursor-pointer">
                  <input
                    type="radio"
                    name="furnishing"
                    checked={furnishingParam === f}
                    onChange={() => updateParam('furnishing', furnishingParam === f ? '' : f)}
                    className="accent-[var(--accent)]"
                  />
                  <span>{f}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* B. VEHICLES FILTERS */}
      {categoryParam === 'vehicles' && (
        <div className="pt-4 border-t border-[var(--border-subtle)] space-y-4">
          <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">Vehicle Specs</h3>
          
          {/* Brand */}
          <div>
            <label className="block text-[11px] text-[var(--text-muted)] uppercase font-bold mb-2">Popular Brands</label>
            <div className="flex flex-wrap gap-2">
              {['Toyota', 'Honda', 'Hyundai', 'Tata', 'BMW', 'Mercedes', 'Royal Enfield'].map(b => (
                <button
                  key={b}
                  type="button"
                  onClick={() => updateParam('brand', (brandParam || '').toLowerCase() === (b || '').toLowerCase() ? '' : b)}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-[12px] border transition-all cursor-pointer font-semibold",
                    (brandParam || '').toLowerCase() === (b || '').toLowerCase() ? "bg-[var(--button-primary)] text-[var(--button-primary-text)] font-bold border-[var(--button-primary)]" : "bg-[var(--bg-surface)] border-[var(--border-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  )}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* Fuel Type */}
          <div>
            <label className="block text-[11px] text-[var(--text-muted)] uppercase font-bold mb-2">Fuel Type</label>
            <div className="grid grid-cols-2 gap-2">
              {['Petrol', 'Diesel', 'Hybrid', 'Electric (EV)', 'CNG'].map(f => (
                <button
                  key={f}
                  type="button"
                  onClick={() => updateParam('fuel', fuelParam === f ? '' : f)}
                  className={cn(
                    "py-2 px-2.5 rounded-xl text-[12px] text-center border transition-all truncate cursor-pointer font-semibold",
                    fuelParam === f ? "bg-[var(--button-primary)] text-[var(--button-primary-text)] font-bold border-[var(--button-primary)]" : "bg-[var(--bg-surface)] border-[var(--border-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Transmission */}
          <div>
            <label className="block text-[11px] text-[var(--text-muted)] uppercase font-bold mb-2">Transmission</label>
            <div className="grid grid-cols-2 gap-2">
              {['Automatic', 'Manual'].map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => updateParam('transmission', transmissionParam === t ? '' : t)}
                  className={cn(
                    "py-2 px-2.5 rounded-xl text-[12px] text-center border transition-all cursor-pointer font-semibold",
                    transmissionParam === t ? "bg-[var(--button-primary)] text-[var(--button-primary-text)] font-bold border-[var(--button-primary)]" : "bg-[var(--bg-surface)] border-[var(--border-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* C. JOBS FILTERS */}
      {categoryParam === 'jobs' && (
        <div className="pt-4 border-t border-[var(--border-subtle)] space-y-4">
          <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">Job Filters</h3>
          
          {/* Work Mode */}
          <div>
            <label className="block text-[11px] text-[var(--text-muted)] uppercase font-bold mb-2">Work Mode</label>
            <div className="grid grid-cols-3 gap-1.5">
              {['Remote', 'Hybrid', 'On-site'].map(wm => (
                <button
                  key={wm}
                  type="button"
                  onClick={() => updateParam('workMode', (workModeParam || '').toLowerCase() === (wm || '').toLowerCase() ? '' : wm)}
                  className={cn(
                    "py-2 px-2 rounded-xl text-[12px] text-center border transition-all cursor-pointer font-semibold",
                    (workModeParam || '').toLowerCase() === (wm || '').toLowerCase() ? "bg-[var(--button-primary)] text-[var(--button-primary-text)] font-bold border-[var(--button-primary)]" : "bg-[var(--bg-surface)] border-[var(--border-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  )}
                >
                  {wm}
                </button>
              ))}
            </div>
          </div>

          {/* Job Type */}
          <div>
            <label className="block text-[11px] text-[var(--text-muted)] uppercase font-bold mb-2">Employment Type</label>
            <div className="space-y-1.5">
              {['Full Time', 'Part Time', 'Contract', 'Freelance'].map(jt => (
                <label key={jt} className="flex items-center gap-2.5 text-[13px] text-[var(--text-primary)] cursor-pointer">
                  <input
                    type="radio"
                    name="jobType"
                    checked={jobTypeParam === jt}
                    onChange={() => updateParam('jobType', jobTypeParam === jt ? '' : jt)}
                    className="accent-[var(--accent)]"
                  />
                  <span>{jt}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* D. PRODUCTS / TECH BRANDS */}
      {(categoryParam === 'products' || categoryParam === 'furniture') && (
        <div className="pt-4 border-t border-[var(--border-subtle)] space-y-3">
          <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">Product Brands</h3>
          <div className="flex flex-wrap gap-2">
            {['Apple', 'Samsung', 'Sony', 'Dell', 'HP', 'Lenovo', 'LG', 'OnePlus'].map(b => (
              <button
                key={b}
                type="button"
                onClick={() => updateParam('brand', (brandParam || '').toLowerCase() === (b || '').toLowerCase() ? '' : b)}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-[12px] border transition-all cursor-pointer font-semibold",
                  (brandParam || '').toLowerCase() === (b || '').toLowerCase() ? "bg-[var(--button-primary)] text-[var(--button-primary-text)] font-bold border-[var(--button-primary)]" : "bg-[var(--bg-surface)] border-[var(--border-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                )}
              >
                {b}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 6. Condition Filter */}
      {categoryParam !== 'jobs' && categoryParam !== 'services' && (
        <div className="pt-4 border-t border-[var(--border-subtle)]">
          <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider mb-3">Condition</h3>
          <div className="space-y-2">
            {[
              { label: 'All Conditions', value: '' },
              { label: 'Brand New', value: 'NEW' },
              { label: 'Like New (Mint)', value: 'LIKE_NEW' },
              { label: 'Used / Good', value: 'USED' },
              { label: 'Refurbished', value: 'REFURBISHED' }
            ].map(c => (
              <label key={c.value} className="flex items-center gap-2.5 text-[13px] text-[var(--text-primary)] cursor-pointer font-medium">
                <input
                  type="radio"
                  name="condition"
                  checked={conditionParam.toUpperCase() === c.value}
                  onChange={() => updateParam('condition', c.value)}
                  className="accent-[var(--accent)]"
                />
                <span>{c.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* 7. Date Posted Filter */}
      <div className="pt-4 border-t border-[var(--border-subtle)]">
        <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider mb-3">Posted Within</h3>
        <div className="space-y-2">
          {[
            { label: 'Anytime', value: '' },
            { label: 'Last 24 Hours', value: 'today' },
            { label: 'Last 3 Days', value: '3d' },
            { label: 'Last 7 Days (1 Week)', value: '7d' },
            { label: 'Last 30 Days (1 Month)', value: '30d' }
          ].map(d => (
            <label key={d.value} className="flex items-center gap-2.5 text-[13px] text-[var(--text-primary)] cursor-pointer font-medium">
              <input
                type="radio"
                name="datePosted"
                checked={datePostedParam === d.value}
                onChange={() => updateParam('datePosted', d.value)}
                className="accent-[var(--accent)]"
              />
              <span>{d.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 8. Save Search Action */}
      <div className="pt-4 border-t border-[var(--border-subtle)]">
        <button
          type="button"
          onClick={() => setShowSaveModal(true)}
          className="w-full py-3 px-4 bg-[var(--bg-surface)] hover:bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl text-[var(--text-primary)] font-bold text-[13px] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
        >
          <span>🔔</span>
          <span>Save Search Alert</span>
        </button>
      </div>

    </div>
  );

  return (
    <div className="bg-[var(--bg-primary)] text-[var(--text-primary)] min-h-[85vh] py-8 sm:py-10 velvorax-search-container transition-colors duration-200">
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

        {/* TOP BAR: SEARCH BAR, SUGGESTIONS & ACTIVE BADGES */}
        <div className="mb-8 space-y-5">
          
          {/* Main Search Input Form */}
          <div className="relative max-w-5xl">
            <form onSubmit={handleSearchSubmit} className="flex gap-3">
              <div className="flex-1 relative flex items-center bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-2xl px-5 py-3.5 focus-within:border-[var(--button-primary)] focus-within:ring-2 focus-within:ring-[var(--button-primary)]/20 transition-all shadow-xs min-h-[54px]">
                <svg className="w-5 h-5 text-[var(--text-muted)] mr-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search cars, iPhone, apartments, jobs, services across marketplace..."
                  value={searchInput}
                  onChange={(e) => {
                    setSearchInput(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  className="w-full bg-transparent text-[var(--text-primary)] focus:outline-none text-[15px] sm:text-[16px] placeholder:text-[var(--text-muted)]"
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchInput('');
                      updateParam('q', '');
                    }}
                    className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1.5 text-xs cursor-pointer font-bold"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Location Quick Button on Desktop */}
              <button
                type="button"
                onClick={() => setShowLocationPicker(true)}
                className="hidden md:flex items-center gap-2.5 px-5 py-3.5 bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-2xl text-[14px] font-bold text-[var(--text-primary)] hover:border-[var(--button-primary)] transition-colors whitespace-nowrap cursor-pointer shadow-xs min-h-[54px]"
              >
                <span className="text-[var(--accent)]">📍</span>
                <span className="truncate max-w-[130px]">{cityParam || selectedLocation.city || 'Location'}</span>
                <span className="opacity-60 text-[10px]">▼</span>
              </button>

              <button
                type="submit"
                className="px-8 sm:px-10 py-3.5 bg-[var(--button-primary)] hover:bg-[var(--button-primary-hover)] text-[var(--button-primary-text)] font-bold rounded-2xl text-[15px] transition-all shadow-md cursor-pointer active:scale-95 min-h-[54px] border border-[var(--button-primary)]"
              >
                Search
              </button>
            </form>

            {/* LIVE AUTO-SUGGESTIONS DROPDOWN */}
            {showSuggestions && suggestions.length > 0 && (
              <div
                ref={suggestionsBoxRef}
                className="absolute top-full left-0 right-0 mt-2 bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-2xl shadow-xl p-3 z-50 animate-scale-in text-[var(--text-primary)]"
              >
                <div className="px-3 py-2 text-[12px] font-bold text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border-subtle)]">
                  Suggested Listings & Keywords
                </div>
                <div className="py-1">
                  {suggestions.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectSuggestion(item)}
                      className="w-full text-left px-4 py-3 rounded-xl text-[14px] flex items-center justify-between hover:bg-[var(--bg-secondary)] hover:text-[var(--accent)] transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3 truncate">
                        <span className="text-[var(--accent)]">🔍</span>
                        <span className="font-bold truncate">{item.title}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-[var(--text-secondary)] shrink-0">
                        {item.category && <span className="uppercase tracking-wider px-2 py-0.5 rounded bg-[var(--bg-secondary)] font-semibold">{item.category}</span>}
                        {item.city && <span>📍 {item.city}</span>}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ACTIVE FILTER BADGES */}
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-[14px] text-[var(--text-secondary)] font-bold">Active Filters ({activeFiltersList.length}):</span>
            
            {activeFiltersList.length === 0 && (
              <span className="text-[13px] text-[var(--text-muted)] italic">Showing all approved marketplace listings</span>
            )}

            {activeFiltersList.map(af => (
              <span
                key={af.key}
                className="px-3.5 py-1.5 rounded-full bg-[var(--bg-surface)] border border-[var(--border-primary)] text-[var(--text-primary)] text-[13px] font-bold flex items-center gap-2.5 animate-fade-in shadow-xs"
              >
                {af.label}
                <button
                  type="button"
                  onClick={() => {
                    if (af.key === 'price') {
                      updateParams({ minPrice: '', maxPrice: '' });
                      setLocalMinPrice('');
                      setLocalMaxPrice('');
                    } else if (af.key === 'distance') {
                      updateParams({ distance: '', lat: '', lng: '' });
                    } else {
                      updateParam(af.key, '');
                    }
                  }}
                  className="hover:text-[var(--error)] font-black cursor-pointer text-xs"
                >
                  ✕
                </button>
              </span>
            ))}

            {activeFiltersList.length > 0 && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="text-[13px] text-[var(--error)] hover:underline font-bold ml-2 cursor-pointer"
              >
                Clear All
              </button>
            )}
          </div>

        </div>

        {/* MOBILE FILTER TRIGGER & SORT BAR */}
        <div className="flex lg:hidden items-center justify-between gap-3 pb-4 mb-6 border-b border-[var(--border-primary)]">
          <button
            type="button"
            onClick={() => setIsMobileDrawerOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-xl text-[13px] font-bold text-[var(--text-primary)] hover:border-[var(--button-primary)] transition-colors shadow-xs"
          >
            <svg className="w-4 h-4 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span>Filters {activeFiltersList.length > 0 && `(${activeFiltersList.length})`}</span>
          </button>

          <div className="flex items-center gap-2 text-[13px]">
            <span className="text-[var(--text-secondary)] font-semibold">Sort:</span>
            <select
              value={sortByParam}
              onChange={(e) => updateParam('sortBy', e.target.value)}
              className="bg-[var(--bg-surface)] border border-[var(--border-primary)] text-[var(--text-primary)] rounded-xl px-3 py-2 focus:outline-none focus:border-[var(--button-primary)] text-[13px] font-bold"
            >
              <option value="newest">Newly Listed</option>
              <option value="popular">Most Popular</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="oldest">Oldest</option>
            </select>
          </div>
        </div>

        {/* MAIN LAYOUT: DESKTOP SIDEBAR + LISTINGS GRID */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* DESKTOP SIDEBAR (STICKY) */}
          <aside className="hidden lg:block w-80 shrink-0 bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-3xl p-7 shadow-xs sticky top-24 max-h-[85vh] overflow-y-auto filter-scrollbar">
            {renderFilterControls()}
          </aside>

          {/* LISTINGS RESULTS COLUMN */}
          <main className="flex-1 w-full min-w-0">
            
            {/* Top Results Header (Desktop) */}
            <div className="hidden lg:flex items-center justify-between pb-4 mb-6 border-b border-[var(--border-primary)]">
              <div className="text-[15px] text-[var(--text-secondary)]">
                Found <span className="font-black text-[var(--text-primary)] text-[17px]">{pagination.total}</span> listings
                {cityParam && <span className="text-[var(--text-secondary)]"> in <strong className="text-[var(--text-primary)]">{cityParam}</strong></span>}
                {categoryParam && <span className="text-[var(--text-secondary)]"> under <strong className="text-[var(--text-primary)]">{selectedCatObj?.name || categoryParam}</strong></span>}
              </div>

              <div className="flex items-center gap-3 text-[14px]">
                <span className="text-[var(--text-secondary)] font-bold">Sort By:</span>
                <select
                  value={sortByParam}
                  onChange={(e) => updateParam('sortBy', e.target.value)}
                  className="bg-[var(--bg-surface)] border border-[var(--border-primary)] text-[var(--text-primary)] rounded-xl px-4 py-2.5 focus:outline-none focus:border-[var(--button-primary)] text-[13px] font-bold cursor-pointer shadow-xs"
                >
                  <option value="newest">Newly Listed (Newest)</option>
                  <option value="popular">Most Popular / Viewed</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="oldest">Oldest Listings</option>
                </select>
              </div>
            </div>

            {/* RESULTS RENDERING */}
            {loading ? (
              <div className="py-24 flex flex-col items-center justify-center gap-3">
                <Loader size="lg" />
                <p className="text-[14px] text-[var(--text-secondary)] animate-pulse font-medium">Searching verified marketplace listings...</p>
              </div>
            ) : error ? (
              <div className="p-10 bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-3xl text-center space-y-4">
                <div className="text-3xl text-[var(--error)]">⚠️</div>
                <p className="text-[15px] font-bold text-[var(--error)]">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-2.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-secondary)] text-[var(--error)] border border-[var(--border-primary)] text-[13px] font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Retry Search
                </button>
              </div>
            ) : listings.length === 0 ? (
              <div className="p-14 bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-3xl text-center space-y-4 shadow-xs">
                <div className="text-5xl">🔍</div>
                <h3 className="text-2xl font-black text-[var(--text-primary)]">
                  {cityParam 
                    ? `No listings found in ${cityParam}` 
                    : (q ? `No listings found for "${q}"` : 'No listings found matching your criteria')}
                </h3>
                <p className="text-[15px] text-[var(--text-secondary)] max-w-md mx-auto leading-relaxed">
                  {cityParam 
                    ? `There are no listings in ${cityParam} matching this search. Try searching worldwide or exploring other categories.` 
                    : 'Try adjusting your search terms, removing filters, or searching for other items like iPhone, BMW, Villa, or Plumber.'}
                </p>
                <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
                  {cityParam && (
                    <button
                      type="button"
                      onClick={() => updateParams({ city: '', region: '', country: '' })}
                      className="px-6 py-3 bg-[var(--button-primary)] text-[var(--button-primary-text)] hover:bg-[var(--button-primary-hover)] font-bold text-[14px] rounded-xl transition-colors shadow-xs cursor-pointer border border-[var(--button-primary)]"
                    >
                      🌐 Search All Locations Worldwide
                    </button>
                  )}
                  {categoryParam && (
                    <button
                      type="button"
                      onClick={() => updateParams({ category: '', subcategory: '' })}
                      className="px-6 py-3 bg-[var(--bg-secondary)] text-[var(--text-primary)] hover:bg-[var(--bg-surface)] font-bold text-[14px] rounded-xl transition-colors shadow-xs cursor-pointer border border-[var(--border-primary)]"
                    >
                      📂 Search All Categories
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="px-6 py-3 bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] font-bold text-[14px] rounded-xl transition-colors shadow-xs cursor-pointer border border-[var(--border-primary)]"
                  >
                    Reset All Filters
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {listings.map(item => (
                    <ListingCard key={item._id} {...item} />
                  ))}
                </div>

                {/* PAGINATION */}
                {pagination.totalPages > 1 && (
                  <div className="flex flex-wrap items-center justify-center gap-2 mt-14 pt-8 border-t border-[var(--border-primary)]">
                    <button
                      disabled={!pagination.hasPrevPage}
                      onClick={() => updateParam('page', (pagination.page - 1).toString())}
                      className="px-5 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)] text-[13px] font-bold text-[var(--text-primary)] hover:border-[var(--button-primary)] hover:text-[var(--accent)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-xs"
                    >
                      &larr; Previous
                    </button>

                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                      .filter(p => p === 1 || p === pagination.totalPages || Math.abs(p - pagination.page) <= 2)
                      .map((p, idx, arr) => {
                        const showEllipsis = idx > 0 && p - arr[idx - 1] > 1;
                        return (
                          <React.Fragment key={p}>
                            {showEllipsis && <span className="px-2 text-xs text-[var(--text-muted)]">...</span>}
                            <button
                              onClick={() => updateParam('page', p.toString())}
                              className={cn(
                                "w-10 h-10 rounded-xl text-[13px] font-bold transition-all cursor-pointer",
                                pagination.page === p
                                  ? "bg-[var(--button-primary)] text-[var(--button-primary-text)] shadow-xs border border-[var(--button-primary)]"
                                  : "bg-[var(--bg-surface)] border border-[var(--border-primary)] text-[var(--text-secondary)] hover:border-[var(--button-primary)] hover:text-[var(--text-primary)]"
                              )}
                            >
                              {p}
                            </button>
                          </React.Fragment>
                        );
                      })}

                    <button
                      disabled={!pagination.hasNextPage}
                      onClick={() => updateParam('page', (pagination.page + 1).toString())}
                      className="px-5 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)] text-[13px] font-bold text-[var(--text-primary)] hover:border-[var(--button-primary)] hover:text-[var(--accent)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-xs"
                    >
                      Next &rarr;
                    </button>
                  </div>
                )}
              </>
            )}

          </main>

        </div>

      </Container>

      {/* MOBILE SLIDE-OVER FILTER DRAWER */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md h-full bg-[var(--bg-surface)] border-l border-[var(--border-primary)] flex flex-col animate-scale-in text-[var(--text-primary)]">
            
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-5 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-[var(--text-primary)]">Filters</span>
                {activeFiltersList.length > 0 && (
                  <span className="px-3 py-0.5 rounded-full bg-[var(--bg-secondary)] text-[var(--accent)] text-[11px] font-bold border border-[var(--border-primary)]">
                    {activeFiltersList.length}
                  </span>
                )}
              </div>
              <button
                onClick={() => setIsMobileDrawerOpen(false)}
                className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Drawer Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 filter-scrollbar">
              {renderFilterControls()}
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-5 border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)] flex gap-3">
              <button
                type="button"
                onClick={() => {
                  clearAllFilters();
                  setIsMobileDrawerOpen(false);
                }}
                className="flex-1 py-3 bg-[var(--bg-surface)] border border-[var(--border-primary)] hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] font-bold text-[13px] rounded-xl transition-colors shadow-xs"
              >
                Reset All
              </button>
              <button
                type="button"
                onClick={() => setIsMobileDrawerOpen(false)}
                className="flex-1 py-3 bg-[var(--button-primary)] text-[var(--button-primary-text)] hover:bg-[var(--button-primary-hover)] font-bold text-[13px] rounded-xl transition-colors shadow-xs border border-[var(--button-primary)]"
              >
                Apply ({pagination.total} Results)
              </button>
            </div>

          </div>
        </div>
      )}

      {/* LOCATION PICKER MODAL */}
      <LocationSelector
        isOpen={showLocationPicker}
        onClose={() => setShowLocationPicker(false)}
        onSelect={(loc) => {
          if (loc.city) {
            updateParams({ city: loc.city, country: loc.country, region: loc.region, page: '1' });
          } else if (loc.country) {
            updateParams({ country: loc.country, city: '', region: '', page: '1' });
          } else {
            updateParams({ country: '', city: '', region: '', page: '1' });
          }
        }}
      />

      {/* SAVE SEARCH MODAL */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-3xl p-7 shadow-2xl space-y-5 animate-scale-in text-[var(--text-primary)]">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
              <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                <span>🔔</span> Save Search Alert
              </h3>
              <button onClick={() => setShowSaveModal(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-sm cursor-pointer">
                ✕
              </button>
            </div>

            <p className="text-[14px] text-[var(--text-secondary)] leading-relaxed">
              Get notified immediately when new listings matching these exact search filters are posted on Velvorax.
            </p>

            <div>
              <label className="block text-xs font-bold text-[var(--text-primary)] mb-2 uppercase tracking-wider">Search Alert Name</label>
              <input
                type="text"
                placeholder={q ? `Alert: ${q}` : `Alert: ${categoryParam || 'Marketplace'} in ${cityParam || 'Worldwide'}`}
                value={savedSearchTitle}
                onChange={(e) => setSavedSearchTitle(e.target.value)}
                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl px-4 py-3 text-[14px] text-[var(--text-primary)] focus:outline-none focus:border-[var(--button-primary)]"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowSaveModal(false)}
                className="flex-1 py-3 bg-[var(--bg-surface)] hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] font-bold text-[13px] rounded-xl transition-colors cursor-pointer border border-[var(--border-primary)]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={handleSaveSearch}
                className="flex-1 py-3 bg-[var(--button-primary)] text-[var(--button-primary-text)] hover:bg-[var(--button-primary-hover)] font-bold text-[13px] rounded-xl transition-colors disabled:opacity-50 cursor-pointer shadow-xs border border-[var(--button-primary)]"
              >
                {isSaving ? 'Saving...' : 'Save Alert'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Search;
