import './LocationSelector.css';
import React, { useState, useEffect, useRef } from 'react';
import { useLocationContext } from '../../../context/LocationContext';
import { cn } from '../../../utils';

export function LocationSelector({ isOpen, onClose, onSelect, title = "Select Global Location" }) {
  const { 
    locations = [], 
    selectedLocation = {}, 
    setLocation,
    popularCities: contextPopularCities = [] 
  } = useLocationContext();

  const [activeTab, setActiveTab] = useState('browse'); // 'browse' | 'hierarchy'
  const [searchQuery, setSearchQuery] = useState('');
  
  // Local hierarchical selection state before applying
  const [tempCountry, setTempCountry] = useState(selectedLocation.country || 'India');
  const [tempRegion, setTempRegion] = useState(selectedLocation.region || '');
  const [tempCity, setTempCity] = useState(selectedLocation.city || '');
  const [tempLocalArea, setTempLocalArea] = useState(selectedLocation.localArea || '');

  const modalRef = useRef(null);

  // Sync temp state when modal opens or context changes
  useEffect(() => {
    if (isOpen) {
      setTempCountry(selectedLocation.country || (locations[0]?.countryName || 'India'));
      setTempRegion(selectedLocation.region || '');
      setTempCity(selectedLocation.city || '');
      setTempLocalArea(selectedLocation.localArea || '');
      setSearchQuery('');
    }
  }, [isOpen, selectedLocation, locations]);

  // Handle ESC key and click outside
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Selected Country Object & Options
  const currentCountryObj = locations.find(l => l.countryName === tempCountry) || locations[0];
  const availableRegions = currentCountryObj?.regions || [];
  const currentRegionObj = availableRegions.find(r => r.name === tempRegion);
  const availableCities = currentRegionObj?.cities || [];
  const currentCityObj = availableCities.find(c => c.name === tempCity);
  const availableLocalAreas = currentCityObj?.localAreas || [];

  // Fallback popular cities if API is still loading
  const popularCities = contextPopularCities.length > 0 ? contextPopularCities : [
    { cityName: 'Dubai', countryName: 'United Arab Emirates', regionName: 'Dubai', currency: 'AED', currencySymbol: 'AED' },
    { cityName: 'London', countryName: 'United Kingdom', regionName: 'England', currency: 'GBP', currencySymbol: '£' },
    { cityName: 'New York City', countryName: 'United States', regionName: 'New York', currency: 'USD', currencySymbol: '$' },
    { cityName: 'San Francisco', countryName: 'United States', regionName: 'California', currency: 'USD', currencySymbol: '$' },
    { cityName: 'Bengaluru', countryName: 'India', regionName: 'Karnataka', currency: 'INR', currencySymbol: '₹' },
    { cityName: 'Chennai', countryName: 'India', regionName: 'Tamil Nadu', currency: 'INR', currencySymbol: '₹' },
    { cityName: 'Mumbai', countryName: 'India', regionName: 'Maharashtra', currency: 'INR', currencySymbol: '₹' },
    { cityName: 'Hyderabad', countryName: 'India', regionName: 'Telangana', currency: 'INR', currencySymbol: '₹' },
    { cityName: 'New Delhi', countryName: 'India', regionName: 'Delhi NCR', currency: 'INR', currencySymbol: '₹' }
  ];

  // Filtered popular cities when user searches
  const filteredPopular = popularCities.filter(c => 
    c.cityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.countryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.regionName && c.regionName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Country change handler (cascading resets)
  const handleCountryChange = (countryName) => {
    setTempCountry(countryName);
    const countryObj = locations.find(l => l.countryName === countryName);
    const firstRegion = countryObj?.regions?.[0]?.name || '';
    const firstCity = countryObj?.regions?.[0]?.cities?.[0]?.name || '';
    setTempRegion(firstRegion);
    setTempCity(firstCity);
    setTempLocalArea('');
  };

  // Region change handler (cascading resets)
  const handleRegionChange = (regionName) => {
    setTempRegion(regionName);
    const regionObj = availableRegions.find(r => r.name === regionName);
    const firstCity = regionObj?.cities?.[0]?.name || '';
    setTempCity(firstCity);
    setTempLocalArea('');
  };

  // City change handler
  const handleCityChange = (cityName) => {
    setTempCity(cityName);
    setTempLocalArea('');
  };

  // Apply hierarchical selection
  const handleApplyHierarchy = () => {
    const updated = {
      country: tempCountry,
      countryCode: currentCountryObj?.countryCode || 'IN',
      currency: currentCountryObj?.currency || 'INR',
      currencySymbol: currentCountryObj?.currencySymbol || '₹',
      region: tempRegion,
      city: tempCity,
      localArea: tempLocalArea
    };
    setLocation(updated);
    if (onSelect) onSelect(updated);
    onClose?.();
  };

  // Select a popular city with 1 click
  const handleSelectPopularCity = (pc) => {
    const countryObj = locations.find(l => l.countryName === pc.countryName);
    const updated = {
      country: pc.countryName,
      countryCode: countryObj?.countryCode || pc.countryCode || 'IN',
      currency: countryObj?.currency || pc.currency || 'USD',
      currencySymbol: countryObj?.currencySymbol || pc.currencySymbol || '$',
      region: pc.regionName || '',
      city: pc.cityName,
      localArea: ''
    };
    setLocation(updated);
    if (onSelect) onSelect(updated);
    onClose?.();
  };

  // Clear / Global Worldwide
  const handleClearLocation = () => {
    const updated = {
      country: '',
      countryCode: '',
      region: '',
      city: '',
      localArea: '',
      currency: 'USD',
      currencySymbol: '$'
    };
    setLocation(updated);
    if (onSelect) onSelect(updated);
    onClose?.();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div 
        ref={modalRef}
        className="relative w-full max-w-2xl bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-3xl shadow-2xl overflow-hidden animate-scale-in z-10 text-[var(--text-primary)] my-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)] flex items-center justify-center text-lg text-[var(--accent)] shadow-xs">
              🌍
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-[var(--text-primary)] tracking-tight">
                {title}
              </h2>
              <p className="text-[13px] text-[var(--text-secondary)]">
                Browse listings locally or anywhere in the world
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close location selector"
            className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors cursor-pointer border border-transparent hover:border-[var(--border-primary)]"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tab Switcher: Quick Cities vs Custom Hierarchy */}
        <div className="flex border-b border-[var(--border-subtle)] px-6 sm:px-8 bg-[var(--bg-surface)] gap-4 pt-3">
          <button
            type="button"
            onClick={() => setActiveTab('browse')}
            className={cn(
              "pb-3 text-[14px] font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2",
              activeTab === 'browse'
                ? "border-[var(--button-primary)] text-[var(--text-primary)]"
                : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            )}
          >
            <span>🏙️ Popular Global Hubs</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('hierarchy')}
            className={cn(
              "pb-3 text-[14px] font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2",
              activeTab === 'hierarchy'
                ? "border-[var(--button-primary)] text-[var(--text-primary)]"
                : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            )}
          >
            <span>📍 Custom Country / State / City</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 sm:p-8 max-h-[60vh] overflow-y-auto space-y-6">
          
          {/* TAB 1: Popular Hubs & Quick Search */}
          {activeTab === 'browse' && (
            <div className="space-y-5">
              {/* Search filter input */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Filter by city name or country (e.g. London, Dubai, California...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl px-4 py-3 pl-11 text-[14px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--button-primary)]"
                />
                <svg className="w-5 h-5 text-[var(--text-muted)] absolute left-3.5 top-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 top-3.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Worldwide Global Option */}
              <div className="flex items-center justify-between p-3.5 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🌐</span>
                  <div>
                    <div className="text-[14px] font-bold text-[var(--text-primary)]">All Locations (Global Marketplace)</div>
                    <div className="text-[12px] text-[var(--text-secondary)]">Search listings across all countries with no geographical limits</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleClearLocation}
                  className="px-4 py-2 bg-[var(--bg-surface)] hover:bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[13px] font-bold text-[var(--text-primary)] rounded-xl transition-colors cursor-pointer shrink-0"
                >
                  Set Global
                </button>
              </div>

              {/* Popular Cities Grid */}
              <div>
                <div className="text-[12px] uppercase font-bold text-[var(--text-secondary)] tracking-wider mb-3">
                  Select a Major Metropolitan Hub
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {filteredPopular.map((pc, idx) => {
                    const isSelected = selectedLocation?.city === pc.cityName;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectPopularCity(pc)}
                        className={cn(
                          "p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2 shadow-2xs group",
                          isSelected
                            ? "bg-[var(--button-primary)] text-[var(--button-primary-text)] border-[var(--button-primary)]"
                            : "bg-[var(--bg-surface)] border-[var(--border-primary)] hover:border-[var(--button-primary)] hover:bg-[var(--bg-secondary)] text-[var(--text-primary)]"
                        )}
                      >
                        <div className="min-w-0">
                          <div className="text-[14px] font-bold truncate group-hover:translate-x-0.5 transition-transform">
                            {pc.cityName}
                          </div>
                          <div className={cn(
                            "text-[11px] truncate font-medium",
                            isSelected ? "opacity-90" : "text-[var(--text-secondary)]"
                          )}>
                            {pc.regionName ? `${pc.regionName}, ` : ''}{pc.countryName}
                          </div>
                        </div>
                        <span className={cn(
                          "text-xs px-2 py-0.5 rounded-md font-bold uppercase shrink-0",
                          isSelected ? "bg-white/20 text-white" : "bg-[var(--bg-secondary)] text-[var(--text-secondary)]"
                        )}>
                          {pc.currencySymbol || '$'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Full 4-Tier Hierarchy */}
          {activeTab === 'hierarchy' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-primary)] text-[13px] text-[var(--text-secondary)]">
                💡 Select your exact Country, State/Province, City, and Local Area. Changing a parent level automatically updates and resets child options.
              </div>

              {/* 1. Country */}
              <div>
                <label className="block text-[13px] font-bold text-[var(--text-primary)] mb-1.5">
                  1. Country
                </label>
                <select
                  value={tempCountry}
                  onChange={(e) => handleCountryChange(e.target.value)}
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl px-4 py-3 text-[14px] text-[var(--text-primary)] focus:outline-none focus:border-[var(--button-primary)] font-semibold cursor-pointer"
                >
                  {locations.map((loc) => (
                    <option key={loc.countryCode} value={loc.countryName} className="bg-[var(--bg-surface)] text-[var(--text-primary)]">
                      {loc.countryName} ({loc.countryCode}) — {loc.currencySymbol} {loc.currency}
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. State / Province / Region */}
              <div>
                <label className="block text-[13px] font-bold text-[var(--text-primary)] mb-1.5">
                  2. State / Province / Region
                </label>
                <select
                  value={tempRegion}
                  onChange={(e) => handleRegionChange(e.target.value)}
                  disabled={availableRegions.length === 0}
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl px-4 py-3 text-[14px] text-[var(--text-primary)] focus:outline-none focus:border-[var(--button-primary)] font-semibold cursor-pointer disabled:opacity-50"
                >
                  <option value="" className="bg-[var(--bg-surface)] text-[var(--text-secondary)]">Select Region / State...</option>
                  {availableRegions.map((reg) => (
                    <option key={reg.slug || reg.name} value={reg.name} className="bg-[var(--bg-surface)] text-[var(--text-primary)]">
                      {reg.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 3. City */}
              <div>
                <label className="block text-[13px] font-bold text-[var(--text-primary)] mb-1.5">
                  3. City
                </label>
                <select
                  value={tempCity}
                  onChange={(e) => handleCityChange(e.target.value)}
                  disabled={availableCities.length === 0}
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl px-4 py-3 text-[14px] text-[var(--text-primary)] focus:outline-none focus:border-[var(--button-primary)] font-semibold cursor-pointer disabled:opacity-50"
                >
                  <option value="" className="bg-[var(--bg-surface)] text-[var(--text-secondary)]">Select City...</option>
                  {availableCities.map((city) => (
                    <option key={city.slug || city.name} value={city.name} className="bg-[var(--bg-surface)] text-[var(--text-primary)]">
                      {city.name} {city.popular ? '★' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* 4. Local Area (Optional / Neighborhood) */}
              <div>
                <label className="block text-[13px] font-bold text-[var(--text-primary)] mb-1.5">
                  4. Local Area / Neighborhood <span className="font-normal text-[var(--text-muted)]">(Optional)</span>
                </label>
                {availableLocalAreas.length > 0 ? (
                  <select
                    value={tempLocalArea}
                    onChange={(e) => setTempLocalArea(e.target.value)}
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl px-4 py-3 text-[14px] text-[var(--text-primary)] focus:outline-none focus:border-[var(--button-primary)] font-semibold cursor-pointer"
                  >
                    <option value="" className="bg-[var(--bg-surface)] text-[var(--text-secondary)]">All Local Areas in {tempCity || 'City'}</option>
                    {availableLocalAreas.map((area) => (
                      <option key={area.slug || area.name} value={area.name} className="bg-[var(--bg-surface)] text-[var(--text-primary)]">
                        {area.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    placeholder="e.g. Downtown, Tech Park, Main Street..."
                    value={tempLocalArea}
                    onChange={(e) => setTempLocalArea(e.target.value)}
                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl px-4 py-3 text-[14px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--button-primary)]"
                  />
                )}
              </div>

              {/* Live Selection Summary */}
              <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-2xl flex items-center justify-between text-[13px]">
                <div>
                  <span className="font-bold text-[var(--text-primary)]">Selected Target: </span>
                  <span className="text-[var(--accent)] font-semibold">
                    {tempCity ? `${tempCity}, ` : ''}{tempRegion ? `${tempRegion}, ` : ''}{tempCountry}
                    {tempLocalArea ? ` (${tempLocalArea})` : ''}
                  </span>
                </div>
                <span className="font-bold text-[var(--text-secondary)] uppercase text-[11px] bg-[var(--bg-secondary)] px-2 py-1 rounded-md">
                  {currentCountryObj?.currencySymbol} {currentCountryObj?.currency}
                </span>
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 sm:px-8 py-5 border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
          <button
            type="button"
            onClick={handleClearLocation}
            className="w-full sm:w-auto text-[13px] font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer underline text-center sm:text-left"
          >
            Clear / Set Worldwide
          </button>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-surface)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] font-bold text-[14px] transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleApplyHierarchy}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[var(--button-primary)] text-[var(--button-primary-text)] hover:bg-[var(--button-primary-hover)] font-bold text-[14px] transition-colors cursor-pointer shadow-xs border border-[var(--button-primary)]"
            >
              Apply Location
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default LocationSelector;
