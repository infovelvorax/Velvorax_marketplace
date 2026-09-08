import React, { useState } from 'react';
import logoAsset from '../../../assets/velvorax-logo.png';
import { cn } from '../../../utils';

/**
 * Brand Logo component that gracefully handles image loading,
 * fallback URLs, and inline golden emblem rendering if images are blocked.
 */
export function BrandLogo({ className, height = 46, alt = 'Velvorax Logo' }) {
  const [errorCount, setErrorCount] = useState(0);

  // Sequence of image sources to try before SVG fallback
  const sources = [
    logoAsset,
    '/velvorax-logo.png',
    '/src/assets/velvorax-logo.png'
  ];

  const currentSrc = sources[errorCount] || null;

  if (!currentSrc || errorCount >= sources.length) {
    // Beautiful inline Golden Sun Emblem SVG fallback matching official logo
    return (
      <svg 
        className={cn("w-auto text-[#E5A93C] shrink-0", className)} 
        style={{ height: `${height}px`, width: `${height}px` }} 
        viewBox="0 0 100 100" 
        fill="currentColor"
        aria-label={alt}
      >
        <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="6" />
        <circle cx="50" cy="35" r="9" />
        <rect x="48" y="16" width="4" height="6" rx="2" />
        <rect x="34" y="22" width="4" height="6" rx="2" transform="rotate(-40 36 25)" />
        <rect x="62" y="22" width="4" height="6" rx="2" transform="rotate(40 64 25)" />
        <rect x="25" y="34" width="6" height="4" rx="2" />
        <rect x="69" y="34" width="6" height="4" rx="2" />
        <circle cx="41" cy="46" r="7" />
        <path d="M 33 67 C 36 57, 44 49, 58 41 C 49 53, 47 62, 53 73 C 44 73, 38 71, 33 67 Z" />
      </svg>
    );
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      loading="eager"
      onError={() => setErrorCount((prev) => prev + 1)}
      style={{ height: `${height}px` }}
      className={cn("w-auto object-contain shrink-0 select-none", className)}
    />
  );
}

export default BrandLogo;
