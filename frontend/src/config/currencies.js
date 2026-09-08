/**
 * Centralized Worldwide ISO-4217 Currency Definitions and Helpers
 * Velvorax Marketplace
 */

export const POPULAR_CURRENCY_CODES = [
  'USD', 'INR', 'EUR', 'GBP', 'AED', 'SAR', 'CAD', 'AUD', 'SGD', 'JPY',
  'QAR', 'KWD', 'BHD', 'OMR', 'CHF', 'CNY', 'NZD', 'BRL', 'MXN', 'ZAR'
];

export const WORLDWIDE_CURRENCIES = [
  // Popular / Major Global
  { code: 'USD', name: 'United States Dollar', symbol: '$', flag: '🇺🇸', country: 'United States', locale: 'en-US', decimals: 2, popular: true },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳', country: 'India', locale: 'en-IN', decimals: 2, popular: true },
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺', country: 'European Union', locale: 'en-IE', decimals: 2, popular: true },
  { code: 'GBP', name: 'British Pound Sterling', symbol: '£', flag: '🇬🇧', country: 'United Kingdom', locale: 'en-GB', decimals: 2, popular: true },
  { code: 'AED', name: 'United Arab Emirates Dirham', symbol: 'د.إ', flag: '🇦🇪', country: 'United Arab Emirates', locale: 'ar-AE', decimals: 2, popular: true },
  { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼', flag: '🇸🇦', country: 'Saudi Arabia', locale: 'ar-SA', decimals: 2, popular: true },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$', flag: '🇨🇦', country: 'Canada', locale: 'en-CA', decimals: 2, popular: true },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺', country: 'Australia', locale: 'en-AU', decimals: 2, popular: true },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', flag: '🇸🇬', country: 'Singapore', locale: 'en-SG', decimals: 2, popular: true },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵', country: 'Japan', locale: 'ja-JP', decimals: 0, popular: true },
  { code: 'QAR', name: 'Qatari Riyal', symbol: 'ر.ق', flag: '🇶🇦', country: 'Qatar', locale: 'ar-QA', decimals: 2, popular: true },
  { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'د.ك', flag: '🇰🇼', country: 'Kuwait', locale: 'ar-KW', decimals: 3, popular: true },
  { code: 'BHD', name: 'Bahraini Dinar', symbol: '.د.ب', flag: '🇧🇭', country: 'Bahrain', locale: 'ar-BH', decimals: 3, popular: true },
  { code: 'OMR', name: 'Omani Rial', symbol: 'ر.ع.', flag: '🇴🇲', country: 'Oman', locale: 'ar-OM', decimals: 3, popular: true },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', flag: '🇨🇭', country: 'Switzerland', locale: 'de-CH', decimals: 2, popular: true },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳', country: 'China', locale: 'zh-CN', decimals: 2, popular: true },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', flag: '🇳🇿', country: 'New Zealand', locale: 'en-NZ', decimals: 2, popular: true },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', flag: '🇧🇷', country: 'Brazil', locale: 'pt-BR', decimals: 2, popular: true },
  { code: 'MXN', name: 'Mexican Peso', symbol: 'Mex$', flag: '🇲🇽', country: 'Mexico', locale: 'es-MX', decimals: 2, popular: true },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R', flag: '🇿🇦', country: 'South Africa', locale: 'en-ZA', decimals: 2, popular: true },

  // Asia & Pacific
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM', flag: '🇲🇾', country: 'Malaysia', locale: 'ms-MY', decimals: 2 },
  { code: 'THB', name: 'Thai Baht', symbol: '฿', flag: '🇹🇭', country: 'Thailand', locale: 'th-TH', decimals: 2 },
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp', flag: '🇮🇩', country: 'Indonesia', locale: 'id-ID', decimals: 0 },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩', flag: '🇰🇷', country: 'South Korea', locale: 'ko-KR', decimals: 0 },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', flag: '🇭🇰', country: 'Hong Kong', locale: 'zh-HK', decimals: 2 },
  { code: 'TWD', name: 'New Taiwan Dollar', symbol: 'NT$', flag: '🇹🇼', country: 'Taiwan', locale: 'zh-TW', decimals: 2 },
  { code: 'VND', name: 'Vietnamese Dong', symbol: '₫', flag: '🇻🇳', country: 'Vietnam', locale: 'vi-VN', decimals: 0 },
  { code: 'PHP', name: 'Philippine Peso', symbol: '₱', flag: '🇵🇭', country: 'Philippines', locale: 'en-PH', decimals: 2 },
  { code: 'PKR', name: 'Pakistani Rupee', symbol: '₨', flag: '🇵🇰', country: 'Pakistan', locale: 'ur-PK', decimals: 2 },
  { code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳', flag: '🇧🇩', country: 'Bangladesh', locale: 'bn-BD', decimals: 2 },
  { code: 'LKR', name: 'Sri Lankan Rupee', symbol: 'Rs', flag: '🇱🇰', country: 'Sri Lanka', locale: 'si-LK', decimals: 2 },
  { code: 'NPR', name: 'Nepalese Rupee', symbol: 'Rs', flag: '🇳🇵', country: 'Nepal', locale: 'ne-NP', decimals: 2 },

  // Middle East & Africa
  { code: 'EGP', name: 'Egyptian Pound', symbol: 'E£', flag: '🇪🇬', country: 'Egypt', locale: 'ar-EG', decimals: 2 },
  { code: 'ILS', name: 'Israeli New Shekel', symbol: '₪', flag: '🇮🇱', country: 'Israel', locale: 'he-IL', decimals: 2 },
  { code: 'JOD', name: 'Jordanian Dinar', symbol: 'JD', flag: '🇯🇴', country: 'Jordan', locale: 'ar-JO', decimals: 3 },
  { code: 'TRY', name: 'Turkish Lira', symbol: '₺', flag: '🇹🇷', country: 'Turkey', locale: 'tr-TR', decimals: 2 },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh', flag: '🇰🇪', country: 'Kenya', locale: 'en-KE', decimals: 2 },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', flag: '🇳🇬', country: 'Nigeria', locale: 'en-NG', decimals: 2 },
  { code: 'GHS', name: 'Ghanaian Cedi', symbol: 'GH₵', flag: '🇬🇭', country: 'Ghana', locale: 'en-GH', decimals: 2 },
  { code: 'MAD', name: 'Moroccan Dirham', symbol: 'MAD', flag: '🇲🇦', country: 'Morocco', locale: 'ar-MA', decimals: 2 },

  // Europe
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr', flag: '🇸🇪', country: 'Sweden', locale: 'sv-SE', decimals: 2 },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr', flag: '🇳🇴', country: 'Norway', locale: 'nb-NO', decimals: 2 },
  { code: 'DKK', name: 'Danish Krone', symbol: 'kr', flag: '🇩🇰', country: 'Denmark', locale: 'da-DK', decimals: 2 },
  { code: 'PLN', name: 'Polish Zloty', symbol: 'zł', flag: '🇵🇱', country: 'Poland', locale: 'pl-PL', decimals: 2 },
  { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč', flag: '🇨🇿', country: 'Czech Republic', locale: 'cs-CZ', decimals: 2 },
  { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft', flag: '🇭🇺', country: 'Hungary', locale: 'hu-HU', decimals: 0 },
  { code: 'RON', name: 'Romanian Leu', symbol: 'lei', flag: '🇷🇴', country: 'Romania', locale: 'ro-RO', decimals: 2 },
  { code: 'BGN', name: 'Bulgarian Lev', symbol: 'лв', flag: '🇧🇬', country: 'Bulgaria', locale: 'bg-BG', decimals: 2 },
  { code: 'HRK', name: 'Croatian Kuna', symbol: 'kn', flag: '🇭🇷', country: 'Croatia', locale: 'hr-HR', decimals: 2 },
  { code: 'RUB', name: 'Russian Ruble', symbol: '₽', flag: '🇷🇺', country: 'Russia', locale: 'ru-RU', decimals: 2 },

  // Americas
  { code: 'CLP', name: 'Chilean Peso', symbol: 'CLP$', flag: '🇨🇱', country: 'Chile', locale: 'es-CL', decimals: 0 },
  { code: 'COP', name: 'Colombian Peso', symbol: 'COL$', flag: '🇨🇴', country: 'Colombia', locale: 'es-CO', decimals: 0 },
  { code: 'ARS', name: 'Argentine Peso', symbol: 'ARS$', flag: '🇦🇷', country: 'Argentina', locale: 'es-AR', decimals: 2 },
  { code: 'PEN', name: 'Peruvian Sol', symbol: 'S/', flag: '🇵🇪', country: 'Peru', locale: 'es-PE', decimals: 2 },
  { code: 'CRC', name: 'Costa Rican Colon', symbol: '₡', flag: '🇨🇷', country: 'Costa Rica', locale: 'es-CR', decimals: 2 }
];

// Map lookup by Currency Code
export const CURRENCY_MAP = WORLDWIDE_CURRENCIES.reduce((acc, curr) => {
  acc[curr.code] = curr;
  return acc;
}, {});

// Country to Default Currency mapping
export const COUNTRY_TO_CURRENCY_MAP = {
  'India': 'INR',
  'United States': 'USD',
  'USA': 'USD',
  'United Kingdom': 'GBP',
  'UK': 'GBP',
  'Germany': 'EUR',
  'France': 'EUR',
  'Italy': 'EUR',
  'Spain': 'EUR',
  'Netherlands': 'EUR',
  'European Union': 'EUR',
  'Ireland': 'EUR',
  'United Arab Emirates': 'AED',
  'UAE': 'AED',
  'Dubai': 'AED',
  'Saudi Arabia': 'SAR',
  'Canada': 'CAD',
  'Australia': 'AUD',
  'Singapore': 'SGD',
  'Japan': 'JPY',
  'China': 'CNY',
  'Qatar': 'QAR',
  'Kuwait': 'KWD',
  'Bahrain': 'BHD',
  'Oman': 'OMR',
  'Switzerland': 'CHF',
  'New Zealand': 'NZD',
  'Brazil': 'BRL',
  'Mexico': 'MXN',
  'South Africa': 'ZAR',
  'Malaysia': 'MYR',
  'Thailand': 'THB',
  'Indonesia': 'IDR',
  'South Korea': 'KRW',
  'Hong Kong': 'HKD',
  'Taiwan': 'TWD',
  'Vietnam': 'VND',
  'Philippines': 'PHP',
  'Pakistan': 'PKR',
  'Bangladesh': 'BDT',
  'Sri Lanka': 'LKR',
  'Nepal': 'NPR',
  'Egypt': 'EGP',
  'Israel': 'ILS',
  'Turkey': 'TRY',
  'Kenya': 'KES',
  'Nigeria': 'NGN',
  'Sweden': 'SEK',
  'Norway': 'NOK',
  'Denmark': 'DKK',
  'Poland': 'PLN',
  'Russia': 'RUB',
  'Chile': 'CLP',
  'Colombia': 'COP',
  'Argentina': 'ARS'
};

/**
 * Get default currency for a given country
 * @param {string} countryName 
 * @returns {Object} Currency object (e.g. { code: 'USD', symbol: '$', ... })
 */
export function getDefaultCurrencyForCountry(countryName) {
  if (!countryName) return CURRENCY_MAP['INR'] || WORLDWIDE_CURRENCIES[0];
  const cleanName = String(countryName).trim();
  const code = COUNTRY_TO_CURRENCY_MAP[cleanName] || 'USD';
  return CURRENCY_MAP[code] || CURRENCY_MAP['USD'] || WORLDWIDE_CURRENCIES[0];
}

/**
 * Get currency metadata by code
 * @param {string} code - ISO-4217 code (e.g. 'USD', 'INR', 'EUR')
 * @returns {Object}
 */
export function getCurrencyByCode(code) {
  if (!code || typeof code !== 'string') return CURRENCY_MAP['INR'] || WORLDWIDE_CURRENCIES[0];
  const upper = code.toUpperCase().trim();
  return CURRENCY_MAP[upper] || {
    code: upper,
    name: upper,
    symbol: upper === 'INR' ? '₹' : '$',
    flag: '🌐',
    country: 'International',
    locale: 'en-US',
    decimals: 2
  };
}

/**
 * Search currencies by query (matches code, name, country, or symbol)
 * @param {string} query 
 * @returns {Array}
 */
export function searchCurrencies(query = '') {
  const q = String(query).trim().toLowerCase();
  if (!q) return WORLDWIDE_CURRENCIES;

  return WORLDWIDE_CURRENCIES.filter(item => {
    return (
      item.code.toLowerCase().includes(q) ||
      item.name.toLowerCase().includes(q) ||
      item.country.toLowerCase().includes(q) ||
      item.symbol.toLowerCase().includes(q)
    );
  });
}

/**
 * Get popular currencies list
 */
export function getPopularCurrencies() {
  return WORLDWIDE_CURRENCIES.filter(c => c.popular);
}
