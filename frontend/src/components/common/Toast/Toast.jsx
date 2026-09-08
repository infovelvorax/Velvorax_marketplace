import './Toast.css';
import { useEffect, useState } from 'react';
import { cn } from '../../../utils';

/**
 * Individual Toast notification item
 */
export function ToastItem({
  id,
  type = 'info',
  title,
  message,
  duration = 4000,
  onDismiss,
}) {
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (duration === Infinity || duration <= 0) return;
    if (isPaused) return;

    const timer = setTimeout(() => {
      onDismiss(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, isPaused, onDismiss]);

  const icons = {
    success: (
      <svg className="h-5 w-5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    error: (
      <svg className="h-5 w-5 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    warning: (
      <svg className="h-5 w-5 text-[var(--accent)] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    info: (
      <svg className="h-5 w-5 text-[var(--accent)] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };

  const borderStyles = {
    success: 'border-emerald-500/30 bg-[var(--bg-surface-elevated)] text-[var(--text-primary)]',
    error: 'border-red-500/30 bg-[var(--bg-surface-elevated)] text-[var(--text-primary)]',
    warning: 'border-[var(--accent)]/30 bg-[var(--bg-surface-elevated)] text-[var(--text-primary)]',
    info: 'border-[var(--accent)]/30 bg-[var(--bg-surface-elevated)] text-[var(--text-primary)]',
  };

  return (
    <div
      role="alert"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={cn(
        'w-full max-w-sm rounded-2xl border shadow-xl p-4 flex items-start gap-3 transition-all duration-200',
        'animate-slide-in pointer-events-auto',
        borderStyles[type] || borderStyles.info
      )}
    >
      {icons[type] || icons.info}

      <div className="flex-1 min-w-0">
        {title && <h4 className="text-[14px] font-bold text-[var(--text-primary)]">{title}</h4>}
        {message && <p className="text-[13px] text-[var(--text-secondary)] mt-0.5">{message}</p>}
      </div>

      <button
        type="button"
        onClick={() => onDismiss(id)}
        aria-label="Dismiss notification"
        className="text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-lg p-1 hover:bg-[var(--bg-secondary)] transition-colors cursor-pointer"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

/**
 * Toast container mounting active toasts in viewport
 */
export function ToastContainer({ toasts, onDismiss, position = 'top-right' }) {
  const positions = {
    'top-right': 'top-4 right-4 items-end',
    'top-left': 'top-4 left-4 items-start',
    'bottom-right': 'bottom-4 right-4 items-end',
    'bottom-left': 'bottom-4 left-4 items-start',
    'top-center': 'top-4 left-1/2 -translate-x-1/2 items-center',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2 items-center',
  };

  return (
    <div
      aria-live="polite"
      className={cn(
        'fixed z-50 flex flex-col gap-2 pointer-events-none max-w-[90vw]',
        positions[position] || positions['top-right']
      )}
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} {...toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

export default ToastContainer;
