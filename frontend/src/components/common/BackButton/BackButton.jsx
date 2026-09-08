import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export const BackButton = ({
  label = 'Back',
  fallbackUrl = '/',
  className = '',
  variant = 'default',
  onClick,
  showLabel = true,
  ...props
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = (e) => {
    if (onClick) {
      onClick(e);
      return;
    }

    if (window.history.length > 1 && window.history.state?.idx > 0) {
      navigate(-1);
    } else {
      navigate(fallbackUrl);
    }
  };

  const baseStyles = "inline-flex items-center gap-2 text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer focus:outline-hidden select-none group";
  
  let variantStyles = "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] px-3 py-1.5 rounded-xl border border-[var(--border-primary)] shadow-2xs hover:border-[var(--border-secondary)] active:scale-95";
  
  if (variant === 'ghost') {
    variantStyles = "text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-2 py-1 rounded-lg hover:bg-[var(--bg-surface-hover)]";
  } else if (variant === 'pill') {
    variantStyles = "bg-[var(--bg-surface)] text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] px-4 py-2 rounded-full border border-[var(--border-primary)] shadow-xs";
  }

  return (
    <button
      type="button"
      onClick={handleBack}
      className={`${baseStyles} ${variantStyles} ${className}`}
      aria-label={label || 'Go back'}
      title={label || 'Go back'}
      {...props}
    >
      <svg className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
      </svg>
      {showLabel && <span>{label}</span>}
    </button>
  );
};

export default BackButton;
