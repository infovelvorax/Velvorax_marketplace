import React from 'react';
import { 
  MarketplaceHome,
  Categories,
  Properties,
  PropertyDetails,
  Vehicles,
  Products,
  Jobs,
  Services,
  Agriculture,
  Businesses,
  Rentals,
  FreeGiveaways,
  PostListing,
  Search,
  ListingDetails,
  NotFound,
  Login,
  Register,
  ForgotPassword,
  ResetPassword,
  VerifyOTP,
  Unauthorized,
  DashboardOverview,
  MyListings,
  MyApplications,
  MyBookings,
  Profile,
  Settings,
  ChangePassword,
  Favorites,
  Messages,
  Notifications,
  AdminDashboard,
  AdminModeration,
  AdminUsers,
  AdminReports,
  AdminSellers,
  AdminBuyers,
  AdminOrders,
  SellerDashboard,
  SellerListings,
  SellerContacts,
  SellerOrders,
  BuyerDashboard,
  BuyerPurchases,
  BuyerContacts,
  BuyerSaved
} from '../pages';
import { ROUTES } from '../constants';
import { ProtectedRoute, GuestRoute } from '../components/common';

export const routesConfig = [
  // --- Marketplace Public Routes ---
  {
    path: ROUTES.HOME,
    index: true,
    element: <MarketplaceHome />,
    layout: 'main',
    title: 'Velvorax Marketplace',
  },
  {
    path: ROUTES.CATEGORIES,
    element: <Categories />,
    layout: 'main',
    title: 'All Categories',
  },
  {
    path: ROUTES.PROPERTIES,
    element: <Properties />,
    layout: 'main',
    title: 'Properties',
  },
  {
    path: ROUTES.PROPERTY_DETAILS,
    element: <PropertyDetails />,
    layout: 'main',
    title: 'Property Details',
  },
  {
    path: ROUTES.VEHICLES,
    element: <Vehicles />,
    layout: 'main',
    title: 'Vehicles',
  },
  {
    path: ROUTES.PRODUCTS,
    element: <Products />,
    layout: 'main',
    title: 'Products',
  },
  {
    path: ROUTES.JOBS,
    element: <Jobs />,
    layout: 'main',
    title: 'Jobs',
  },
  {
    path: ROUTES.SERVICES,
    element: <Services />,
    layout: 'main',
    title: 'Services',
  },
  {
    path: ROUTES.FARM,
    element: <Agriculture />,
    layout: 'main',
    title: 'Agriculture & Farm',
  },
  {
    path: ROUTES.BUSINESSES,
    element: <Businesses />,
    layout: 'main',
    title: 'Business Directory',
  },
  {
    path: ROUTES.RENTALS,
    element: <Rentals />,
    layout: 'main',
    title: 'Rentals & Leasing',
  },
  {
    path: ROUTES.FREE,
    element: <FreeGiveaways />,
    layout: 'main',
    title: 'Free Giveaways',
  },
  {
    path: ROUTES.POST_LISTING,
    element: (
      <ProtectedRoute>
        <PostListing />
      </ProtectedRoute>
    ),
    layout: 'main',
    title: 'Post Listing',
  },
  {
    path: ROUTES.SEARCH,
    element: <Search />,
    layout: 'main',
    title: 'Search Results',
  },
  {
    path: ROUTES.LISTING_DETAILS,
    element: <ListingDetails />,
    layout: 'main',
    title: 'Listing Details',
  },
  {
    path: ROUTES.UNAUTHORIZED,
    element: <Unauthorized />,
    layout: 'main',
    title: 'Unauthorized',
  },

  // --- Auth Routes (Guest Only) ---
  {
    path: ROUTES.AUTH.LOGIN,
    element: <GuestRoute><Login /></GuestRoute>,
    layout: 'auth',
    title: 'Sign In',
  },
  {
    path: ROUTES.AUTH.REGISTER,
    element: <GuestRoute><Register /></GuestRoute>,
    layout: 'auth',
    title: 'Register',
  },
  {
    path: ROUTES.AUTH.FORGOT_PASSWORD,
    element: <GuestRoute><ForgotPassword /></GuestRoute>,
    layout: 'auth',
    title: 'Forgot Password',
  },
  {
    path: ROUTES.AUTH.RESET_PASSWORD,
    element: <GuestRoute><ResetPassword /></GuestRoute>,
    layout: 'auth',
    title: 'Reset Password',
  },
  {
    path: ROUTES.AUTH.VERIFY_OTP,
    element: <GuestRoute><VerifyOTP /></GuestRoute>,
    layout: 'auth',
    title: 'Verify OTP',
  },

  // ==========================================
  // --- ADMIN PORTAL ROUTES (ADMIN ONLY) ---
  // ==========================================
  {
    path: '/admin',
    element: (
      <ProtectedRoute allowedRoles={['ADMIN']}>
        <AdminDashboard />
      </ProtectedRoute>
    ),
    layout: 'dashboard',
    title: 'Admin Dashboard',
  },
  {
    path: '/admin/dashboard',
    element: (
      <ProtectedRoute allowedRoles={['ADMIN']}>
        <AdminDashboard />
      </ProtectedRoute>
    ),
    layout: 'dashboard',
    title: 'Admin Dashboard',
  },
  {
    path: '/admin/sellers',
    element: (
      <ProtectedRoute allowedRoles={['ADMIN']}>
        <AdminSellers />
      </ProtectedRoute>
    ),
    layout: 'dashboard',
    title: 'Seller Approvals & Management',
  },
  {
    path: '/admin/buyers',
    element: (
      <ProtectedRoute allowedRoles={['ADMIN']}>
        <AdminBuyers />
      </ProtectedRoute>
    ),
    layout: 'dashboard',
    title: 'Buyer Management',
  },
  {
    path: '/admin/moderation',
    element: (
      <ProtectedRoute allowedRoles={['ADMIN']}>
        <AdminModeration />
      </ProtectedRoute>
    ),
    layout: 'dashboard',
    title: 'Admin Moderation',
  },
  {
    path: '/admin/orders',
    element: (
      <ProtectedRoute allowedRoles={['ADMIN']}>
        <AdminOrders />
      </ProtectedRoute>
    ),
    layout: 'dashboard',
    title: 'Marketplace Orders & Transactions',
  },
  {
    path: '/admin/users',
    element: (
      <ProtectedRoute allowedRoles={['ADMIN']}>
        <AdminUsers />
      </ProtectedRoute>
    ),
    layout: 'dashboard',
    title: 'Admin Users',
  },
  {
    path: '/admin/reports',
    element: (
      <ProtectedRoute allowedRoles={['ADMIN']}>
        <AdminReports />
      </ProtectedRoute>
    ),
    layout: 'dashboard',
    title: 'Admin Reports',
  },
  {
    path: '/admin/profile',
    element: (
      <ProtectedRoute allowedRoles={['ADMIN']}>
        <Profile />
      </ProtectedRoute>
    ),
    layout: 'dashboard',
    title: 'Admin Profile',
  },
  {
    path: '/admin/settings',
    element: (
      <ProtectedRoute allowedRoles={['ADMIN']}>
        <Settings />
      </ProtectedRoute>
    ),
    layout: 'dashboard',
    title: 'Admin Settings',
  },
  {
    path: '/admin/seller-verification',
    element: (
      <ProtectedRoute allowedRoles={['ADMIN']}>
        <AdminSellers />
      </ProtectedRoute>
    ),
    layout: 'dashboard',
    title: 'Seller Verification',
  },
  {
    path: '/admin/listings',
    element: (
      <ProtectedRoute allowedRoles={['ADMIN']}>
        <AdminModeration />
      </ProtectedRoute>
    ),
    layout: 'dashboard',
    title: 'Listings Moderation',
  },
  {
    path: '/admin/pending-approvals',
    element: (
      <ProtectedRoute allowedRoles={['ADMIN']}>
        <AdminModeration />
      </ProtectedRoute>
    ),
    layout: 'dashboard',
    title: 'Pending Approvals',
  },
  {
    path: '/admin/complaints',
    element: (
      <ProtectedRoute allowedRoles={['ADMIN']}>
        <AdminReports />
      </ProtectedRoute>
    ),
    layout: 'dashboard',
    title: 'Reports & Complaints',
  },
  {
    path: '/admin/categories',
    element: (
      <ProtectedRoute allowedRoles={['ADMIN']}>
        <AdminModeration />
      </ProtectedRoute>
    ),
    layout: 'dashboard',
    title: 'Category Moderation',
  },
  {
    path: '/admin/properties',
    element: (
      <ProtectedRoute allowedRoles={['ADMIN']}>
        <AdminModeration />
      </ProtectedRoute>
    ),
    layout: 'dashboard',
    title: 'Properties Moderation',
  },

  // ==========================================
  // --- SELLER PORTAL ROUTES (SELLER ONLY) ---
  // ==========================================
  {
    path: '/seller',
    element: (
      <ProtectedRoute allowedRoles={['SELLER']}>
        <SellerDashboard />
      </ProtectedRoute>
    ),
    layout: 'dashboard',
    title: 'Seller Dashboard',
  },
  {
    path: '/seller/dashboard',
    element: (
      <ProtectedRoute allowedRoles={['SELLER']}>
        <SellerDashboard />
      </ProtectedRoute>
    ),
    layout: 'dashboard',
    title: 'Seller Dashboard',
  },
  {
    path: '/seller/:category/dashboard',
    element: (
      <ProtectedRoute allowedRoles={['SELLER']}>
        <SellerDashboard />
      </ProtectedRoute>
    ),
    layout: 'dashboard',
    title: 'Sector Seller Dashboard',
  },
  {
    path: '/seller/properties/dashboard',
    element: (
      <ProtectedRoute allowedRoles={['SELLER']}>
        <SellerDashboard />
      </ProtectedRoute>
    ),
    layout: 'dashboard',
    title: 'Properties Seller Hub',
  },
  {
    path: '/seller/vehicles/dashboard',
    element: (
      <ProtectedRoute allowedRoles={['SELLER']}>
        <SellerDashboard />
      </ProtectedRoute>
    ),
    layout: 'dashboard',
    title: 'Vehicles Seller Hub',
  },
  {
    path: '/seller/products/dashboard',
    element: (
      <ProtectedRoute allowedRoles={['SELLER']}>
        <SellerDashboard />
      </ProtectedRoute>
    ),
    layout: 'dashboard',
    title: 'Electronics & Products Hub',
  },
  {
    path: '/seller/services/dashboard',
    element: (
      <ProtectedRoute allowedRoles={['SELLER']}>
        <SellerDashboard />
      </ProtectedRoute>
    ),
    layout: 'dashboard',
    title: 'Services Hub',
  },
  {
    path: '/seller/jobs/dashboard',
    element: (
      <ProtectedRoute allowedRoles={['SELLER']}>
        <SellerDashboard />
      </ProtectedRoute>
    ),
    layout: 'dashboard',
    title: 'Jobs & Careers Hub',
  },
  {
    path: '/seller/farm/dashboard',
    element: (
      <ProtectedRoute allowedRoles={['SELLER']}>
        <SellerDashboard />
      </ProtectedRoute>
    ),
    layout: 'dashboard',
    title: 'Agriculture & Farm Hub',
  },
  {
    path: '/seller/agriculture/dashboard',
    element: (
      <ProtectedRoute allowedRoles={['SELLER']}>
        <SellerDashboard />
      </ProtectedRoute>
    ),
    layout: 'dashboard',
    title: 'Agriculture & Farm Hub',
  },
  {
    path: '/seller/businesses/dashboard',
    element: (
      <ProtectedRoute allowedRoles={['SELLER']}>
        <SellerDashboard />
      </ProtectedRoute>
    ),
    layout: 'dashboard',
    title: 'Business Directory Hub',
  },
  {
    path: '/seller/rentals/dashboard',
    element: (
      <ProtectedRoute allowedRoles={['SELLER']}>
        <SellerDashboard />
      </ProtectedRoute>
    ),
    layout: 'dashboard',
    title: 'Rentals & Leasing Hub',
  },
  {
    path: '/seller/free/dashboard',
    element: (
      <ProtectedRoute allowedRoles={['SELLER']}>
        <SellerDashboard />
      </ProtectedRoute>
    ),
    layout: 'dashboard',
    title: 'Community Giveaways Hub',
  },
  {
    path: '/seller/listings',
    element: (
      <ProtectedRoute allowedRoles={['SELLER']}>
        <SellerListings />
      </ProtectedRoute>
    ),
    layout: 'dashboard',
    title: 'Seller Listings',
  },
  {
    path: '/seller/contacts',
    element: (
      <ProtectedRoute allowedRoles={['SELLER']}>
        <SellerContacts />
      </ProtectedRoute>
    ),
    layout: 'dashboard',
    title: 'Buyer Inquiries & Contacts',
  },
  {
    path: '/seller/orders',
    element: (
      <ProtectedRoute allowedRoles={['SELLER']}>
        <SellerOrders />
      </ProtectedRoute>
    ),
    layout: 'dashboard',
    title: 'Sales & Customer Orders',
  },
  {
    path: '/seller/profile',
    element: (
      <ProtectedRoute allowedRoles={['SELLER']}>
        <Profile />
      </ProtectedRoute>
    ),
    layout: 'dashboard',
    title: 'Merchant Profile',
  },
  {
    path: '/seller/settings',
    element: (
      <ProtectedRoute allowedRoles={['SELLER']}>
        <Settings />
      </ProtectedRoute>
    ),
    layout: 'dashboard',
    title: 'Seller Settings',
  },
  {
    path: '/seller/add-listing',
    element: (
      <ProtectedRoute allowedRoles={['SELLER']}>
        <PostListing />
      </ProtectedRoute>
    ),
    layout: 'dashboard',
    title: 'Add New Listing',
  },
  {
    path: '/seller/pending',
    element: (
      <ProtectedRoute allowedRoles={['SELLER']}>
        <SellerListings />
      </ProtectedRoute>
    ),
    layout: 'dashboard',
    title: 'Pending Listings',
  },
  {
    path: '/seller/approved',
    element: (
      <ProtectedRoute allowedRoles={['SELLER']}>
        <SellerListings />
      </ProtectedRoute>
    ),
    layout: 'dashboard',
    title: 'Approved Listings',
  },
  {
    path: '/seller/rejected',
    element: (
      <ProtectedRoute allowedRoles={['SELLER']}>
        <SellerListings />
      </ProtectedRoute>
    ),
    layout: 'dashboard',
    title: 'Rejected Listings',
  },
  {
    path: '/seller/sales',
    element: (
      <ProtectedRoute allowedRoles={['SELLER']}>
        <SellerOrders />
      </ProtectedRoute>
    ),
    layout: 'dashboard',
    title: 'Sales & Invoices',
  },
  {
    path: '/seller/messages',
    element: (
      <ProtectedRoute allowedRoles={['SELLER']}>
        <Messages />
      </ProtectedRoute>
    ),
    layout: 'dashboard',
    title: 'Seller Inquiries & Messages',
  },

  // ==========================================
  // --- BUYER PORTAL ROUTES (BUYER ONLY) ---
  // ==========================================
  {
    path: '/buyer',
    element: (
      <ProtectedRoute allowedRoles={['BUYER', 'USER']}>
        <BuyerDashboard />
      </ProtectedRoute>
    ),
    layout: 'dashboard',
    title: 'Buyer Dashboard',
  },
  {
    path: '/buyer/dashboard',
    element: (
      <ProtectedRoute allowedRoles={['BUYER', 'USER']}>
        <BuyerDashboard />
      </ProtectedRoute>
    ),
    layout: 'dashboard',
    title: 'Buyer Dashboard',
  },
  {
    path: '/buyer/purchases',
    element: (
      <ProtectedRoute allowedRoles={['BUYER', 'USER']}>
        <BuyerPurchases />
      </ProtectedRoute>
    ),
    layout: 'dashboard',
    title: 'My Purchases',
  },
  {
    path: '/buyer/contacts',
    element: (
      <ProtectedRoute allowedRoles={['BUYER', 'USER']}>
        <BuyerContacts />
      </ProtectedRoute>
    ),
    layout: 'dashboard',
    title: 'Contacted Sellers',
  },
  {
    path: '/buyer/saved',
    element: (
      <ProtectedRoute allowedRoles={['BUYER', 'USER']}>
        <BuyerSaved />
      </ProtectedRoute>
    ),
    layout: 'dashboard',
    title: 'Saved Wishlist',
  },
  {
    path: '/buyer/messages',
    element: (
      <ProtectedRoute allowedRoles={['BUYER', 'USER']}>
        <Messages />
      </ProtectedRoute>
    ),
    layout: 'dashboard',
    title: 'Buyer Messages',
  },
  {
    path: '/buyer/profile',
    element: (
      <ProtectedRoute allowedRoles={['BUYER', 'USER']}>
        <Profile />
      </ProtectedRoute>
    ),
    layout: 'dashboard',
    title: 'Buyer Profile',
  },
  {
    path: '/buyer/settings',
    element: (
      <ProtectedRoute allowedRoles={['BUYER', 'USER']}>
        <Settings />
      </ProtectedRoute>
    ),
    layout: 'dashboard',
    title: 'Buyer Settings',
  },


  // --- General Dashboard Routes (Universal & Aliases) ---
  {
    path: ROUTES.DASHBOARD.ROOT,
    element: (
      <ProtectedRoute>
        <DashboardOverview />
      </ProtectedRoute>
    ),
    layout: 'dashboard',
    title: 'Dashboard',
  },
  {
    path: '/dashboard/my-listings',
    element: (
      <ProtectedRoute allowedRoles={['SELLER', 'ADMIN']}>
        <SellerListings />
      </ProtectedRoute>
    ),
    layout: 'dashboard',
    title: 'My Listings',
  },
  {
    path: '/dashboard/orders',
    element: (
      <ProtectedRoute allowedRoles={['SELLER', 'ADMIN']}>
        <SellerOrders />
      </ProtectedRoute>
    ),
    layout: 'dashboard',
    title: 'Sales & Orders',
  },
  {
    path: '/dashboard/purchases',
    element: (
      <ProtectedRoute allowedRoles={['BUYER', 'USER', 'ADMIN']}>
        <BuyerPurchases />
      </ProtectedRoute>
    ),
    layout: 'dashboard',
    title: 'My Purchases',
  },
  {
    path: '/dashboard/applications',
    element: (
      <ProtectedRoute>
        <MyApplications />
      </ProtectedRoute>
    ),
    layout: 'dashboard',
    title: 'Job Applications',
  },
  {
    path: '/dashboard/bookings',
    element: (
      <ProtectedRoute>
        <MyBookings />
      </ProtectedRoute>
    ),
    layout: 'dashboard',
    title: 'Service Bookings',
  },
  {
    path: ROUTES.PROFILE,
    element: (
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    ),
    layout: 'dashboard',
    title: 'Profile',
  },
  {
    path: '/dashboard/profile',
    element: (
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    ),
    layout: 'dashboard',
    title: 'Profile',
  },
  {
    path: '/settings',
    element: (
      <ProtectedRoute>
        <Settings />
      </ProtectedRoute>
    ),
    layout: 'dashboard',
    title: 'Settings',
  },
  {
    path: '/dashboard/settings',
    element: (
      <ProtectedRoute>
        <Settings />
      </ProtectedRoute>
    ),
    layout: 'dashboard',
    title: 'Settings',
  },
  {
    path: ROUTES.DASHBOARD.CHANGE_PASSWORD,
    element: (
      <ProtectedRoute>
        <ChangePassword />
      </ProtectedRoute>
    ),
    layout: 'dashboard',
    title: 'Change Password',
  },
  {
    path: '/change-password',
    element: (
      <ProtectedRoute>
        <ChangePassword />
      </ProtectedRoute>
    ),
    layout: 'dashboard',
    title: 'Change Password',
  },
  {
    path: '/favorites',
    element: (
      <ProtectedRoute allowedRoles={['BUYER', 'USER', 'ADMIN']}>
        <BuyerSaved />
      </ProtectedRoute>
    ),
    layout: 'dashboard',
    title: 'Saved Wishlist',
  },
  {
    path: '/dashboard/favorites',
    element: (
      <ProtectedRoute allowedRoles={['BUYER', 'USER', 'ADMIN']}>
        <BuyerSaved />
      </ProtectedRoute>
    ),
    layout: 'dashboard',
    title: 'Saved Wishlist',
  },
  {
    path: '/messages',
    element: (
      <ProtectedRoute>
        <Messages />
      </ProtectedRoute>
    ),
    layout: 'dashboard',
    title: 'Messages & Inquiries',
  },
  {
    path: '/dashboard/messages',
    element: (
      <ProtectedRoute>
        <Messages />
      </ProtectedRoute>
    ),
    layout: 'dashboard',
    title: 'Messages & Inquiries',
  },
  {
    path: '/notifications',
    element: (
      <ProtectedRoute>
        <Notifications />
      </ProtectedRoute>
    ),
    layout: 'dashboard',
    title: 'Notifications',
  },
  {
    path: '/dashboard/notifications',
    element: (
      <ProtectedRoute>
        <Notifications />
      </ProtectedRoute>
    ),
    layout: 'dashboard',
    title: 'Notifications',
  },
  
  // --- Fallback ---
  {
    path: ROUTES.NOT_FOUND,
    element: <NotFound />,
    layout: 'main',
    title: 'Not Found',
  },
];

export default routesConfig;
