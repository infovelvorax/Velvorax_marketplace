import {
  CURRENCY_MAP,
  COUNTRY_TO_CURRENCY_MAP,
  getCurrencyByCode
} from '../config/currencies';

/**
 * Re-export country to currency mapping
 */
export const COUNTRY_CURRENCY_MAP = Object.entries(COUNTRY_TO_CURRENCY_MAP).reduce((acc, [country, code]) => {
  const meta = getCurrencyByCode(code);
  acc[country] = { currency: code, symbol: meta.symbol, locale: meta.locale };
  return acc;
}, {});

export const CURRENCY_METADATA = CURRENCY_MAP;

/**
 * Format listing price with locale-aware symbol and number separators
 * @param {number|string} price
 * @param {string} currency - e.g. 'INR', 'USD', 'EUR', 'GBP', 'AED', 'JPY', etc.
 * @param {string|null} customLocale - optional locale override
 * @param {Object} options - { listingType, compact }
 * @returns {string} e.g. "₹25,00,000", "$25,000", "€50,000", "100% FREE", "Contact for Price"
 */
export function formatListingPrice(price, currency = 'INR', customLocale = null, options = {}) {
  const { listingType = 'SELL', compact = false } = options;

  if (listingType?.toUpperCase() === 'FREE') {
    return '100% FREE';
  }

  if (price === 0 || price === null || price === undefined || price === '' || isNaN(Number(price))) {
    if (listingType?.toUpperCase() === 'FREE') return '100% FREE';
    return 'Contact for Price';
  }

  const num = Number(price);
  const cur = (currency || 'INR').toUpperCase();
  const meta = getCurrencyByCode(cur);
  const symbol = meta.symbol || '$';
  const locale = customLocale || meta.locale || 'en-US';

  // Indian Lakhs / Crores compact formatting when compact=true for INR
  if (cur === 'INR') {
    if (compact) {
      if (num >= 10000000) {
        return `${symbol}${(num / 10000000).toFixed(2).replace(/\.00$/, '')} Cr`;
      }
      if (num >= 100000) {
        return `${symbol}${(num / 100000).toFixed(2).replace(/\.00$/, '')} Lac`;
      }
      if (num >= 1000) {
        return `${symbol}${(num / 1000).toFixed(1).replace(/\.0$/, '')}k`;
      }
    }
    return `${symbol}${num.toLocaleString('en-IN')}`;
  }

  // Worldwide standard formatting (USD, EUR, GBP, AED, JPY, etc.)
  if (compact) {
    if (num >= 1000000000) {
      return `${symbol}${(num / 1000000000).toFixed(2).replace(/\.00$/, '')}B`;
    }
    if (num >= 1000000) {
      return `${symbol}${(num / 1000000).toFixed(2).replace(/\.00$/, '')}M`;
    }
    if (num >= 1000) {
      return `${symbol}${(num / 1000).toFixed(1).replace(/\.0$/, '')}k`;
    }
  }

  try {
    // Try native Intl.NumberFormat with exact currency symbol
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: cur,
      maximumFractionDigits: meta.decimals !== undefined ? meta.decimals : 2
    }).format(num);
  } catch {
    // Fallback if browser locale doesn't recognize rare currency code
    return `${symbol}${num.toLocaleString(locale)}`;
  }
}

/**
 * Format a number as currency using Intl.NumberFormat
 * @param {number} amount
 * @param {string} currency
 * @param {Object} options
 * @returns {string}
 */
export function formatCurrency(amount, currency = 'USD', options = {}) {
  if (typeof amount !== 'number' && isNaN(Number(amount))) return '';
  const num = Number(amount);
  const cur = (currency || 'USD').toUpperCase();
  const meta = getCurrencyByCode(cur);
  const locale = options.locale || meta.locale || 'en-US';

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: cur,
      ...options
    }).format(num);
  } catch {
    return `${meta.symbol || '$'}${num.toLocaleString(locale)}`;
  }
}

/**
 * Format a date object or ISO string to standard human-readable format
 * @param {string | Date} date
 * @param {Intl.DateTimeFormatOptions} options
 * @returns {string}
 */
export function formatDate(date, options = { year: 'numeric', month: 'short', day: 'numeric' }) {
  if (!date) return ''
  const parsedDate = typeof date === 'string' ? new Date(date) : date
  if (isNaN(parsedDate.getTime())) return ''
  return new Intl.DateTimeFormat('en-US', options).format(parsedDate)
}

/**
 * Truncates text to a specified maximum length
 * @param {string} str
 * @param {number} length
 * @returns {string}
 */
export function truncate(str, length = 100) {
  if (!str || str.length <= length) return str || ''
  return `${str.slice(0, length)}...`
}
