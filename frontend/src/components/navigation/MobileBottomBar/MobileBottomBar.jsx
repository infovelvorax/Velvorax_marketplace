import './MobileBottomBar.css';
import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { ROUTES } from '../../../constants';
import { cn } from '../../../utils';

export function MobileBottomBar({ onOpenCategories }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  // Hide bottom bar on single item details pages to let the sticky contact CTA take full focus
  const isDetailsPage = 
    location.pathname.startsWith('/listing/') || 
    (location.pathname.startsWith('/properties/') && location.pathname !== '/properties');

  if (isDetailsPage) {
    return null;
  }

  const userRole = (user?.role || 'BUYER').toUpperCase();

  const getDashboardPath = () => {
    if (!isAuthenticated) return ROUTES.AUTH.LOGIN;
    if (userRole === 'ADMIN') return '/admin/dashboard';
    if (userRole === 'SELLER') return '/seller/dashboard';
    return '/buyer/dashboard';
  };

  const isHomeActive = location.pathname === ROUTES.HOME;
  const isCategoriesActive = 
    location.pathname === ROUTES.CATEGORIES ||
    ['/properties', '/vehicles', '/products', '/jobs', '/services', '/farm', '/businesses', '/rentals', '/free'].includes(location.pathname);
  const isPostActive = location.pathname === ROUTES.POST_LISTING;
  const isSavedActive = location.pathname === '/buyer/saved' || location.pathname === ROUTES.DASHBOARD.FAVORITES;
  const isAccountActive = 
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/seller') ||
    location.pathname.startsWith('/buyer') ||
    location.pathname.startsWith('/dashboard') ||
    location.pathname.startsWith('/profile') ||
    location.pathname.startsWith('/auth') ||
    location.pathname === ROUTES.AUTH.LOGIN;

  const handleCategoriesClick = (e) => {
    if (onOpenCategories) {
      e.preventDefault();
      onOpenCategories();
    }
  };

  return (
    <nav 
      aria-label="Mobile Bottom Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--bg-surface)]/95 backdrop-blur-xl border-t border-[var(--border-primary)] shadow-2xl transition-colors duration-200 mobile-bottom-bar-safe"
    >
      <div className="grid grid-cols-5 h-[62px] items-center px-1">
        
        {/* 1. Home Tab */}
        <NavLink
          to={ROUTES.HOME}
          className={cn(
            "flex flex-col items-center justify-center h-full py-1 text-center transition-all select-none cursor-pointer active:scale-95 group",
            isHomeActive 
              ? "text-[var(--button-primary)] font-black" 
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          )}
        >
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center transition-all",
            isHomeActive ? "bg-[var(--accent)]/10 text-[var(--accent)]" : ""
          )}>
            <svg className="w-5 h-5" fill={isHomeActive ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isHomeActive ? "2.5" : "2"}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
          </div>
          <span className="text-[10px] tracking-tight leading-none mt-0.5">Home</span>
        </NavLink>

        {/* 2. Categories Tab */}
        <button
          type="button"
          onClick={handleCategoriesClick}
          className={cn(
            "flex flex-col items-center justify-center h-full py-1 text-center transition-all select-none cursor-pointer active:scale-95 group",
            isCategoriesActive 
              ? "text-[var(--button-primary)] font-black" 
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          )}
        >
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center transition-all",
            isCategoriesActive ? "bg-[var(--accent)]/10 text-[var(--accent)]" : ""
          )}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isCategoriesActive ? "2.5" : "2"}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
            </svg>
          </div>
          <span className="text-[10px] tracking-tight leading-none mt-0.5">Explore</span>
        </button>

        {/* 3. CENTER RAISED POST BUTTON */}
        <div className="flex flex-col items-center justify-center -mt-4">
          <NavLink
            to={ROUTES.POST_LISTING}
            className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-500/35 border-2 border-[var(--bg-surface)] active:scale-90 transition-transform cursor-pointer"
            aria-label="Post Listing"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </NavLink>
          <span className="text-[10px] font-black text-[var(--accent)] tracking-tight mt-0.5">Sell / Post</span>
        </div>

        {/* 4. Saved / Wishlist Tab */}
        <NavLink
          to={isAuthenticated ? "/buyer/saved" : ROUTES.AUTH.LOGIN}
          className={cn(
            "flex flex-col items-center justify-center h-full py-1 text-center transition-all select-none cursor-pointer active:scale-95 group",
            isSavedActive 
              ? "text-[var(--button-primary)] font-black" 
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          )}
        >
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center transition-all",
            isSavedActive ? "bg-rose-500/10 text-rose-500" : ""
          )}>
            <svg className="w-5 h-5" fill={isSavedActive ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isSavedActive ? "2.5" : "2"}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
          </div>
          <span className="text-[10px] tracking-tight leading-none mt-0.5">Saved</span>
        </NavLink>

        {/* 5. Account / Dashboard Tab */}
        <NavLink
          to={getDashboardPath()}
          className={cn(
            "flex flex-col items-center justify-center h-full py-1 text-center transition-all select-none cursor-pointer active:scale-95 group",
            isAccountActive 
              ? "text-[var(--button-primary)] font-black" 
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          )}
        >
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center transition-all",
            isAccountActive ? "bg-[var(--accent)]/10 text-[var(--accent)]" : ""
          )}>
            {isAuthenticated ? (
              <div className="w-5 h-5 rounded-full bg-[var(--accent)] text-white text-[10px] font-black flex items-center justify-center uppercase shadow-2xs">
                {user?.name?.[0] || 'U'}
              </div>
            ) : (
              <svg className="w-5 h-5" fill={isAccountActive ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isAccountActive ? "2.5" : "2"}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            )}
          </div>
          <span className="text-[10px] tracking-tight leading-none mt-0.5">
            {isAuthenticated ? 'Account' : 'Sign In'}
          </span>
        </NavLink>

      </div>
    </nav>
  );
}

export default MobileBottomBar;
