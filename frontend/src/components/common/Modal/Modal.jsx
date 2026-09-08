import './Modal.css';
import React, { useEffect } from 'react';
import { cn } from '../../../utils';

/**
 * Reusable Modal dialog component with dynamic theme support.
 */
export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEsc = true,
  className,
}) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (closeOnEsc && e.key === 'Escape') {
        onClose?.();
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, closeOnEsc, onClose]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-[95vw] min-h-[90vh]',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={closeOnOverlayClick ? onClose : undefined}
      />

      {/* Modal Container */}
      <div
        className={cn(
          'relative w-full bg-[var(--bg-surface)] rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col border border-[var(--border-primary)]',
          'transform transition-all max-h-[90vh] animate-scale-in text-[var(--text-primary)]',
          sizes[size] || sizes.md,
          className
        )}
      >
        {/* Header */}
        {(title || onClose) && (
          <div className="flex items-start justify-between px-6 sm:px-8 pt-6 sm:pt-7 pb-4 sm:pb-5 border-b border-[var(--border-subtle)] bg-[var(--bg-subtle)]">
            <div>
              {title && (
                <h3
                  id="modal-title"
                  className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] tracking-tight"
                >
                  {title}
                </h3>
              )}
              {description && (
                <p className="mt-1 text-[14px] text-[var(--text-secondary)]">{description}</p>
              )}
            </div>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close modal"
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-xl p-2 hover:bg-[var(--bg-secondary)] transition-colors cursor-pointer"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Content Body */}
        <div className="px-6 sm:px-8 py-6 overflow-y-auto flex-1 text-[var(--text-primary)] text-[15px]">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 px-6 sm:px-8 py-5 bg-[var(--bg-subtle)] border-t border-[var(--border-subtle)]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export default Modal;
