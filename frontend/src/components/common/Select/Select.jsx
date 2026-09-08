import './Select.css';
import React, { forwardRef, useId } from 'react';
import { cn } from '../../../utils';

/**
 * Reusable Select dropdown input component with dynamic theme support.
 */
export const Select = forwardRef(function Select(
  {
    id,
    label,
    error,
    helperText,
    options = [],
    placeholder = 'Select an option',
    disabled = false,
    required = false,
    leftIcon,
    className,
    selectClassName,
    children,
    ...props
  },
  ref
) {
  const generatedId = useId();
  const selectId = id || generatedId;
  const errorId = `${selectId}-error`;
  const helperId = `${selectId}-helper`;

  return (
    <div className={cn('w-full flex flex-col gap-2 text-left', className)}>
      {label && (
        <label
          htmlFor={selectId}
          className="block text-[14px] sm:text-[15px] font-bold text-[var(--text-primary)] select-none"
        >
          {label}
          {required && <span className="text-[var(--error)] ml-1">*</span>}
        </label>
      )}

      <div className="relative rounded-xl shadow-xs">
        {leftIcon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-[var(--text-muted)]">
            {leftIcon}
          </div>
        )}

        <select
          ref={ref}
          id={selectId}
          disabled={disabled}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          className={cn(
            'block w-full min-h-[52px] sm:min-h-[54px] appearance-none rounded-xl border text-[15px] sm:text-[16px] transition-all duration-200',
            'bg-[var(--bg-surface)] px-4 py-3.5 pr-11 text-[var(--text-primary)]',
            'focus:outline-none focus:ring-2 focus:ring-offset-0',
            leftIcon ? 'pl-11' : 'pl-4',
            error
              ? 'border-[var(--error)] text-[var(--error)] focus:border-[var(--error)] focus:ring-[var(--error)]/20 bg-[var(--error-light)]'
              : 'border-[var(--border-primary)] hover:border-[var(--border-hover)] focus:border-[var(--button-primary)] focus:ring-[var(--button-primary)]/20 shadow-xs',
            disabled && 'bg-[var(--bg-secondary)] text-[var(--text-muted)] cursor-not-allowed border-[var(--border-primary)]',
            selectClassName
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled className="text-[var(--text-muted)]">
              {placeholder}
            </option>
          )}

          {children
            ? children
            : options.map((opt) => {
                const isObj = typeof opt === 'object' && opt !== null;
                const value = isObj ? opt.value : opt;
                const label = isObj ? opt.label : opt;
                const optDisabled = isObj ? opt.disabled : false;
                return (
                  <option key={value} value={value} disabled={optDisabled} className="bg-[var(--bg-surface)] text-[var(--text-primary)]">
                    {label}
                  </option>
                );
              })}
        </select>

        {/* Custom Chevron Indicator */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-[var(--text-muted)]">
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {error ? (
        <p id={errorId} className="text-xs text-[var(--error)] font-semibold flex items-center gap-1 mt-0.5">
          <span>⚠️</span>
          <span>{error}</span>
        </p>
      ) : helperText ? (
        <p id={helperId} className="text-xs text-[var(--text-secondary)]">
          {helperText}
        </p>
      ) : null}
    </div>
  );
});

export default Select;
