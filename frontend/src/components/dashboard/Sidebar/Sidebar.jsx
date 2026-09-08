import './Sidebar.css';
import React, { useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { cn } from '../../../utils';
import { Badge } from '../..';
import { BrandLogo } from '../../common/BrandLogo';
import { ROUTES } from '../../../constants';

/**
 * Dashboard Sidebar component with dynamic light & dark theme styling
 */
export function Sidebar({
  isOpen = false,
  onClose,
  isCollapsed = false,
  onToggleCollapse,
  links = [],
  user = {
    name: 'User',
    email: 'user@velvorax.com',
    role: 'Member',
  },
  actions,
  className,
}) {
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

  const userRole = (user?.role || 'BUYER').toUpperCase();
  const dashboardHome = userRole === 'ADMIN' ? '/admin' : userRole === 'SELLER' ? '/seller/dashboard' : '/buyer/dashboard';

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[var(--bg-surface)] border-r border-[var(--border-primary)] shadow-xs text-[var(--text-primary)] transition-colors duration-200">
      {/* Sidebar Header / Logo */}
      <div className={cn('flex items-center justify-between h-20 px-6 border-b border-[var(--border-subtle)]')}>
        <Link to={dashboardHome} className="flex items-center gap-2.5 overflow-hidden group select-none">
          <BrandLogo 
            height={38} 
            className="h-[38px] transition-transform group-hover:scale-[1.03]" 
          />
          {!isCollapsed && (
            <div className="flex flex-col justify-center min-w-0">
              <span className="text-[var(--text-primary)] font-black uppercase tracking-wide text-[18px] leading-none">
                VELVORAX
              </span>
              <span className="text-[var(--text-muted)] uppercase text-[9px] font-bold tracking-widest mt-1 leading-none">
                {userRole === 'ADMIN' ? 'ADMIN PANEL' : userRole === 'SELLER' ? 'SELLER HUB' : 'BUYER PORTAL'}
              </span>
            </div>
          )}
        </Link>

        {/* Desktop Collapse Toggle */}
        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="hidden lg:flex p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors cursor-pointer"
          >
            <svg
              className={cn('h-5 w-5 transition-transform duration-200', isCollapsed && 'rotate-180')}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* Mobile Close Button */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
            className="lg:hidden p-2 rounded-xl text-[var(--text-muted)] hover:bg-[var(--bg-secondary)] transition-colors cursor-pointer"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-1.5">
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            onClick={onClose}
            title={isCollapsed ? link.label : undefined}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3.5 px-4 py-3 rounded-xl text-[15px] font-bold transition-all duration-150',
                isActive
                  ? 'bg-[var(--bg-secondary)] text-[var(--text-primary)] shadow-xs border border-[var(--border-primary)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]',
                isCollapsed && 'justify-center px-2'
              )
            }
          >
            {link.icon && (
              <span className="h-5 w-5 shrink-0 flex items-center justify-center">
                {link.icon}
              </span>
            )}
            {!isCollapsed && <span className="flex-1 truncate">{link.label}</span>}
            {!isCollapsed && link.badge && (
              <Badge size="sm" variant="primary">
                {link.badge}
              </Badge>
            )}
          </NavLink>
        ))}
      </div>

      {/* Bottom Actions Slot */}
      {actions && (
        <div className={cn('p-4 border-t border-[var(--border-subtle)]', isCollapsed && 'px-2')}>
          {actions}
        </div>
      )}

      {/* User Profile Footer */}
      {user && (
        <div className={cn('p-4 border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)]', isCollapsed && 'p-2 flex justify-center')}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-full bg-[var(--bg-surface)] text-[var(--text-primary)] flex items-center justify-center font-bold text-sm shrink-0 border border-[var(--border-primary)]">
              {user.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-bold text-[var(--text-primary)] truncate">{user.name}</p>
                <p className="text-xs text-[var(--text-secondary)] truncate">{user.email || user.role}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside
        className={cn(
          'hidden lg:flex flex-col shrink-0 h-screen sticky top-0 transition-all duration-300 z-30',
          isCollapsed ? 'w-20' : 'w-64',
          className
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in"
            onClick={onClose}
          />
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] shadow-2xl z-10 animate-slide-right">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}

export default Sidebar;
