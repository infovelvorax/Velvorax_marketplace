import './Input.css';
import React, { forwardRef, useId } from 'react';
import { cn } from '../../../utils';

/**
 * Reusable Input component adhering to the final theme color system:
 * Light: #FFFFFF bg, #000000 text, #C5C5C5 border
 * Dark: #151313 bg, #89D7B7 text, #2B4038 border
 * Height: 52-56px
 */
export const Input = forwardRef(function Input(
  {
    id,
    label,
    error,
    helperText,
    type = 'text',
    disabled = false,
    required = false,
    leftIcon,
    rightIcon,
    className,
    inputClassName,
    ...props
  },
  ref
) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;

  return (
    <div className={cn('w-full flex flex-col gap-2 text-left', className)}>
      {label && (
        <label
          htmlFor={inputId}
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

        <input
          ref={ref}
          id={inputId}
          type={type}
          disabled={disabled}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={
            error ? errorId : helperText ? helperId : undefined
          }
          className={cn(
            'block w-full min-h-[52px] sm:min-h-[54px] rounded-xl border text-[15px] sm:text-[16px] transition-all duration-200',
            'bg-[var(--bg-surface)] px-4 py-3.5 text-[var(--text-primary)] placeholder:text-[var(--text-light)]',
            'focus:outline-none focus:ring-2 focus:ring-offset-0',
            leftIcon ? 'pl-11' : 'pl-4',
            rightIcon ? 'pr-11' : 'pr-4',
            error
              ? 'border-[var(--error)] text-[var(--error)] focus:border-[var(--error)] focus:ring-[var(--error)]/20 bg-[var(--error-light)]'
              : 'border-[var(--border-primary)] hover:border-[var(--border-hover)] focus:border-[var(--border-focus)] focus:ring-[var(--border-focus)]/20 shadow-xs',
            disabled && 'bg-[var(--bg-secondary)] text-[var(--text-muted)] cursor-not-allowed border-[var(--border-primary)]',
            inputClassName
          )}
          {...props}
        />

        {rightIcon && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[var(--text-muted)]">
            {rightIcon}
          </div>
        )}
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

export default Input;
