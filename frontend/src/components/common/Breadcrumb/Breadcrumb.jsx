import './Breadcrumb.css';
import { Link } from 'react-router-dom';
import { cn } from '../../../utils';

/**
 * Reusable Breadcrumb component supporting either an items array or compound children
 */
export function Breadcrumb({
  items,
  separator,
  children,
  className,
}) {
  const defaultSeparator = (
    <svg className="h-3.5 w-3.5 text-[var(--text-muted)] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );

  const resolvedSeparator = separator !== undefined ? separator : defaultSeparator;

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('flex items-center text-sm text-[var(--text-secondary)]', className)}
    >
      <ol className="flex items-center gap-2 flex-wrap">
        {items
          ? items.map((item, index) => {
              const isLast = index === items.length - 1;

              return (
                <li key={index} className="inline-flex items-center gap-2">
                  {item.href && !isLast ? (
                    <Link
                      to={item.href}
                      className="hover:text-[var(--accent)] transition-colors inline-flex items-center gap-1.5 font-medium"
                    >
                      {item.icon && <span className="inline-flex shrink-0">{item.icon}</span>}
                      <span>{item.label}</span>
                    </Link>
                  ) : (
                    <span
                      className={cn(
                        'inline-flex items-center gap-1.5',
                        isLast ? 'font-semibold text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'
                      )}
                      aria-current={isLast ? 'page' : undefined}
                    >
                      {item.icon && <span className="inline-flex shrink-0">{item.icon}</span>}
                      <span>{item.label}</span>
                    </span>
                  )}

                  {!isLast && (
                    <span className="select-none text-[var(--text-muted)]" aria-hidden="true">
                      {resolvedSeparator}
                    </span>
                  )}
                </li>
              );
            })
          : children}
      </ol>
    </nav>
  );
}

export function BreadcrumbItem({
  children,
  href,
  isCurrent = false,
  className,
}) {
  return (
    <li className={cn('inline-flex items-center gap-1.5', className)}>
      {href && !isCurrent ? (
        <Link to={href} className="hover:text-[var(--accent)] transition-colors font-medium">
          {children}
        </Link>
      ) : (
        <span
          className={isCurrent ? 'font-semibold text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}
          aria-current={isCurrent ? 'page' : undefined}
        >
          {children}
        </span>
      )}
    </li>
  );
}

export function BreadcrumbSeparator({ children, className }) {
  return (
    <li
      role="presentation"
      aria-hidden="true"
      className={cn('text-[var(--text-muted)] select-none inline-flex items-center', className)}
    >
      {children || (
        <svg className="h-3.5 w-3.5 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      )}
    </li>
  );
}

export default Breadcrumb;
