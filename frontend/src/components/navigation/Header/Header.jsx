import './Header.css';
import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { SearchBar } from '../../marketplace/SearchBar';
import { Container } from '../../common/Container';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, DropdownDivider, DropdownHeader } from '../../common/Dropdown';
import { ThemeToggle } from '../../common/ThemeToggle';
import { BrandLogo } from '../../common/BrandLogo';
import { AdminLoginModal } from '../../auth/AdminLoginModal';
import { NotificationBell } from '../../common/NotificationBell';
import { ROUTES } from '../../../constants';
import { cn } from '../../../utils';

export function Header({ onMenuClick, onOpenCategories, sticky = true, className }) {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const lastTapRef = useRef(0);

  const handleTouchEndLogo = (e) => {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTapRef.current;
    if (tapLength < 450 && tapLength > 40) {
      e.preventDefault();
      e.stopPropagation();
      setAdminModalOpen(true);
    }
    lastTapRef.current = currentTime;
  };

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.HOME);
  };

  const userRole = (user?.role || 'BUYER').toUpperCase();

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

  return (
    <>
      <header
        className={cn(
          'w-full bg-[var(--bg-navbar)] border-b border-[var(--border-primary)] shadow-xs z-40 transition-colors duration-200',
          sticky && 'sticky top-0',
          className
        )}
      >
        <Container size="7xl">
          {/* DESKTOP & TABLET NAVBAR ROW (Clean, minimal, premium spacing) */}
          <div className="flex h-[58px] sm:h-[68px] md:h-[80px] items-center justify-between gap-1.5 xs:gap-2 sm:gap-4 lg:gap-6">
            
            {/* LEFT: Mobile Menu Hamburger, Brand Logo, and Dedicated Categories Button */}
            <div className="flex items-center gap-1.5 xs:gap-2 sm:gap-3 lg:gap-4 shrink-0 min-w-0">
              {/* Mobile Menu Hamburger */}
              {onMenuClick && (
                <button
                  type="button"
                  onClick={onMenuClick}
                  aria-label="Open mobile navigation"
                  className="md:hidden p-1.5 sm:p-2 rounded-xl text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors cursor-pointer shrink-0"
                >
                  <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              )}

              {/* Logo Link with Hidden Double-Click & Double-Tap Admin Trigger */}
              <div
                onDoubleClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setAdminModalOpen(true);
                }}
                onTouchEnd={handleTouchEndLogo}
                className="flex items-center cursor-pointer shrink min-w-0"
                title="Velvorax Marketplace"
              >
                <Link
                  to={ROUTES.HOME}
                  className="flex items-center gap-1.5 xs:gap-2 sm:gap-3 group select-none min-w-0"
                >
                  <BrandLogo 
                    height={40} 
                    className="h-[28px] xs:h-[32px] sm:h-[36px] md:h-[40px] w-auto transition-transform group-hover:scale-[1.03] shrink-0" 
                  />
                  <div className="flex flex-col justify-center min-w-0">
                    <span className="text-[var(--text-primary)] font-black tracking-wider text-[15px] xs:text-[17px] sm:text-[20px] md:text-[22px] leading-none uppercase truncate">
                      VELVORAX
                    </span>
                    <span className="text-[var(--text-muted)] text-[8px] sm:text-[9px] md:text-[10px] tracking-widest font-bold uppercase hidden sm:block mt-0.5">
                      MARKETPLACE
                    </span>
                  </div>
                </Link>
              </div>

              {/* Dedicated Categories Button (Desktop / Tablet) */}
              {onOpenCategories && (
                <button
                  type="button"
                  onClick={onOpenCategories}
                  aria-label="Open categories"
                  className="hidden md:inline-flex items-center gap-2 px-3 sm:px-3.5 h-[40px] sm:h-[44px] md:h-[46px] rounded-xl text-[13px] sm:text-[14px] font-bold text-[var(--text-primary)] bg-[var(--bg-surface)] hover:bg-[var(--bg-secondary)] border border-[var(--border-primary)] transition-all cursor-pointer shadow-2xs hover:shadow-xs active:scale-95 select-none shrink-0 ml-1 lg:ml-2"
                >
                  <span className="text-[var(--accent)] text-base font-black">☰</span>
                  <span>Categories</span>
                </button>
              )}
            </div>

            {/* CENTER: Desktop Global Search Bar (Unified Search + Location Selector) */}
            <div className="hidden md:flex flex-1 max-w-2xl mx-2 lg:mx-4 items-center min-w-[200px]">
              <SearchBar compact={true} />
            </div>

            {/* RIGHT: Theme Toggle, Notifications, + Post Listing CTA, and Account / Profile Menu */}
            <div className="flex items-center gap-1.5 xs:gap-2 sm:gap-3 shrink-0">
              {/* Notification Bell (when authenticated) */}
              <NotificationBell />

              {/* Theme Toggle */}
              <div className="shrink-0">
                <ThemeToggle size="sm" />
              </div>

              {/* + Post Listing Primary Button */}
              <Link 
                to={ROUTES.POST_LISTING}
                className="inline-flex items-center justify-center gap-1 xs:gap-1.5 sm:gap-2 bg-[var(--button-primary)] text-[var(--button-primary-text)] hover:bg-[var(--button-primary-hover)] px-2.5 xs:px-3 sm:px-4.5 h-[34px] xs:h-[38px] sm:h-[42px] md:h-[46px] rounded-xl font-bold text-[11px] xs:text-[12px] sm:text-[14px] border border-[var(--button-primary)] shadow-xs hover:shadow-md transition-all shrink-0 cursor-pointer active:scale-95 select-none whitespace-nowrap"
              >
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden sm:inline">Post Listing</span>
                <span className="sm:hidden">Post</span>
              </Link>

              {/* User Account Dropdown (Authenticated) or Sign In Button (Guest) */}
              {isAuthenticated ? (
                <Dropdown align="right">
                  <DropdownTrigger>
                    <div 
                      aria-label="User profile menu"
                      className="flex items-center gap-1.5 sm:gap-2 px-1.5 sm:px-2 py-1 h-[34px] xs:h-[38px] sm:h-[42px] md:h-[46px] rounded-xl hover:bg-[var(--bg-secondary)] transition-colors cursor-pointer border border-transparent hover:border-[var(--border-primary)] shrink-0"
                    >
                      <div className="w-7 h-7 xs:w-8 xs:h-8 sm:w-9 sm:h-9 rounded-full bg-[var(--bg-surface)] text-[var(--accent)] font-black text-[12px] xs:text-[13px] sm:text-[14px] flex items-center justify-center uppercase shadow-xs border border-[var(--border-primary)] shrink-0">
                        {user?.name?.charAt(0) || 'U'}
                      </div>
                      <span className="hidden xl:inline text-[13px] sm:text-[14px] font-bold text-[var(--text-primary)] max-w-[110px] truncate">
                        {user?.name || 'Account'}
                      </span>
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--text-muted)] hidden xl:block shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </DropdownTrigger>

                  <DropdownMenu width="w-64">
                    <DropdownHeader>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[var(--text-primary)] truncate text-[14px]">{user?.name}</span>
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20">
                          {userRole}
                        </span>
                      </div>
                      <div className="text-[12px] text-[var(--text-secondary)] truncate font-normal mt-0.5">{user?.email}</div>
                    </DropdownHeader>
                    
                    {/* Role-tailored menu options */}
                    {userRole === 'ADMIN' && (
                      <>
                        <DropdownItem onClick={() => navigate('/admin/dashboard')}>
                          <span>🛡️</span> <span className="font-bold text-indigo-400">Admin Dashboard</span>
                        </DropdownItem>
                        <DropdownItem onClick={() => navigate('/admin/sellers')}>
                          <span>📦</span> <span>Seller Approvals</span>
                        </DropdownItem>
                        <DropdownItem onClick={() => navigate('/admin/buyers')}>
                          <span>🛍️</span> <span>Buyer Management</span>
                        </DropdownItem>
                        <DropdownItem onClick={() => navigate('/admin/moderation')}>
                          <span>📋</span> <span>Listing Moderation</span>
                        </DropdownItem>
                        <DropdownItem onClick={() => navigate('/admin/orders')}>
                          <span>💳</span> <span>Marketplace Orders</span>
                        </DropdownItem>
                        <DropdownDivider />
                      </>
                    )}

                    {userRole === 'SELLER' && (
                      <>
                        <DropdownItem onClick={() => navigate('/seller/dashboard')}>
                          <span>📦</span> <span className="font-bold text-emerald-400">Seller Dashboard</span>
                        </DropdownItem>
                        <DropdownItem onClick={() => navigate('/seller/listings')}>
                          <span>📋</span> <span>My Listings</span>
                        </DropdownItem>
                        <DropdownItem onClick={() => navigate('/seller/contacts')}>
                          <span>💬</span> <span>Buyer Inquiries</span>
                        </DropdownItem>
                        <DropdownDivider />
                      </>
                    )}

                    {(userRole === 'BUYER' || userRole === 'USER') && (
                      <>
                        <DropdownItem onClick={() => navigate('/buyer/dashboard')}>
                          <span>🛍️</span> <span className="font-bold text-blue-400">Buyer Dashboard</span>
                        </DropdownItem>
                        <DropdownItem onClick={() => navigate('/buyer/purchases')}>
                          <span>🧾</span> <span>My Purchases</span>
                        </DropdownItem>
                        <DropdownItem onClick={() => navigate('/buyer/contacts')}>
                          <span>💬</span> <span>Contacted Sellers</span>
                        </DropdownItem>
                        <DropdownItem onClick={() => navigate('/buyer/saved')}>
                          <span>❤️</span> <span>Saved Wishlist</span>
                        </DropdownItem>
                        <DropdownDivider />
                      </>
                    )}
                    
                    <DropdownItem onClick={() => navigate(getProfileRoute())}>
                      <span>👤</span> <span>Profile</span>
                    </DropdownItem>
                    <DropdownItem onClick={() => navigate(getSettingsRoute())}>
                      <span>⚙️</span> <span>Settings</span>
                    </DropdownItem>
                    <DropdownDivider />
                    <DropdownItem danger onClick={handleLogout}>
                      <span>🚪</span> <span>Sign Out</span>
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              ) : (
                <Link 
                  to={ROUTES.AUTH.LOGIN}
                  className="text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] text-[13px] sm:text-[14px] font-bold px-3.5 sm:px-4 h-[42px] sm:h-[46px] inline-flex items-center justify-center rounded-xl border border-[var(--border-primary)] transition-colors whitespace-nowrap"
                >
                  Sign In
                </Link>
              )}

            </div>
          </div>

          {/* MOBILE ROW 2: Dedicated Search Bar on Mobile */}
          <div className="md:hidden pb-3.5 pt-1">
            <SearchBar compact={true} />
          </div>
        </Container>
      </header>

      {/* Secret Admin Access Modal */}
      <AdminLoginModal isOpen={adminModalOpen} onClose={() => setAdminModalOpen(false)} />
    </>
  );
}

export default Header;

