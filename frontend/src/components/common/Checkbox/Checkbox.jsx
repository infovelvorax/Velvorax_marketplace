import './Checkbox.css';
import React, { forwardRef, useId, useEffect, useRef } from 'react';
import { cn } from '../../../utils';

/**
 * Reusable Checkbox component in warm luxury theme
 */
export const Checkbox = forwardRef(function Checkbox(
  {
    id,
    label,
    description,
    error,
    checked,
    indeterminate = false,
    disabled = false,
    required = false,
    className,
    checkboxClassName,
    onChange,
    ...props
  },
  forwardedRef
) {
  const localRef = useRef(null);
  const resolvedRef = forwardedRef || localRef;
  const generatedId = useId();
  const checkboxId = id || generatedId;
  const errorId = `${checkboxId}-error`;
  const descId = `${checkboxId}-desc`;

  useEffect(() => {
    if (resolvedRef && typeof resolvedRef !== 'function' && resolvedRef.current) {
      resolvedRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate, resolvedRef]);

  return (
    <div className={cn('flex items-start gap-3 text-left', className)}>
      <div className="flex h-6 items-center">
        <input
          ref={resolvedRef}
          id={checkboxId}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          required={required}
          onChange={onChange}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : description ? descId : undefined}
          className={cn(
            'h-5 w-5 rounded-md border-[var(--border-primary)] text-[var(--accent)] focus:ring-[var(--accent)] focus:ring-2 focus:ring-offset-0',
            'transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 accent-[var(--accent)]',
            error && 'border-[var(--error)] focus:ring-[var(--error)]',
            checkboxClassName
          )}
          {...props}
        />
      </div>

      {(label || description || error) && (
        <div className="flex flex-col text-[15px]">
          {label && (
            <label
              htmlFor={checkboxId}
              className={cn(
                'font-medium text-[var(--text-primary)] select-none cursor-pointer',
                disabled && 'cursor-not-allowed opacity-60'
              )}
            >
              {label}
              {required && <span className="text-[var(--error)] ml-1">*</span>}
            </label>
          )}

          {description && (
            <p id={descId} className="text-xs text-[var(--text-secondary)] mt-0.5">
              {description}
            </p>
          )}

          {error && (
            <p id={errorId} className="text-xs text-[var(--error)] font-medium mt-0.5">
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
});

export default Checkbox;
