/**
 * Centralized application route constants with strict role isolation
 */
export const ROUTES = {
  HOME: '/',
  // Marketplace Categories
  CATEGORIES: '/categories',
  PROPERTIES: '/properties',
  PROPERTY_DETAILS: '/properties/:id',
  VEHICLES: '/vehicles',
  VEHICLE_DETAILS: '/vehicles/:id',
  PRODUCTS: '/products',
  PRODUCT_DETAILS: '/products/:id',
  JOBS: '/jobs',
  JOB_DETAILS: '/jobs/:id',
  SERVICES: '/services',
  SERVICE_DETAILS: '/services/:id',
  FARM: '/farm',
  FARM_DETAILS: '/farm/:id',
  BUSINESSES: '/businesses',
  BUSINESS_DETAILS: '/businesses/:id',
  RENTALS: '/rentals',
  FREE: '/free',
  
  // Core Marketplace Flows
  SEARCH: '/search',
  POST_LISTING: '/post-listing',
  LISTING_DETAILS: '/listing/:id',

  // Corporate & Static
  ABOUT: '/about',
  CONTACT: '/contact',
  FAQ: '/faq',
  BLOG: '/blog',
  CAREERS: '/careers',
  
  // Auth
  AUTH: {
    LOGIN: '/login',
    REGISTER: '/register',
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD: '/reset-password',
    VERIFY_OTP: '/verify-otp',
  },
  UNAUTHORIZED: '/unauthorized',
  
  // Role-Isolated Portals
  BUYER: {
    DASHBOARD: '/buyer/dashboard',
    PURCHASES: '/buyer/purchases',
    SAVED: '/buyer/saved',
    CONTACTS: '/buyer/contacts',
  },
  
  SELLER: {
    DASHBOARD: '/seller/dashboard',
    LISTINGS: '/seller/listings',
    ORDERS: '/seller/orders',
    CONTACTS: '/seller/contacts',
  },

  ADMIN: {
    ROOT: '/admin',
    DASHBOARD: '/admin',
    SELLERS: '/admin/sellers',
    MODERATION: '/admin/moderation',
    BUYERS: '/admin/buyers',
    ORDERS: '/admin/orders',
    USERS: '/admin/users',
    REPORTS: '/admin/reports',
    VERIFICATION: '/admin/verification',
    CATEGORIES: '/admin/categories',
    LISTINGS: '/admin/moderation',
  },

  // User Profile & Universal Dashboard Utilities
  PROFILE: '/profile',
  SETTINGS: '/settings',
  DASHBOARD: {
    ROOT: '/dashboard',
    SETTINGS: '/settings',
    PROFILE: '/profile',
    MY_LISTINGS: '/seller/listings',
    ORDERS: '/seller/orders',
    PURCHASES: '/buyer/purchases',
    FAVORITES: '/buyer/saved',
    MESSAGES: '/dashboard/messages',
    NOTIFICATIONS: '/dashboard/notifications',
    APPLICATIONS: '/dashboard/applications',
    BOOKINGS: '/dashboard/bookings',
    CHANGE_PASSWORD: '/dashboard/change-password',
  },
  
  NOT_FOUND: '*',
};

export default ROUTES;

