// backend/src/config/currencies.js
// Worldwide ISO-4217 Currencies List and Validation Helpers

export const SUPPORTED_CURRENCIES = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', flag: '🇮🇳', country: 'India' },
  { code: 'USD', symbol: '$', name: 'United States Dollar', flag: '🇺🇸', country: 'United States' },
  { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺', country: 'European Union' },
  { code: 'GBP', symbol: '£', name: 'British Pound Sterling', flag: '🇬🇧', country: 'United Kingdom' },
  { code: 'AED', symbol: 'د.إ', name: 'United Arab Emirates Dirham', flag: '🇦🇪', country: 'United Arab Emirates' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', flag: '🇨🇦', country: 'Canada' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', flag: '🇦🇺', country: 'Australia' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', flag: '🇸🇬', country: 'Singapore' },
  { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal', flag: '🇸🇦', country: 'Saudi Arabia' },
  { code: 'QAR', symbol: 'QR', name: 'Qatari Riyal', flag: '🇶🇦', country: 'Qatar' },
  { code: 'KWD', symbol: 'KD', name: 'Kuwaiti Dinar', flag: '🇰🇼', country: 'Kuwait' },
  { code: 'BHD', symbol: 'BD', name: 'Bahraini Dinar', flag: '🇧🇭', country: 'Bahrain' },
  { code: 'OMR', symbol: 'OMR', name: 'Omani Rial', flag: '🇴🇲', country: 'Oman' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', flag: '🇯🇵', country: 'Japan' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', flag: '🇨🇳', country: 'China' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', flag: '🇨🇭', country: 'Switzerland' },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar', flag: '🇳🇿', country: 'New Zealand' },
  { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar', flag: '🇭🇰', country: 'Hong Kong' },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit', flag: '🇲🇾', country: 'Malaysia' },
  { code: 'THB', symbol: '฿', name: 'Thai Baht', flag: '🇹🇭', country: 'Thailand' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand', flag: '🇿🇦', country: 'South Africa' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', flag: '🇧🇷', country: 'Brazil' },
  { code: 'MXN', symbol: 'MX$', name: 'Mexican Peso', flag: '🇲🇽', country: 'Mexico' },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won', flag: '🇰🇷', country: 'South Korea' },
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira', flag: '🇹🇷', country: 'Turkey' },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona', flag: '🇸🇪', country: 'Sweden' },
  { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone', flag: '🇳🇴', country: 'Norway' },
  { code: 'DKK', symbol: 'kr', name: 'Danish Krone', flag: '🇩🇰', country: 'Denmark' },
  { code: 'PLN', symbol: 'zł', name: 'Polish Zloty', flag: '🇵🇱', country: 'Poland' },
  { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah', flag: '🇮🇩', country: 'Indonesia' },
  { code: 'PHP', symbol: '₱', name: 'Philippine Peso', flag: '🇵🇭', country: 'Philippines' },
  { code: 'VND', symbol: '₫', name: 'Vietnamese Dong', flag: '🇻🇳', country: 'Vietnam' },
  { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound', flag: '🇪🇬', country: 'Egypt' },
  { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee', flag: '🇵🇰', country: 'Pakistan' },
  { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka', flag: '🇧🇩', country: 'Bangladesh' },
  { code: 'LKR', symbol: 'Rs', name: 'Sri Lankan Rupee', flag: '🇱🇰', country: 'Sri Lanka' },
  { code: 'NPR', symbol: 'Rs', name: 'Nepalese Rupee', flag: '🇳🇵', country: 'Nepal' },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', flag: '🇳🇬', country: 'Nigeria' },
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling', flag: '🇰🇪', country: 'Kenya' },
  { code: 'GHS', symbol: 'GH₵', name: 'Ghanaian Cedi', flag: '🇬🇭', country: 'Ghana' },
  { code: 'ILS', symbol: '₪', name: 'Israeli New Shekel', flag: '🇮🇱', country: 'Israel' },
  { code: 'RUB', symbol: '₽', name: 'Russian Ruble', flag: '🇷🇺', country: 'Russia' },
  { code: 'ARS', symbol: 'AR$', name: 'Argentine Peso', flag: '🇦🇷', country: 'Argentina' },
  { code: 'CLP', symbol: 'CL$', name: 'Chilean Peso', flag: '🇨🇱', country: 'Chile' },
  { code: 'COP', symbol: 'COL$', name: 'Colombian Peso', flag: '🇨🇴', country: 'Colombia' }
];

export const COUNTRY_DEFAULT_CURRENCY_MAP = {
  'india': 'INR',
  'united states': 'USD',
  'usa': 'USD',
  'us': 'USD',
  'united kingdom': 'GBP',
  'uk': 'GBP',
  'great britain': 'GBP',
  'england': 'GBP',
  'united arab emirates': 'AED',
  'uae': 'AED',
  'dubai': 'AED',
  'canada': 'CAD',
  'australia': 'AUD',
  'singapore': 'SGD',
  'saudi arabia': 'SAR',
  'qatar': 'QAR',
  'kuwait': 'KWD',
  'bahrain': 'BHD',
  'oman': 'OMR',
  'germany': 'EUR',
  'france': 'EUR',
  'italy': 'EUR',
  'spain': 'EUR',
  'netherlands': 'EUR',
  'japan': 'JPY',
  'china': 'CNY',
  'switzerland': 'CHF',
  'new zealand': 'NZD',
  'hong kong': 'HKD',
  'malaysia': 'MYR',
  'thailand': 'THB',
  'south africa': 'ZAR',
  'brazil': 'BRL',
  'mexico': 'MXN',
  'south korea': 'KRW',
  'turkey': 'TRY',
  'sweden': 'SEK',
  'norway': 'NOK',
  'denmark': 'DKK',
  'poland': 'PLN',
  'indonesia': 'IDR',
  'philippines': 'PHP',
  'vietnam': 'VND',
  'egypt': 'EGP',
  'pakistan': 'PKR',
  'bangladesh': 'BDT',
  'sri lanka': 'LKR',
  'nepal': 'NPR',
  'nigeria': 'NGN',
  'kenya': 'KES',
  'ghana': 'GHS',
  'israel': 'ILS',
  'russia': 'RUB'
};

const CURRENCY_MAP = new Map(SUPPORTED_CURRENCIES.map(c => [c.code.toUpperCase(), c]));

/**
 * Checks if a given currency code is valid (case-insensitive)
 */
export function isValidCurrency(code) {
  if (!code || typeof code !== 'string') return false;
  return CURRENCY_MAP.has(code.trim().toUpperCase());
}

/**
 * Gets currency object by code
 */
export function getCurrencyByCode(code) {
  if (!code || typeof code !== 'string') return CURRENCY_MAP.get('INR');
  return CURRENCY_MAP.get(code.trim().toUpperCase()) || CURRENCY_MAP.get('INR');
}

/**
 * Gets default currency for country
 */
export function getDefaultCurrencyForCountry(countryName) {
  if (!countryName || typeof countryName !== 'string') return CURRENCY_MAP.get('INR');
  const normalized = countryName.trim().toLowerCase();
  const code = COUNTRY_DEFAULT_CURRENCY_MAP[normalized] || 'INR';
  return getCurrencyByCode(code);
}
