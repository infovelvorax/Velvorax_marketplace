import React from 'react';
import { useTheme } from '../../../hooks/useTheme';
import { cn } from '../../../utils';

export function ThemeToggle({ className, variant = 'icon', size = 'md' }) {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      className={cn(
        'relative inline-flex items-center justify-center transition-all cursor-pointer select-none',
        variant === 'icon' && [
          'rounded-xl border border-[var(--border-primary)] bg-[var(--bg-surface)] text-[var(--text-primary)] hover:border-[var(--button-primary)] hover:bg-[var(--bg-secondary)]',
          size === 'sm' && 'w-9 h-9 text-base',
          size === 'md' && 'w-11 h-11 text-lg',
          size === 'lg' && 'w-12 h-12 text-xl',
          'shadow-xs hover:shadow-sm'
        ],
        variant === 'pill' && [
          'px-4 py-2 rounded-full border border-[var(--border-primary)] bg-[var(--bg-surface)] text-[var(--text-primary)] hover:border-[var(--button-primary)] gap-2 text-[14px] font-bold',
        ],
        className
      )}
    >
      <span className="flex items-center justify-center transition-transform duration-300 hover:rotate-12">
        {isDark ? (
          <svg className="w-5 h-5 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ) : (
          <svg className="w-5 h-5 text-[var(--text-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        )}
      </span>

      {variant === 'pill' && (
        <span>{isDark ? 'Light Theme' : 'Dark Theme'}</span>
      )}
    </button>
  );
}

export default ThemeToggle;
