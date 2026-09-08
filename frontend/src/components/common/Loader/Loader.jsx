import './Loader.css';
import React from 'react';
import { cn } from '../../../utils';

/**
 * Reusable Loader component with dynamic theme support.
 */
export function Loader({
  size = 'md',
  variant = 'spinner',
  text,
  fullScreen = false,
  className,
}) {
  const sizes = {
    sm: { spinner: 'h-4 w-4 border-2', dot: 'h-1.5 w-1.5', text: 'text-xs' },
    md: { spinner: 'h-8 w-8 border-3', dot: 'h-2.5 w-2.5', text: 'text-sm' },
    lg: { spinner: 'h-12 w-12 border-4', dot: 'h-3.5 w-3.5', text: 'text-base' },
    xl: { spinner: 'h-16 w-16 border-4', dot: 'h-4 w-4', text: 'text-lg' },
  };

  const selectedSize = sizes[size] || sizes.md;

  const content = (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      {variant === 'spinner' && (
        <div
          className={cn(
            'animate-spin rounded-full border-solid border-[var(--border-primary)] border-t-[var(--accent)]',
            selectedSize.spinner
          )}
          role="status"
          aria-label="Loading"
        />
      )}

      {variant === 'dots' && (
        <div className="flex items-center space-x-1.5" role="status" aria-label="Loading">
          <div
            className={cn('rounded-full bg-[var(--accent)] animate-bounce [animation-delay:-0.3s]', selectedSize.dot)}
          />
          <div
            className={cn('rounded-full bg-[var(--accent)] animate-bounce [animation-delay:-0.15s]', selectedSize.dot)}
          />
          <div
            className={cn('rounded-full bg-[var(--accent)] animate-bounce', selectedSize.dot)}
          />
        </div>
      )}

      {variant === 'pulse' && (
        <div
          className={cn('rounded-full bg-[var(--accent)]/80 animate-ping', selectedSize.dot)}
          role="status"
          aria-label="Loading"
        />
      )}

      {text && (
        <span className={cn('text-[var(--text-secondary)] font-medium select-none', selectedSize.text)}>
          {text}
        </span>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--bg-primary)]/90 backdrop-blur-xs">
        {content}
      </div>
    );
  }

  return content;
}

export default Loader;
