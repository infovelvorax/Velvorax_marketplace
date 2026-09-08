import './Card.css';
import React, { forwardRef } from 'react';
import { cn } from '../../../utils';

/**
 * Modern Card component primitives with generous padding, smooth borders and dynamic theme support.
 */
export const Card = forwardRef(function Card(
  {
    children,
    variant = 'default',
    hoverable = false,
    className,
    ...props
  },
  ref
) {
  const variants = {
    default: 'bg-[var(--bg-surface)] border border-[var(--border-primary)] shadow-xs text-[var(--text-primary)]',
    bordered: 'bg-[var(--bg-surface)] border border-[var(--border-primary)] shadow-none text-[var(--text-primary)]',
    flat: 'bg-[var(--bg-secondary)] border border-[var(--border-primary)] shadow-none text-[var(--text-primary)]',
    elevated: 'bg-[var(--bg-surface)] border border-[var(--border-primary)] shadow-md hover:border-[var(--button-primary)]/40 text-[var(--text-primary)]',
  };

  return (
    <div
      ref={ref}
      className={cn(
        'rounded-2xl overflow-hidden transition-all duration-200',
        variants[variant] || variants.default,
        hoverable && 'hover:shadow-md hover:-translate-y-0.5 cursor-pointer hover:border-[var(--button-primary)]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

export const CardHeader = forwardRef(function CardHeader(
  { children, className, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      className={cn('px-6 sm:px-8 py-5 sm:py-6 border-b border-[var(--border-subtle)] flex flex-col gap-1.5', className)}
      {...props}
    >
      {children}
    </div>
  );
});

export const CardTitle = forwardRef(function CardTitle(
  { children, as: Tag = 'h3', className, ...props },
  ref
) {
  return (
    <Tag
      ref={ref}
      className={cn('text-lg sm:text-xl font-bold text-[var(--text-primary)] tracking-tight', className)}
      {...props}
    >
      {children}
    </Tag>
  );
});

export const CardDescription = forwardRef(function CardDescription(
  { children, className, ...props },
  ref
) {
  return (
    <p
      ref={ref}
      className={cn('text-[14px] sm:text-[15px] text-[var(--text-secondary)]', className)}
      {...props}
    >
      {children}
    </p>
  );
});

export const CardContent = forwardRef(function CardContent(
  { children, className, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      className={cn('px-6 sm:px-8 py-6 sm:py-7 text-[var(--text-primary)]', className)}
      {...props}
    >
      {children}
    </div>
  );
});

export const CardFooter = forwardRef(function CardFooter(
  { children, className, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      className={cn(
        'px-6 sm:px-8 py-4 sm:py-5 bg-[var(--bg-secondary)] border-t border-[var(--border-subtle)] flex items-center justify-between gap-3 text-sm text-[var(--text-secondary)]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

export default Card;
