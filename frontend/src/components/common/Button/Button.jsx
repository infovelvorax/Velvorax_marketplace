import './Button.css';
import React, { forwardRef } from 'react';
import { cn } from '../../../utils';

/**
 * Reusable Button component adhering to the final theme color system:
 * Light: #000000 bg + #FFFFFF text
 * Dark: #89D7B7 bg + #0B0909 text
 */
export const Button = forwardRef(function Button(
  {
    children,
    type = 'button',
    variant = 'primary',
    size = 'md',
    isLoading = false,
    loadingText,
    disabled = false,
    fullWidth = false,
    leftIcon,
    rightIcon,
    className,
    as: Component = 'button',
    ...props
  },
  ref
) {
  const baseStyles =
    'inline-flex items-center justify-center font-bold tracking-tight rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none active:scale-[0.98]';

  const variants = {
    primary:
      'bg-[var(--button-primary)] text-[var(--button-primary-text)] hover:bg-[var(--button-primary-hover)] focus:ring-[var(--button-primary)] shadow-xs hover:shadow-md border border-[var(--button-primary)]',
    secondary:
      'bg-transparent text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] focus:ring-[var(--button-primary)] border border-[var(--button-primary)]',
    outline:
      'bg-transparent text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-primary)] hover:border-[var(--button-primary)] focus:ring-[var(--button-primary)] shadow-xs',
    gold:
      'bg-[var(--button-primary)] text-[var(--button-primary-text)] hover:bg-[var(--button-primary-hover)] focus:ring-[var(--button-primary)] border border-[var(--button-primary)] shadow-xs',
    ghost:
      'bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)] focus:ring-[var(--border-primary)] shadow-none',
    danger:
      'bg-[var(--error)] text-white hover:opacity-90 focus:ring-[var(--error)] shadow-xs',
    success:
      'bg-[var(--success)] text-white hover:opacity-90 focus:ring-[var(--success)] shadow-xs',
  };

  const sizes = {
    sm: 'text-xs px-3.5 py-2 min-h-[38px] gap-1.5 rounded-lg font-semibold',
    md: 'text-[15px] px-5 py-3 min-h-[48px] sm:min-h-[50px] gap-2 rounded-xl font-bold',
    lg: 'text-[16px] px-7 py-3.5 min-h-[52px] sm:min-h-[56px] gap-2.5 rounded-xl font-bold',
  };

  const isDisabled = disabled || isLoading;
  const componentProps = Component === 'button' ? { type } : {};

  return (
    <Component
      ref={ref}
      {...componentProps}
      disabled={isDisabled}
      className={cn(
        baseStyles,
        variants[variant] || variants.primary,
        sizes[size] || sizes.md,
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {isLoading && (
        <svg
          className="animate-spin -ml-0.5 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}

      {!isLoading && leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
      <span>{isLoading && loadingText ? loadingText : children}</span>
      {!isLoading && rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
    </Component>
  );
});

export default Button;
