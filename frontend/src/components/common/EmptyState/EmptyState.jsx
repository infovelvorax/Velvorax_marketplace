import './EmptyState.css';
import React from 'react';
import { cn } from '../../../utils';

/**
 * Reusable EmptyState component in warm ivory & gold luxury theme.
 */
export function EmptyState({
  icon,
  title = 'No items found',
  description = 'There is currently no data available to display.',
  action,
  className,
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 sm:p-14 text-center rounded-3xl border-2 border-dashed border-[var(--border-primary)] bg-[var(--bg-surface)] shadow-xs',
        className
      )}
    >
      <div className="flex h-18 w-18 items-center justify-center rounded-2xl bg-[var(--bg-secondary)] text-[var(--accent)] mb-4 border border-[var(--border-primary)] shadow-xs">
        {icon || (
          <svg
            className="h-9 w-9"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.75"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
            />
          </svg>
        )}
      </div>

      <h3 className="text-xl font-bold text-[var(--text-primary)]">{title}</h3>
      {description && (
        <p className="mt-2 max-w-md text-[15px] text-[var(--text-secondary)]">{description}</p>
      )}

      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export default EmptyState;
