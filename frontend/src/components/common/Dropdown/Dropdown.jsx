import './Dropdown.css';
import React, { useState, createContext, useContext, useEffect } from 'react';
import { cn } from '../../../utils';
import { useClickOutside } from '../../../hooks';

const DropdownContext = createContext(null);

/**
 * Warm Luxury Dropdown container managing open state and outside clicks
 */
export function Dropdown({
  children,
  isOpen: controlledIsOpen,
  onOpenChange,
  className,
}) {
  const [uncontrolledIsOpen, setUncontrolledIsOpen] = useState(false);
  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : uncontrolledIsOpen;

  const setIsOpen = (next) => {
    if (!isControlled) {
      setUncontrolledIsOpen(next);
    }
    onOpenChange?.(next);
  };

  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen(!isOpen);

  const ref = useClickOutside(close, isOpen);

  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen]);

  return (
    <DropdownContext.Provider value={{ isOpen, setIsOpen, close, toggle }}>
      <div ref={ref} className={cn('relative inline-block text-left', className)}>
        {children}
      </div>
    </DropdownContext.Provider>
  );
}

/**
 * Dropdown trigger button or wrapper
 */
export function DropdownTrigger({ children, asChild = false, className }) {
  const { toggle, isOpen } = useContext(DropdownContext);

  if (asChild) {
    return <div onClick={toggle}>{children}</div>;
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-expanded={isOpen}
      aria-haspopup="true"
      className={cn('inline-flex items-center cursor-pointer select-none', className)}
    >
      {children}
    </button>
  );
}

/**
 * Dropdown menu container with white surface, soft stone border and elevation
 */
export function DropdownMenu({
  children,
  align = 'right',
  width = 'w-60',
  className,
}) {
  const { isOpen } = useContext(DropdownContext);
  if (!isOpen) return null;

  const alignments = {
    left: 'left-0 origin-top-left',
    right: 'right-0 origin-top-right',
    center: 'left-1/2 -translate-x-1/2 origin-top',
  };

  return (
    <div
      role="menu"
      className={cn(
        'absolute z-50 mt-2.5 rounded-2xl dropdown-menu-container shadow-2xl py-2.5 focus:outline-none text-[var(--text-primary)]',
        alignments[align] || alignments.right,
        width,
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * Individual selectable item inside dropdown
 */
export function DropdownItem({
  children,
  onClick,
  icon,
  danger = false,
  disabled = false,
  className,
}) {
  const { close } = useContext(DropdownContext);

  const handleClick = (e) => {
    if (disabled) return;
    onClick?.(e);
    close();
  };

  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={handleClick}
      className={cn(
        'w-full flex items-center gap-3 px-5 py-3 text-[14px] sm:text-[15px] text-left cursor-pointer select-none font-semibold dropdown-item-btn',
        danger
          ? 'text-[var(--error)] danger'
          : 'text-[var(--text-primary)]',
        disabled && 'opacity-50 cursor-not-allowed hover:bg-transparent',
        className
      )}
    >
      {icon && <span className="inline-flex shrink-0 text-[var(--text-muted)]">{icon}</span>}
      <span className="flex-1 truncate">{children}</span>
    </button>
  );
}

/**
 * Dropdown category header
 */
export function DropdownHeader({ children, className }) {
  return (
    <div
      className={cn(
        'px-5 py-2 text-[12px] font-bold text-[var(--text-muted)] uppercase tracking-wider select-none border-b border-[var(--border-subtle)] mb-1.5',
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * Dropdown visual divider
 */
export function DropdownDivider({ className }) {
  return <div className={cn('my-1.5 border-t border-[var(--border-subtle)]', className)} />;
}

export default Dropdown;
