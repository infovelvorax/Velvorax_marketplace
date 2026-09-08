import './Textarea.css';
import React, { forwardRef, useId } from 'react';
import { cn } from '../../../utils';

/**
 * Reusable Textarea component with dynamic theme support.
 */
export const Textarea = forwardRef(function Textarea(
  {
    id,
    label,
    error,
    helperText,
    rows = 4,
    maxLength,
    currentLength,
    disabled = false,
    required = false,
    resize = 'vertical',
    className,
    textareaClassName,
    ...props
  },
  ref
) {
  const generatedId = useId();
  const textareaId = id || generatedId;
  const errorId = `${textareaId}-error`;
  const helperId = `${textareaId}-helper`;

  const resizeStyles = {
    none: 'resize-none',
    vertical: 'resize-y',
    horizontal: 'resize-x',
    both: 'resize',
  };

  return (
    <div className={cn('w-full flex flex-col gap-2 text-left', className)}>
      <div className="flex justify-between items-center">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-[14px] sm:text-[15px] font-bold text-[var(--text-primary)] select-none"
          >
            {label}
            {required && <span className="text-[var(--error)] ml-1">*</span>}
          </label>
        )}
        {maxLength && typeof currentLength === 'number' && (
          <span className="text-xs text-[var(--text-muted)]">
            {currentLength}/{maxLength}
          </span>
        )}
      </div>

      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        maxLength={maxLength}
        disabled={disabled}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : helperText ? helperId : undefined}
        className={cn(
          'block w-full rounded-xl border text-[15px] sm:text-[16px] transition-all duration-200',
          'bg-[var(--bg-surface)] px-4 py-3.5 text-[var(--text-primary)] placeholder:text-[var(--text-light)]',
          'focus:outline-none focus:ring-2 focus:ring-offset-0',
          resizeStyles[resize] || resizeStyles.vertical,
          error
            ? 'border-[var(--error)] text-[var(--error)] focus:border-[var(--error)] focus:ring-[var(--error)]/20 bg-[var(--error-light)]'
            : 'border-[var(--border-primary)] hover:border-[var(--border-hover)] focus:border-[var(--button-primary)] focus:ring-[var(--button-primary)]/20 shadow-xs',
          disabled && 'bg-[var(--bg-secondary)] text-[var(--text-muted)] cursor-not-allowed border-[var(--border-primary)]',
          textareaClassName
        )}
        {...props}
      />

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

export default Textarea;
