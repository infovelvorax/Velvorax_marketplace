import './CurrencySelector.css';
import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  WORLDWIDE_CURRENCIES,
  POPULAR_CURRENCY_CODES,
  getCurrencyByCode,
  searchCurrencies
} from '../../../config/currencies';
import { cn } from '../../../utils';

export function CurrencySelector({
  value = 'INR',
  onChange,
  disabled = false,
  className = '',
  label = 'Currency',
  showLabel = true,
  placeholder = 'Select currency...'
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  const selectedCurrency = useMemo(() => {
    return getCurrencyByCode(value);
  }, [value]);

  // Handle outside click to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchQuery('');
    }
  }, [isOpen]);

  // Filtered currencies based on search
  const filteredList = useMemo(() => {
    return searchCurrencies(searchQuery);
  }, [searchQuery]);

  const popularCurrencies = useMemo(() => {
    if (searchQuery.trim()) return [];
    return POPULAR_CURRENCY_CODES.map(code => getCurrencyByCode(code)).filter(Boolean);
  }, [searchQuery]);

  const handleSelect = (currency) => {
    if (disabled) return;
    if (onChange) {
      onChange(currency.code, currency);
    }
    setIsOpen(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className={cn('currency-selector-container', className)} ref={dropdownRef} onKeyDown={handleKeyDown}>
      {showLabel && (
        <label className="currency-selector-label">
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={cn(
          'currency-selector-trigger',
          isOpen && 'currency-selector-trigger--active',
          disabled && 'currency-selector-trigger--disabled'
        )}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="currency-selector-selected-info">
          <span className="currency-flag" role="img" aria-label={selectedCurrency.country}>
            {selectedCurrency.flag || '🌐'}
          </span>
          <span className="currency-code">{selectedCurrency.code}</span>
          <span className="currency-separator">—</span>
          <span className="currency-name">{selectedCurrency.name}</span>
          <span className="currency-symbol-badge">{selectedCurrency.symbol}</span>
        </div>
        <span className={cn('currency-chevron', isOpen && 'currency-chevron--rotated')}>
          ▼
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="currency-dropdown-menu shadow-2xl animate-in fade-in zoom-in-95 duration-150">
          {/* Search Header */}
          <div className="currency-search-wrapper">
            <span className="currency-search-icon">🔍</span>
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search currency (e.g. USD, Dollar, USA, INR, EUR)..."
              className="currency-search-input"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="currency-search-clear"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          {/* List of Currencies */}
          <div className="currency-list-scroll">
            {/* Popular Currencies (Shown when search is empty) */}
            {popularCurrencies.length > 0 && (
              <div className="currency-section">
                <div className="currency-section-title">
                  ⭐ Popular Currencies
                </div>
                <div className="currency-popular-grid">
                  {popularCurrencies.map((curr) => {
                    const isSelected = curr.code === selectedCurrency.code;
                    return (
                      <button
                        key={`pop-${curr.code}`}
                        type="button"
                        onClick={() => handleSelect(curr)}
                        className={cn(
                          'currency-popular-chip',
                          isSelected && 'currency-popular-chip--selected'
                        )}
                      >
                        <span className="currency-flag">{curr.flag}</span>
                        <span className="font-bold">{curr.code}</span>
                        <span className="currency-symbol-tag">{curr.symbol}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* All Currencies Header */}
            <div className="currency-section">
              <div className="currency-section-title">
                {searchQuery ? `Matching Currencies (${filteredList.length})` : 'All Worldwide Currencies'}
              </div>

              {filteredList.length === 0 ? (
                <div className="currency-no-results">
                  <p className="text-sm font-semibold text-[var(--text-secondary)]">No currencies found matching "{searchQuery}"</p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">Try searching by code (USD), name (Dollar), or country (USA)</p>
                </div>
              ) : (
                <div className="currency-options-list" role="listbox">
                  {filteredList.map((curr) => {
                    const isSelected = curr.code === selectedCurrency.code;
                    return (
                      <button
                        key={curr.code}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => handleSelect(curr)}
                        className={cn(
                          'currency-option-row',
                          isSelected && 'currency-option-row--selected'
                        )}
                      >
                        <div className="currency-option-main">
                          <span className="currency-flag" role="img" aria-label={curr.country}>
                            {curr.flag}
                          </span>
                          <div className="currency-option-text">
                            <div className="currency-option-header">
                              <span className="currency-option-code">{curr.code}</span>
                              <span className="currency-option-country">{curr.country}</span>
                            </div>
                            <span className="currency-option-name">{curr.name}</span>
                          </div>
                        </div>

                        <div className="currency-option-right">
                          <span className="currency-option-symbol">{curr.symbol}</span>
                          {isSelected && <span className="currency-check-icon">✓</span>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CurrencySelector;
