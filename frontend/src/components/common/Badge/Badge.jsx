import './Badge.css';
import React from 'react';
import { cn } from '../../../utils';

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  dotColor,
  leftIcon,
  rightIcon,
  onRemove,
  className,
  ...props
}) {
  const variants = {
    default: 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-[var(--border-primary)]',
    primary: 'bg-[var(--button-primary)] text-[var(--button-primary-text)] border-[var(--button-primary)] font-bold shadow-xs',
    secondary: 'bg-[var(--bg-secondary)] text-[var(--text-primary)] border-[var(--border-primary)] font-semibold',
    accent: 'bg-[var(--accent-light)] text-[var(--accent)] border-[var(--accent-border)] font-bold',
    success: 'bg-[var(--success-light)] text-[var(--success)] border-[var(--success)]/25 font-bold',
    warning: 'bg-[var(--warning-light)] text-[var(--warning)] border-[var(--warning)]/25 font-bold',
    danger: 'bg-[var(--error-light)] text-[var(--error)] border-[var(--error)]/25 font-bold',
    info: 'bg-[var(--accent-light)] text-[var(--accent)] border-[var(--accent-border)] font-semibold',
    neutral: 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border-primary)]',
    outline: 'bg-transparent text-[var(--text-secondary)] border-[var(--border-primary)]',
  };

  const dotColors = {
    default: 'bg-[var(--text-secondary)]',
    primary: 'bg-[var(--accent)]',
    secondary: 'bg-[var(--text-primary)]',
    accent: 'bg-[var(--accent)]',
    success: 'bg-[var(--success)]',
    warning: 'bg-[var(--warning)]',
    danger: 'bg-[var(--error)]',
    info: 'bg-[var(--accent)]',
    neutral: 'bg-[var(--text-muted)]',
    outline: 'bg-[var(--text-muted)]',
  };

  const sizes = {
    sm: 'text-[11px] px-2.5 py-0.5 gap-1 font-medium',
    md: 'text-[12px] sm:text-[13px] px-3.5 py-1 gap-1.5 font-semibold',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border transition-colors select-none',
        variants[variant] || variants.default,
        sizes[size] || sizes.md,
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            'h-1.5 w-1.5 rounded-full shrink-0',
            dotColor || dotColors[variant] || dotColors.default
          )}
          aria-hidden="true"
        />
      )}

      {leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
      <span>{children}</span>
      {rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}

      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove badge"
          className="ml-1 -mr-1 inline-flex h-4 w-4 items-center justify-center rounded-full text-current hover:bg-black/10 transition-colors cursor-pointer"
        >
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </span>
  );
}

export default Badge;
