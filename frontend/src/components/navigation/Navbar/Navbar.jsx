import './Navbar.css';
import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '../../../utils';

/**
 * Navigation Bar component with active link indicators
 */
export function Navbar({
  links = [],
  className,
}) {
  if (!links || links.length === 0) return null;

  return (
    <nav
      aria-label="Main Navigation"
      className={cn('hidden md:flex items-center gap-4 lg:gap-6', className)}
    >
      {links.map((link) => (
        <NavLink
          key={link.path}
          to={link.path}
          className={({ isActive }) =>
            cn(
              'relative py-2 text-[14px] font-semibold transition-colors duration-200 inline-flex items-center gap-1.5',
              isActive
                ? 'text-[var(--text-primary)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            )
          }
        >
          {({ isActive }) => (
            <>
              {link.icon && <span className="shrink-0">{link.icon}</span>}
              <span>{link.label}</span>
              
              {/* Dropdown Chevron */}
              {link.hasDropdown && (
                <svg className="w-4 h-4 opacity-70 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              )}

              {/* Active Indicator Underline */}
              {isActive && (
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[var(--accent)] rounded-t-sm" />
              )}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

export default Navbar;
