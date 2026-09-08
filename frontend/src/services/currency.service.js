/**
 * Currency Service
 * Centralized service for currency conversion architecture, rate lookup, and formatting helpers.
 */

import { WORLDWIDE_CURRENCIES, getCurrencyByCode, getDefaultCurrencyForCountry, searchCurrencies } from '../config/currencies';
import { formatListingPrice, formatCurrency } from '../utils/formatters';

// Baseline Exchange Rates relative to 1 USD for display conversion when enabled
// Real exchange rates provider can be connected here seamlessly
const BASE_EXCHANGE_RATES_USD = {
  USD: 1.0,
  INR: 86.5,
  EUR: 0.95,
  GBP: 0.79,
  AED: 3.67,
  SAR: 3.75,
  CAD: 1.42,
  AUD: 1.58,
  SGD: 1.35,
  JPY: 152.0,
  QAR: 3.64,
  KWD: 0.31,
  BHD: 0.38,
  OMR: 0.38,
  CHF: 0.90,
  CNY: 7.28,
  NZD: 1.74,
  BRL: 5.75,
  MXN: 20.3,
  ZAR: 18.2,
  MYR: 4.45,
  THB: 33.8,
  IDR: 16250,
  KRW: 1435,
  HKD: 7.78,
  TWD: 32.7,
  VND: 25400,
  PHP: 58.2,
  PKR: 278.5,
  BDT: 120.0,
  LKR: 295.0,
  NPR: 138.4,
  EGP: 50.2,
  ILS: 3.55,
  TRY: 35.6,
  KES: 129.5,
  NGN: 1530.0,
  SEK: 10.8,
  NOK: 11.1,
  DKK: 7.08,
  PLN: 4.08,
  RUB: 98.5
};

export const currencyService = {
  /**
   * Get all supported currencies
   */
  getCurrencies() {
    return WORLDWIDE_CURRENCIES;
  },

  /**
   * Search currencies by text
   */
  search(query) {
    return searchCurrencies(query);
  },

  /**
   * Get currency metadata by code
   */
  getByCode(code) {
    return getCurrencyByCode(code);
  },

  /**
   * Get default currency for country
   */
  getForCountry(countryName) {
    return getDefaultCurrencyForCountry(countryName);
  },

  /**
   * Format listing price
   */
  format(price, currency, options = {}) {
    return formatListingPrice(price, currency, null, options);
  },

  /**
   * Format generic currency with Intl.NumberFormat
   */
  formatRaw(amount, currency, options = {}) {
    return formatCurrency(amount, currency, options);
  },

  /**
   * Get exchange rate between source and target currency
   */
  getExchangeRate(fromCurrency = 'USD', toCurrency = 'USD') {
    const fromUpper = (fromCurrency || 'USD').toUpperCase();
    const toUpper = (toCurrency || 'USD').toUpperCase();

    if (fromUpper === toUpper) return 1.0;

    const fromRate = BASE_EXCHANGE_RATES_USD[fromUpper] || 1.0;
    const toRate = BASE_EXCHANGE_RATES_USD[toUpper] || 1.0;

    return toRate / fromRate;
  },

  /**
   * Convert currency without modifying original source data
   */
  convert(amount, fromCurrency = 'USD', toCurrency = 'USD') {
    if (!amount || isNaN(Number(amount))) return 0;
    const rate = this.getExchangeRate(fromCurrency, toCurrency);
    return Math.round(Number(amount) * rate * 100) / 100;
  }
};

export default currencyService;
