import './Container.css';
import { forwardRef } from 'react';
import { cn } from '../../../utils';

/**
 * Responsive layout container wrapper with size constraints and spacious padding
 */
export const Container = forwardRef(function Container(
  {
    children,
    size = '7xl',
    className,
    ...props
  },
  ref
) {
  const sizes = {
    sm: 'max-w-screen-sm',
    md: 'max-w-screen-md',
    lg: 'max-w-screen-lg',
    xl: 'max-w-screen-xl',
    '2xl': 'max-w-screen-2xl',
    '4xl': 'max-w-4xl',
    '7xl': 'max-w-[1320px]',
    full: 'max-w-full',
  };

  return (
    <div
      ref={ref}
      className={cn(
        'w-full mx-auto px-3 sm:px-6 lg:px-8',
        sizes[size] || sizes['7xl'],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

export default Container;
