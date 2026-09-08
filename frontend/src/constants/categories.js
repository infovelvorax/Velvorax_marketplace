/**
 * Centralized marketplace categories configuration and metadata
 * Single source of truth for all category keys, labels, routes, and icons.
 */

export const DEFAULT_MARKETPLACE_CATEGORY = 'properties';

export const MARKETPLACE_CATEGORIES = [
  {
    id: 'properties',
    slug: 'properties',
    name: 'Properties & Real Estate',
    shortName: 'Real Estate',
    icon: '🏢',
    portalLabel: 'Real Estate Hub',
    dashboardPath: '/seller/properties/dashboard',
    browsePath: '/properties',
    businessLabel: 'Agency / Builder / Property Name',
    businessPlaceholder: 'e.g. Skyline Realty / Prime Estates',
    description: 'Villas, luxury apartments, commercial lands & builder floors'
  },
  {
    id: 'vehicles',
    slug: 'vehicles',
    name: 'Cars & Bikes',
    shortName: 'Vehicles',
    icon: '🚗',
    portalLabel: 'Auto & Motors Hub',
    dashboardPath: '/seller/vehicles/dashboard',
    browsePath: '/vehicles',
    businessLabel: 'Dealership / Showroom Name',
    businessPlaceholder: 'e.g. Velocity Auto Hub / Apex Motors',
    description: 'Sedans, SUVs, motorcycles, superbikes & commercial fleet'
  },
  {
    id: 'products',
    slug: 'products',
    name: 'Mobiles & Electronics',
    shortName: 'Electronics',
    icon: '📱',
    portalLabel: 'Electronics & Gadgets Hub',
    dashboardPath: '/seller/products/dashboard',
    browsePath: '/products',
    businessLabel: 'Store / Shop Name',
    businessPlaceholder: 'e.g. TechZone Electronics / Digital Hub',
    description: 'Smartphones, laptops, smart home devices, gadgets & audio'
  },
  {
    id: 'services',
    slug: 'services',
    name: 'Local Services',
    shortName: 'Services',
    icon: '🛠️',
    portalLabel: 'Local Services Hub',
    dashboardPath: '/seller/services/dashboard',
    browsePath: '/services',
    businessLabel: 'Business / Agency Name',
    businessPlaceholder: 'e.g. QuickFix Pro Services / Sparkle Cleaning',
    description: 'Home repairs, cleaning, plumbing, beauty, legal & logistics'
  },
  {
    id: 'jobs',
    slug: 'jobs',
    name: 'Jobs & Careers',
    shortName: 'Careers',
    icon: '💼',
    portalLabel: 'Employer & Jobs Hub',
    dashboardPath: '/seller/jobs/dashboard',
    browsePath: '/jobs',
    businessLabel: 'Company / Organization Name',
    businessPlaceholder: 'e.g. Acme Tech Solutions / Global Logistics',
    description: 'Full-time, remote, engineering, finance & healthcare openings'
  },
  {
    id: 'farm',
    slug: 'farm',
    name: 'Agriculture & Farm',
    shortName: 'Agriculture',
    icon: '🌾',
    portalLabel: 'Agriculture & Farm Hub',
    dashboardPath: '/seller/agriculture/dashboard',
    browsePath: '/farm',
    businessLabel: 'Farm / Enterprise Name',
    businessPlaceholder: 'e.g. GreenField Agro Supplies / Kisan Hub',
    description: 'Tractors, seeds, organic crops, livestock & harvesting tools'
  },
  {
    id: 'businesses',
    slug: 'businesses',
    name: 'Business Directory',
    shortName: 'Business',
    icon: '🏬',
    portalLabel: 'Business Directory Hub',
    dashboardPath: '/seller/businesses/dashboard',
    browsePath: '/businesses',
    businessLabel: 'Registered Business Name',
    businessPlaceholder: 'e.g. Vertex Industrial Supplies / Apex Trading',
    description: 'B2B vendors, industrial wholesale, factory outlets & suppliers'
  },
  {
    id: 'rentals',
    slug: 'rentals',
    name: 'Rentals & Leasing',
    shortName: 'Rentals',
    icon: '🔑',
    portalLabel: 'Rentals & Leasing Hub',
    dashboardPath: '/seller/rentals/dashboard',
    browsePath: '/rentals',
    businessLabel: 'Rental Agency / Fleet Name',
    businessPlaceholder: 'e.g. Metro Living Stays / Horizon Rentals',
    description: 'Short-term stays, equipment rental, vehicle leasing & venues'
  },
  {
    id: 'free',
    slug: 'free',
    name: 'Free Giveaways & Non-Profits',
    shortName: 'Giveaways',
    icon: '🎁',
    portalLabel: 'Community Giveaways Hub',
    dashboardPath: '/seller/free/dashboard',
    browsePath: '/free',
    businessLabel: 'Organization / Initiative Name',
    businessPlaceholder: 'e.g. Hope Community Foundation',
    description: 'Free community donations, book drives & charitable items'
  },
  {
    id: 'general',
    slug: 'general',
    name: 'General Marketplace',
    shortName: 'General',
    icon: '📦',
    portalLabel: 'General Marketplace Hub',
    dashboardPath: '/seller/dashboard',
    browsePath: '/categories',
    businessLabel: 'Store / Merchant Name',
    businessPlaceholder: 'e.g. Velvorax Direct Goods',
    description: 'All-inclusive marketplace goods, fashion & home accessories'
  }
];

// Helper: Normalize category ID/alias
export const normalizeCategoryId = (catId) => {
  if (!catId || typeof catId !== 'string') return DEFAULT_MARKETPLACE_CATEGORY;
  const raw = catId.toLowerCase().trim();
  const aliasMap = {
    'agriculture': 'farm',
    'farming': 'farm',
    'business': 'businesses',
    'electronics': 'products',
    'mobiles': 'products',
    'cars': 'vehicles',
    'bikes': 'vehicles',
    'property': 'properties',
    'real-estate': 'properties',
    'goods': 'products'
  };
  return aliasMap[raw] || raw;
};

// Helper: Get category metadata by ID or alias
export const getCategoryById = (id) => {
  const normalized = normalizeCategoryId(id);
  return MARKETPLACE_CATEGORIES.find(c => c.id === normalized || c.slug === normalized) || MARKETPLACE_CATEGORIES[0];
};

// Helper: Check if a category ID is valid
export const isValidCategory = (id) => {
  const normalized = normalizeCategoryId(id);
  return MARKETPLACE_CATEGORIES.some(c => c.id === normalized || c.slug === normalized);
};

// Helper: Get dashboard route for category
export const getCategoryDashboardRoute = (id) => {
  const cat = getCategoryById(id);
  return cat.dashboardPath || '/seller/dashboard';
};
