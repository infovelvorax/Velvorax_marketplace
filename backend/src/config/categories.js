export const MARKETPLACE_CATEGORIES = [
  'properties',
  'vehicles',
  'products',
  'services',
  'jobs',
  'farm',
  'businesses',
  'rentals',
  'free',
  'general'
];

export const DEFAULT_MARKETPLACE_CATEGORY = 'properties';

const CATEGORY_ALIASES = {
  property: 'properties',
  realestate: 'properties',
  real_estate: 'properties',
  housing: 'properties',
  vehicle: 'vehicles',
  cars: 'vehicles',
  motors: 'vehicles',
  auto: 'vehicles',
  automotive: 'vehicles',
  product: 'products',
  goods: 'products',
  electronics: 'products',
  service: 'services',
  job: 'jobs',
  careers: 'jobs',
  employment: 'jobs',
  farming: 'farm',
  agriculture: 'farm',
  agri: 'farm',
  business: 'businesses',
  commercial: 'businesses',
  rental: 'rentals',
  rent: 'rentals',
  giveaway: 'free'
};

export const normalizeCategorySlug = (category) => {
  if (!category || typeof category !== 'string') return DEFAULT_MARKETPLACE_CATEGORY;
  const cleaned = category.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
  if (MARKETPLACE_CATEGORIES.includes(cleaned)) return cleaned;
  if (CATEGORY_ALIASES[cleaned]) return CATEGORY_ALIASES[cleaned];
  return DEFAULT_MARKETPLACE_CATEGORY;
};
