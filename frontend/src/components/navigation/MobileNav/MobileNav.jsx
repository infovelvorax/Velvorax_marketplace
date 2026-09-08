import './MobileNav.css';
import React, { useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { cn } from '../../../utils';
import { ThemeToggle } from '../../common/ThemeToggle';
import { BrandLogo } from '../../common/BrandLogo';
import { NotificationBell } from '../../common/NotificationBell';
import { ROUTES } from '../../../constants';
import { useAuth } from '../../../hooks/useAuth';

export function MobileNav({
  isOpen,
  onClose,
  className,
}) {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const categories = [
    { label: 'All Categories', path: ROUTES.CATEGORIES, icon: '📦' },
    { label: 'Properties & Real Estate', path: ROUTES.PROPERTIES, icon: '🏢' },
    { label: 'Cars, Bikes & Vehicles', path: ROUTES.VEHICLES, icon: '🚗' },
    { label: 'Mobiles & Electronics', path: ROUTES.PRODUCTS, icon: '📱' },
    { label: 'Jobs & Careers', path: ROUTES.JOBS, icon: '💼' },
    { label: 'Local Services', path: ROUTES.SERVICES, icon: '🛠️' },
    { label: 'Agriculture & Farm', path: ROUTES.FARM, icon: '🌾' },
    { label: 'Business Directory', path: ROUTES.BUSINESSES, icon: '🏬' },
    { label: 'Rentals & Leasing', path: ROUTES.RENTALS, icon: '🔑' },
    { label: 'Free Giveaways', path: ROUTES.FREE, icon: '🎁', badge: '100% Free' },
  ];

  const handleLogout = async () => {
    onClose?.();
    await logout();
    navigate(ROUTES.HOME);
  };

  return (
    <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 w-full max-w-xs sm:max-w-sm bg-[var(--bg-surface)] border-r border-[var(--border-primary)] shadow-2xl z-10 flex flex-col',
          'transform transition-transform duration-300 ease-in-out animate-slide-right text-[var(--text-primary)]',
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 h-20 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
          <Link
            to={ROUTES.HOME}
            onClick={onClose}
            className="flex items-center gap-2.5 group"
          >
            <BrandLogo 
              height={36} 
              className="h-[36px] transition-transform group-hover:scale-[1.03]" 
            />
            <div className="flex flex-col justify-center">
              <span className="text-[var(--text-primary)] font-black uppercase tracking-wide text-[18px] leading-none">
                VELVORAX
              </span>
              <span className="text-[var(--text-muted)] uppercase text-[9px] font-bold tracking-widest mt-1 leading-none">
                MARKETPLACE
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-1.5">
            <NotificationBell />
            <ThemeToggle size="sm" />
            <button
              type="button"
              onClick={onClose}
              aria-label="Close navigation menu"
              className="rounded-xl p-2 text-[var(--text-muted)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* User Status Bar or Sign In CTA */}
        <div className="px-5 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
          {isAuthenticated ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-[var(--bg-surface)] text-[var(--accent)] font-black text-sm flex items-center justify-center uppercase border border-[var(--border-primary)] shrink-0">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-[14px] text-[var(--text-primary)] truncate">{user?.name}</div>
                  <div className="text-[11px] text-[var(--text-secondary)] truncate">{user?.email}</div>
                </div>
              </div>
              <Link
                to={user?.role === 'ADMIN' ? '/admin' : user?.role === 'SELLER' ? '/seller/dashboard' : '/buyer/dashboard'}
                onClick={onClose}
                className="text-[12px] font-bold text-[var(--accent)] hover:underline shrink-0"
              >
                Dashboard &rarr;
              </Link>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3">
              <span className="text-[13px] text-[var(--text-secondary)] font-medium">Welcome to Velvorax</span>
              <Link
                to={ROUTES.AUTH.LOGIN}
                onClick={onClose}
                className="px-4 py-2 bg-[var(--button-primary)] text-[var(--button-primary-text)] border border-[var(--button-primary)] text-[13px] font-bold rounded-xl transition-colors"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>

        {/* Primary Post Listing CTA */}
        <div className="p-4 border-b border-[var(--border-subtle)]">
          <Link
            to={ROUTES.POST_LISTING}
            onClick={onClose}
            className="w-full flex items-center justify-center gap-2 bg-[var(--button-primary)] text-[var(--button-primary-text)] hover:bg-[var(--button-primary-hover)] h-[48px] rounded-xl font-bold text-[15px] border border-[var(--button-primary)] shadow-xs transition-all"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span>+ Post New Listing</span>
          </Link>
        </div>

        {/* Categories List (Touch friendly height >= 48px) */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
            Explore Categories
          </div>

          {categories.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'px-3.5 py-3 rounded-xl text-[15px] font-bold transition-colors flex items-center gap-3 min-h-[48px]',
                  isActive
                    ? 'text-[var(--text-primary)] bg-[var(--bg-secondary)] border border-[var(--border-primary)]'
                    : 'text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
                )
              }
            >
              <span className="text-xl shrink-0">{link.icon}</span>
              <span className="truncate">{link.label}</span>
              {link.badge && (
                <span className="ml-auto px-2 py-0.5 rounded-full text-[11px] font-bold bg-[var(--accent)] text-white">
                  {link.badge}
                </span>
              )}
            </NavLink>
          ))}

          {/* Account Sub-menu if logged in */}
          {isAuthenticated && (
            <>
              <div className="pt-4 pb-1 px-3 text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)] border-t border-[var(--border-subtle)] mt-4">
                {user?.role === 'ADMIN' ? 'Admin Portal' : user?.role === 'SELLER' ? 'Seller Workspace' : 'Buyer Hub'}
              </div>

              {user?.role === 'ADMIN' ? (
                <>
                  <NavLink to="/admin" onClick={onClose} className="px-3.5 py-3 rounded-xl text-[15px] font-bold text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] flex items-center gap-3 min-h-[48px]">
                    <span>🛡️</span> <span>Admin Overview</span>
                  </NavLink>
                  <NavLink to="/admin/sellers" onClick={onClose} className="px-3.5 py-3 rounded-xl text-[15px] font-bold text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] flex items-center gap-3 min-h-[48px]">
                    <span>📦</span> <span>Seller Approvals</span>
                  </NavLink>
                  <NavLink to="/admin/moderation" onClick={onClose} className="px-3.5 py-3 rounded-xl text-[15px] font-bold text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] flex items-center gap-3 min-h-[48px]">
                    <span>📋</span> <span>Listing Moderation</span>
                  </NavLink>
                  <NavLink to="/admin/orders" onClick={onClose} className="px-3.5 py-3 rounded-xl text-[15px] font-bold text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] flex items-center gap-3 min-h-[48px]">
                    <span>💳</span> <span>Marketplace Orders</span>
                  </NavLink>
                </>
              ) : user?.role === 'SELLER' ? (
                <>
                  <NavLink to="/seller/dashboard" onClick={onClose} className="px-3.5 py-3 rounded-xl text-[15px] font-bold text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] flex items-center gap-3 min-h-[48px]">
                    <span>📊</span> <span>Seller Dashboard</span>
                  </NavLink>
                  <NavLink to="/seller/listings" onClick={onClose} className="px-3.5 py-3 rounded-xl text-[15px] font-bold text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] flex items-center gap-3 min-h-[48px]">
                    <span>📦</span> <span>My Listings</span>
                  </NavLink>
                  <NavLink to="/seller/contacts" onClick={onClose} className="px-3.5 py-3 rounded-xl text-[15px] font-bold text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] flex items-center gap-3 min-h-[48px]">
                    <span>💬</span> <span>Buyer Inquiries</span>
                  </NavLink>
                </>
              ) : (
                <>
                  <NavLink to="/buyer/dashboard" onClick={onClose} className="px-3.5 py-3 rounded-xl text-[15px] font-bold text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] flex items-center gap-3 min-h-[48px]">
                    <span>🛍️</span> <span>Buyer Dashboard</span>
                  </NavLink>
                  <NavLink to="/buyer/purchases" onClick={onClose} className="px-3.5 py-3 rounded-xl text-[15px] font-bold text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] flex items-center gap-3 min-h-[48px]">
                    <span>🧾</span> <span>My Purchases</span>
                  </NavLink>
                  <NavLink to="/buyer/saved" onClick={onClose} className="px-3.5 py-3 rounded-xl text-[15px] font-bold text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] flex items-center gap-3 min-h-[48px]">
                    <span>❤️</span> <span>Saved Wishlist</span>
                  </NavLink>
                  <NavLink to="/buyer/contacts" onClick={onClose} className="px-3.5 py-3 rounded-xl text-[15px] font-bold text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] flex items-center gap-3 min-h-[48px]">
                    <span>💬</span> <span>Contacted Sellers</span>
                  </NavLink>
                </>
              )}

              <NavLink to="/profile" onClick={onClose} className="px-3.5 py-3 rounded-xl text-[15px] font-bold text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] flex items-center gap-3 min-h-[48px]">
                <span>👤</span> <span>Profile & Settings</span>
              </NavLink>
            </>
          )}
        </div>

        {/* Bottom Actions */}
        {isAuthenticated && (
          <div className="p-4 border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full py-2.5 px-4 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-surface)] text-[var(--error)] hover:bg-[var(--bg-secondary)] text-[14px] font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>🚪</span>
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default MobileNav;
