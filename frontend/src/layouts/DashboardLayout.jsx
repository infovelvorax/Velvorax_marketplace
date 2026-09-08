import { ScrollToTop } from '../components';
import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Sidebar } from '../components';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, DropdownDivider, DropdownHeader } from '../components';
import { ThemeToggle } from '../components/common/ThemeToggle';
import { NotificationBell } from '../components/common/NotificationBell';
import { AdminAIChatbot } from '../components/ai/AdminAIChatbot';
import { MarketplaceAI } from '../components/marketplace-ai';
import { ROUTES } from '../constants';
import { useAuth } from '../hooks/useAuth';
import { 
  MARKETPLACE_CATEGORIES, 
  getCategoryById, 
  normalizeCategoryId, 
  getCategoryDashboardRoute 
} from '../constants/categories';

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, activeCategory, availableCategories, switchCategory } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.HOME);
  };

  const handleCategorySwitch = async (newCat) => {
    const normalized = await switchCategory(newCat);
    if (location.pathname.startsWith('/seller')) {
      navigate(getCategoryDashboardRoute(normalized));
    }
  };

  const userRole = (user?.role || 'BUYER').toUpperCase();
  const currentCategoryMeta = getCategoryById(activeCategory || 'properties');

  let dashboardLinks = [];

  if (userRole === 'ADMIN') {
    dashboardLinks = [
      {
        label: 'Admin Overview',
        path: '/admin/dashboard',
        icon: (
          <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
          </svg>
        ),
      },
      {
        label: 'Seller Approvals',
        path: '/admin/sellers',
        icon: (
          <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        ),
      },
      {
        label: 'Buyer Directory',
        path: '/admin/buyers',
        icon: (
          <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        ),
      },
      {
        label: 'Listing Moderation',
        path: '/admin/moderation',
        icon: (
          <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        ),
      },
      {
        label: 'Marketplace Orders',
        path: '/admin/orders',
        icon: (
          <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
          </svg>
        ),
      },
      {
        label: 'All Users',
        path: '/admin/users',
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
          </svg>
        ),
      },
      {
        label: 'Reports',
        path: '/admin/reports',
        icon: (
          <svg className="w-5 h-5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        ),
      }
    ];
  } else if (userRole === 'SELLER') {
    dashboardLinks = [
      {
        label: 'Seller Overview',
        path: '/seller/dashboard',
        icon: (
          <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
          </svg>
        ),
      },
      {
        label: 'My Listings',
        path: '/seller/listings',
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        ),
      },
      {
        label: 'Buyer Contacts',
        path: '/seller/contacts',
        icon: (
          <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
          </svg>
        ),
      },
      {
        label: 'Messages',
        path: ROUTES.DASHBOARD.MESSAGES,
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        ),
      },
      {
        label: 'Notifications',
        path: ROUTES.DASHBOARD.NOTIFICATIONS,
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
        ),
      }
    ];
  } else {
    // BUYER & USER
    dashboardLinks = [
      {
        label: 'Buyer Overview',
        path: '/buyer/dashboard',
        icon: (
          <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
          </svg>
        ),
      },
      {
        label: 'My Purchases',
        path: '/buyer/purchases',
        icon: (
          <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        ),
      },
      {
        label: 'Contacted Sellers',
        path: '/buyer/contacts',
        icon: (
          <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
          </svg>
        ),
      },
      {
        label: 'Saved Wishlist',
        path: '/buyer/saved',
        icon: (
          <svg className="w-5 h-5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        ),
      },
      {
        label: 'Messages',
        path: ROUTES.DASHBOARD.MESSAGES,
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        ),
      },
      {
        label: 'Notifications',
        path: ROUTES.DASHBOARD.NOTIFICATIONS,
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
        ),
      }
    ];
  }

  const getProfileRoute = () => {
    if (userRole === 'ADMIN') return '/admin/profile';
    if (userRole === 'SELLER') return '/seller/profile';
    return '/buyer/profile';
  };

  const getSettingsRoute = () => {
    if (userRole === 'ADMIN') return '/admin/settings';
    if (userRole === 'SELLER') return '/seller/settings';
    return '/buyer/settings';
  };

  // Common Profile & Settings
  dashboardLinks.push(
    {
      label: 'Profile',
      path: getProfileRoute(),
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
      ),
    },
    {
      label: 'Settings',
      path: getSettingsRoute(),
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    }
  );

  const roleBadgeInfo = {
    ADMIN: { label: 'Admin Command', bg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20', icon: '🛡️' },
    SELLER: { label: 'Verified Seller', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: '📦' },
    BUYER: { label: 'Buyer Member', bg: 'bg-blue-500/10 text-blue-400 border-blue-500/20', icon: '🛍️' }
  }[userRole] || { label: 'Member', bg: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20', icon: '👤' };

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-200">
      <ScrollToTop />

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        links={dashboardLinks}
        user={user}
      />

      {/* Main Column */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top Glassmorphic Header */}
        <header className="h-[72px] sm:h-[76px] bg-[var(--bg-surface)]/85 backdrop-blur-md border-b border-[var(--border-primary)] px-4 sm:px-8 lg:px-10 flex items-center justify-between shrink-0 z-20 shadow-xs transition-colors duration-200">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
              className="lg:hidden p-2 rounded-xl text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors cursor-pointer shrink-0"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="flex items-center gap-2.5 truncate">
              <Link 
                to={ROUTES.HOME} 
                className="text-xs sm:text-sm font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1.5 transition-colors shrink-0"
              >
                <span>&larr;</span>
                <span className="hidden md:inline">Marketplace</span>
              </Link>
              <span className="text-[var(--text-muted)] hidden md:inline">/</span>
              
              {userRole === 'SELLER' ? (
                <div className="flex items-center gap-1.5 bg-[var(--bg-secondary)] border border-emerald-500/20 rounded-xl px-2.5 py-1 shadow-2xs">
                  <span className="text-xs">{currentCategoryMeta.icon}</span>
                  <select
                    value={activeCategory}
                    onChange={(e) => handleCategorySwitch(e.target.value)}
                    className="bg-transparent text-emerald-400 text-xs font-black focus:outline-none cursor-pointer pr-1"
                    title="Switch active marketplace sector"
                  >
                    {availableCategories.map(cat => (
                      <option key={cat.id} value={cat.id} className="bg-[var(--bg-surface)] text-[var(--text-primary)]">
                        {cat.icon} {cat.shortName}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <span className={`hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border ${roleBadgeInfo.bg}`}>
                  <span>{roleBadgeInfo.icon}</span>
                  <span>{roleBadgeInfo.label}</span>
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Notification Bell */}
            <NotificationBell />

            {/* Theme Toggle */}
            <ThemeToggle size="md" />

            {/* Post Listing CTA Button */}
            <Link 
              to={userRole === 'SELLER' ? `${ROUTES.POST_LISTING}?category=${activeCategory}` : ROUTES.POST_LISTING}
              className="px-3.5 sm:px-5 py-2 sm:py-2.5 bg-[var(--button-primary)] text-[var(--button-primary-text)] hover:bg-[var(--button-primary-hover)] font-bold text-xs sm:text-sm rounded-xl transition-all flex items-center gap-1.5 sm:gap-2 shadow-xs border border-[var(--button-primary)] cursor-pointer select-none active:scale-95"
            >
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <span className="hidden sm:inline">Post Listing</span>
              <span className="sm:hidden">Post</span>
            </Link>

            {/* Profile Dropdown */}
            <Dropdown align="right">
              <DropdownTrigger>
                <div className="flex items-center gap-2 p-1 rounded-xl hover:bg-[var(--bg-secondary)] transition-colors cursor-pointer border border-transparent hover:border-[var(--border-primary)]">
                  <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white font-black flex items-center justify-center text-xs sm:text-sm uppercase shadow-xs">
                    {user?.name?.[0] || 'U'}
                  </div>
                  <span className="hidden md:inline text-xs sm:text-sm font-bold text-[var(--text-primary)] max-w-[120px] truncate">
                    {user?.name || 'Account'}
                  </span>
                  <svg className="w-3.5 h-3.5 text-[var(--text-muted)] hidden sm:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </DropdownTrigger>

              <DropdownMenu width="w-56">
                <DropdownHeader>{user?.email}</DropdownHeader>
                <DropdownItem onClick={() => navigate(getProfileRoute())}>
                  👤 Profile Overview
                </DropdownItem>
                <DropdownItem onClick={() => navigate(getSettingsRoute())}>
                  ⚙️ Account Settings
                </DropdownItem>
                <DropdownItem onClick={() => navigate(ROUTES.DASHBOARD.MESSAGES)}>
                  💬 Messages
                </DropdownItem>
                <DropdownDivider />
                <DropdownItem danger onClick={handleLogout}>
                  🚪 Sign Out
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-7 lg:p-10 bg-[var(--bg-primary)]">
          <Outlet />
        </main>
      </div>

      {/* Route-Based AI Assistants Rendering */}
      {location.pathname.startsWith('/admin') && userRole === 'ADMIN' ? (
        <AdminAIChatbot />
      ) : (
        <MarketplaceAI />
      )}
    </div>
  );
}

export default DashboardLayout;
