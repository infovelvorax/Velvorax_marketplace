import './Radio.css';
import React, { forwardRef, useId, createContext, useContext } from 'react';
import { cn } from '../../../utils';

const RadioGroupContext = createContext(null);

/**
 * RadioGroup wrapper in warm luxury theme
 */
export function RadioGroup({
  name,
  value,
  onChange,
  label,
  error,
  orientation = 'vertical',
  className,
  children,
}) {
  const generatedName = useId();
  const groupName = name || generatedName;

  return (
    <RadioGroupContext.Provider value={{ name: groupName, value, onChange }}>
      <div
        role="radiogroup"
        aria-label={label}
        className={cn('flex flex-col gap-2 text-left', className)}
      >
        {label && (
          <span className="block text-[14px] sm:text-[15px] font-bold text-[var(--text-primary)] select-none">
            {label}
          </span>
        )}

        <div
          className={cn(
            'flex gap-4',
            orientation === 'vertical' ? 'flex-col' : 'flex-row flex-wrap'
          )}
        >
          {children}
        </div>

        {error && <p className="text-xs text-[var(--error)] font-medium">{error}</p>}
      </div>
    </RadioGroupContext.Provider>
  );
}

/**
 * Reusable individual Radio component in warm luxury theme
 */
export const Radio = forwardRef(function Radio(
  {
    id,
    name,
    value,
    label,
    description,
    checked,
    disabled = false,
    className,
    radioClassName,
    onChange,
    ...props
  },
  ref
) {
  const group = useContext(RadioGroupContext);
  const generatedId = useId();
  const radioId = id || generatedId;
  const descId = `${radioId}-desc`;

  const isChecked = group ? group.value === value : checked;
  const resolvedName = group?.name || name;
  const handleChange = (e) => {
    if (group?.onChange) {
      group.onChange(value, e);
    } else if (onChange) {
      onChange(e);
    }
  };

  return (
    <div className={cn('flex items-start gap-3 text-left', className)}>
      <div className="flex h-6 items-center">
        <input
          ref={ref}
          id={radioId}
          type="radio"
          name={resolvedName}
          value={value}
          checked={isChecked}
          disabled={disabled}
          onChange={handleChange}
          aria-describedby={description ? descId : undefined}
          className={cn(
            'h-5 w-5 border-[var(--border-primary)] text-[var(--accent)] focus:ring-[var(--accent)] focus:ring-2 focus:ring-offset-0',
            'transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 accent-[var(--accent)]',
            radioClassName
          )}
          {...props}
        />
      </div>

      {(label || description) && (
        <div className="flex flex-col text-[15px]">
          {label && (
            <label
              htmlFor={radioId}
              className={cn(
                'font-medium text-[var(--text-primary)] select-none cursor-pointer',
                disabled && 'cursor-not-allowed opacity-60'
              )}
            >
              {label}
            </label>
          )}

          {description && (
            <p id={descId} className="text-xs text-[var(--text-secondary)] mt-0.5">
              {description}
            </p>
          )}
        </div>
      )}
    </div>
  );
});

export default Radio;
