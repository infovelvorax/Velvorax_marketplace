import './SearchBar.css';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocationContext } from '../../../context/LocationContext';
import { categoryService } from '../../../services/api/category.service';
import { listingsService } from '../../../services/api/listings.service';
import { LocationSelector } from '../../common/LocationSelector';
import { ROUTES } from '../../../constants';
import { cn } from '../../../utils';

export function SearchBar({ compact = false, className, onSearch }) {
  const navigate = useNavigate();
  const { selectedLocation = {} } = useLocationContext();

  const [categories, setCategories] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('');
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const searchContainerRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    const fetchCats = async () => {
      try {
        const response = await categoryService.getCategories();
        const categoriesList = Array.isArray(response)
          ? response
          : (Array.isArray(response?.data) ? response.data : []);
        if (isMounted) {
          setCategories(categoriesList);
        }
      } catch (e) {
        if (isMounted) {
          setCategories([]);
        }
      }
    };
    fetchCats();

    return () => {
      isMounted = false;
    };
  }, []);


  // Debounced auto-suggest
  useEffect(() => {
    if (!keyword.trim() || keyword.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await listingsService.getSuggestions(keyword);
        if (res?.suggestions) {
          setSuggestions(res.suggestions);
          setShowSuggestions(true);
        }
      } catch (err) {
        console.error('Failed to fetch search suggestions:', err);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [keyword]);

  // Click outside to close suggestion dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e, selectedKeyword = null) => {
    if (e) e.preventDefault();
    const finalKeyword = selectedKeyword || keyword;

    const params = new URLSearchParams();
    if (finalKeyword.trim()) params.set('q', finalKeyword.trim());
    if (category) params.set('category', category);
    if (selectedLocation?.country) params.set('country', selectedLocation.country);
    if (selectedLocation?.city) params.set('city', selectedLocation.city);

    setShowSuggestions(false);
    if (document.activeElement && typeof document.activeElement.blur === 'function') {
      document.activeElement.blur();
    }

    if (onSearch) {
      onSearch({ keyword: finalKeyword, category, location: selectedLocation });
    } else {
      navigate(`${ROUTES.SEARCH}?${params.toString()}`);
    }
  };

  const displayLocation = selectedLocation?.city 
    ? `${selectedLocation.city}, ${selectedLocation.countryCode || selectedLocation.country}`
    : (selectedLocation?.country || 'Worldwide');

  /* Compact Navbar SearchBar (Height 48-50px) */
  if (compact) {
    return (
      <>
        <div ref={searchContainerRef} className={cn("relative w-full max-w-xl", className)}>
          <form 
            onSubmit={handleSubmit}
            className="flex items-center bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-xl shadow-xs overflow-hidden focus-within:border-[var(--button-primary)] focus-within:ring-2 focus-within:ring-[var(--button-primary)]/20 transition-all min-h-[40px] xs:min-h-[44px] sm:min-h-[48px]"
          >
            {/* Location Trigger - Visible on all devices, opens location modal */}
            <button
              type="button"
              onClick={() => setShowLocationModal(true)}
              className="flex items-center gap-1 sm:gap-1.5 px-2 xs:px-2.5 sm:px-3.5 py-1.5 text-[10px] xs:text-[11px] sm:text-xs font-bold text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] border-r border-[var(--border-primary)] transition-colors shrink-0 cursor-pointer select-none max-w-[80px] xs:max-w-[110px] sm:max-w-[145px]"
              title="Filter by City or Country"
            >
              <span className="text-[var(--accent)] shrink-0 text-xs">📍</span>
              <span className="truncate">{displayLocation}</span>
              <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[var(--text-muted)] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Input */}
            <div className="flex-1 flex items-center px-2 xs:px-2.5 sm:px-3.5 py-1.5 min-w-0">
              <input
                type="text"
                placeholder="Search products, cars, jobs..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                className="w-full bg-transparent text-[var(--text-primary)] placeholder:text-[var(--text-muted)] text-[12px] xs:text-[13px] sm:text-[14px] focus:outline-none font-medium truncate"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              aria-label="Search marketplace"
              className="px-2.5 xs:px-3.5 sm:px-4 py-1.5 bg-[var(--button-primary)] hover:bg-[var(--button-primary-hover)] text-[var(--button-primary-text)] font-bold text-xs sm:text-sm flex items-center justify-center transition-colors cursor-pointer select-none min-h-[40px] xs:min-h-[44px] sm:min-h-[48px] shrink-0"
            >
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>

          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-2xl shadow-xl z-50 overflow-hidden text-sm animate-scale-in text-[var(--text-primary)]">
              <div className="px-4 py-2.5 text-[12px] font-bold text-[var(--text-secondary)] uppercase tracking-wider bg-[var(--bg-secondary)] border-b border-[var(--border-subtle)]">
                Suggested Searches
              </div>
              <div className="max-h-60 overflow-y-auto">
                {suggestions.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setKeyword(item.title);
                      handleSubmit(null, item.title);
                    }}
                    className="w-full px-5 py-3 text-left flex items-center justify-between hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer border-b border-[var(--border-subtle)] last:border-0"
                  >
                    <span className="truncate font-semibold">{item.title}</span>
                    {item.category && (
                      <span className="text-xs text-[var(--text-muted)] capitalize shrink-0 ml-2">{item.category}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Global Location Selector Modal */}
        <LocationSelector
          isOpen={showLocationModal}
          onClose={() => setShowLocationModal(false)}
        />
      </>
    );
  }

  /* Large Hero Centerpiece SearchBar (58-64px Height, Spacious & Bold) */
  return (
    <>
      <div ref={searchContainerRef} className="relative w-full max-w-5xl mx-auto">
        <form 
          onSubmit={handleSubmit}
          className={cn("flex flex-col md:flex-row bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-2xl md:rounded-3xl p-2.5 md:p-3 shadow-xl gap-2.5", className)}
        >
          {/* Keyword input */}
          <div className="flex-1 flex items-center bg-[var(--bg-secondary)] rounded-xl md:rounded-2xl px-5 py-3.5 border border-[var(--border-primary)] focus-within:border-[var(--button-primary)] focus-within:bg-[var(--bg-surface)] focus-within:ring-2 focus-within:ring-[var(--button-primary)]/20 transition-all min-h-[56px] sm:min-h-[60px]">
            <svg className="w-5 h-5 text-[var(--text-muted)] mr-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input 
              type="text" 
              placeholder="What are you looking for? (e.g., iPhone, 3 BHK Villa, BMW, Plumber...)"
              className="w-full bg-transparent text-[var(--text-primary)] focus:outline-none placeholder:text-[var(--text-muted)] text-[15px] md:text-[16px] font-medium"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
            />
          </div>

          {/* Category Select */}
          <div className="md:w-[220px] relative flex items-center bg-[var(--bg-secondary)] rounded-xl md:rounded-2xl px-4 py-3.5 border border-[var(--border-primary)] focus-within:border-[var(--button-primary)] focus-within:bg-[var(--bg-surface)] focus-within:ring-2 focus-within:ring-[var(--button-primary)]/20 transition-all min-h-[56px] sm:min-h-[60px]">
            <svg className="w-4 h-4 text-[var(--text-muted)] mr-2.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            <select 
              className="w-full bg-transparent text-[var(--text-primary)] focus:outline-none text-[14px] sm:text-[15px] appearance-none cursor-pointer font-bold pr-6 truncate"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="" className="bg-[var(--bg-surface)] text-[var(--text-secondary)] font-medium">All Categories</option>
              {categories.map((c) => (
                <option key={c._id || c.slug} value={c.slug} className="bg-[var(--bg-surface)] text-[var(--text-primary)] font-semibold">
                  {c.name}
                </option>
              ))}
            </select>
            <svg className="w-3.5 h-3.5 text-[var(--text-muted)] absolute right-3.5 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          {/* Location selector trigger */}
          <button
            type="button"
            onClick={() => setShowLocationModal(true)}
            className="md:w-[220px] flex items-center justify-between bg-[var(--bg-secondary)] rounded-xl md:rounded-2xl px-4 py-3.5 border border-[var(--border-primary)] hover:border-[var(--button-primary)] transition-all text-left cursor-pointer min-h-[56px] sm:min-h-[60px] select-none"
          >
            <div className="flex items-center gap-2.5 truncate">
              <span className="text-base text-[var(--accent)] shrink-0">📍</span>
              <span className="text-[var(--text-primary)] text-[14px] sm:text-[15px] truncate font-bold">
                {displayLocation}
              </span>
            </div>
            <svg className="w-4 h-4 text-[var(--text-muted)] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Large Primary Search Button */}
          <button 
            type="submit"
            className="md:ml-1 font-bold px-8 py-4 rounded-xl md:rounded-2xl bg-[var(--button-primary)] text-[var(--button-primary-text)] hover:bg-[var(--button-primary-hover)] hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2.5 text-[15px] md:text-[16px] shrink-0 active:scale-95 border border-[var(--button-primary)] min-h-[56px] sm:min-h-[60px] select-none"
          >
            <span>Search</span>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </form>

        {/* Suggestions Dropdown for Hero */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-3 bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-3xl shadow-2xl z-50 overflow-hidden text-[15px] animate-scale-in text-[var(--text-primary)]">
            <div className="px-6 py-3 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider bg-[var(--bg-secondary)] border-b border-[var(--border-subtle)]">
              Suggested Searches
            </div>
            <div className="max-h-72 overflow-y-auto">
              {suggestions.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setKeyword(item.title);
                    handleSubmit(null, item.title);
                  }}
                  className="w-full px-6 py-3.5 text-left flex items-center justify-between hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer border-b border-[var(--border-subtle)] last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[var(--text-muted)]">🔍</span>
                    <span className="font-bold">{item.title}</span>
                  </div>
                  {item.category && (
                    <span className="text-xs px-3 py-1 rounded-full bg-[var(--bg-secondary)] text-[var(--text-secondary)] capitalize font-medium">{item.category}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Global Location Selector Modal */}
      <LocationSelector
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
      />
    </>
  );
}

export default SearchBar;
