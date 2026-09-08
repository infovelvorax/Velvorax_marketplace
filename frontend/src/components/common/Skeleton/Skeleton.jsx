import './Skeleton.css';
import React from 'react';
import { cn } from '../../../utils';

/**
 * Reusable Skeleton loader component for placeholder loading states in warm luxury theme
 */
export function Skeleton({
  variant = 'text',
  width,
  height,
  count = 1,
  className,
  ...props
}) {
  const baseStyles = 'bg-[var(--border-primary)] animate-pulse rounded-xl select-none';

  const variants = {
    text: 'h-4 w-full rounded-md',
    circular: 'rounded-full h-10 w-10 shrink-0',
    avatar: 'rounded-full h-12 w-12 shrink-0',
    rectangular: 'h-28 w-full rounded-2xl',
    button: 'h-12 w-32 rounded-xl',
    card: 'h-64 w-full rounded-2xl',
  };

  const items = Array.from({ length: count }, (_, idx) => (
    <div
      key={idx}
      className={cn(baseStyles, variants[variant] || variants.text, className)}
      style={{
        width: width !== undefined ? width : undefined,
        height: height !== undefined ? height : undefined,
      }}
      aria-hidden="true"
      {...props}
    />
  ));

  if (count === 1) return items[0];

  return <div className="flex flex-col gap-3 w-full">{items}</div>;
}

export default Skeleton;
