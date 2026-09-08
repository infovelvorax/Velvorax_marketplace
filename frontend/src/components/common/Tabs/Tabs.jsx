import './Tabs.css';
import React, { useState, createContext, useContext } from 'react';
import { cn } from '../../../utils';

const TabsContext = createContext(null);

/**
 * Root Tabs container in warm luxury theme
 */
export function Tabs({
  value: controlledValue,
  defaultValue,
  onChange,
  variant = 'line',
  className,
  children,
}) {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const isControlled = controlledValue !== undefined;
  const activeTab = isControlled ? controlledValue : uncontrolledValue;

  const setActiveTab = (val) => {
    if (!isControlled) {
      setUncontrolledValue(val);
    }
    onChange?.(val);
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab, variant }}>
      <div className={cn('flex flex-col gap-6', className)}>{children}</div>
    </TabsContext.Provider>
  );
}

/**
 * Tab list bar containing tab triggers
 */
export function TabList({ children, className }) {
  const { variant } = useContext(TabsContext);

  const variantStyles = {
    line: 'border-b border-[var(--border-primary)] gap-8',
    pill: 'bg-[var(--bg-secondary)] p-1.5 rounded-2xl gap-2 inline-flex self-start border border-[var(--border-primary)]',
    enclosed: 'border-b border-[var(--border-primary)] gap-3',
  };

  return (
    <div
      role="tablist"
      className={cn(
        'flex items-center',
        variantStyles[variant] || variantStyles.line,
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * Individual tab button trigger
 */
export function TabTrigger({
  value,
  children,
  icon,
  badge,
  disabled = false,
  className,
}) {
  const { activeTab, setActiveTab, variant } = useContext(TabsContext);
  const isActive = activeTab === value;

  const variantStyles = {
    line: cn(
      'pb-3.5 pt-1 border-b-2 font-bold text-[15px] sm:text-[16px] transition-colors cursor-pointer select-none -mb-px',
      isActive
        ? 'border-[var(--button-primary)] text-[var(--text-primary)]'
        : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-hover)]'
    ),
    pill: cn(
      'px-5 py-2.5 rounded-xl text-[14px] sm:text-[15px] font-bold transition-all cursor-pointer select-none',
      isActive
        ? 'bg-white text-[var(--text-primary)] shadow-xs border border-[var(--border-primary)]'
        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
    ),
    enclosed: cn(
      'px-5 py-2.5 rounded-t-xl border-t border-x text-[15px] font-bold transition-colors cursor-pointer select-none -mb-px',
      isActive
        ? 'bg-white border-[var(--border-primary)] border-b-white text-[var(--text-primary)]'
        : 'bg-[var(--bg-secondary)] border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
    ),
  };

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      disabled={disabled}
      onClick={() => !disabled && setActiveTab(value)}
      className={cn(
        'inline-flex items-center gap-2 focus:outline-none',
        variantStyles[variant] || variantStyles.line,
        disabled && 'opacity-40 cursor-not-allowed',
        className
      )}
    >
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      <span>{children}</span>
      {badge && <span className="inline-flex shrink-0">{badge}</span>}
    </button>
  );
}

/**
 * Tab content view matched by active value
 */
export function TabContent({ value, children, className }) {
  const { activeTab } = useContext(TabsContext);
  if (activeTab !== value) return null;

  return (
    <div role="tabpanel" className={cn('focus:outline-none animate-fade-in', className)}>
      {children}
    </div>
  );
}

export default Tabs;
