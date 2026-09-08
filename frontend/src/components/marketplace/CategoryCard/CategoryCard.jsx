import './CategoryCard.css';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../../utils';

export function CategoryCard({
  title,
  subtitle,
  image,
  icon,
  path,
  count,
  className
}) {
  const [imgError, setImgError] = useState(false);

  // Fallback high quality image if none provided or fails to load
  const fallbackImage = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=800';
  const displayImage = imgError || !image ? fallbackImage : image;

  return (
    <Link 
      to={path}
      className={cn(
        "group category-card category-card-3d relative flex flex-col bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-3xl overflow-hidden cursor-pointer shadow-xs",
        className
      )}
    >
      {/* Dominant Real Photographic Image */}
      <div className="relative aspect-[16/10] sm:aspect-[16/11] overflow-hidden bg-[var(--bg-secondary)]">
        <img
          src={displayImage}
          alt={title}
          loading="lazy"
          onError={() => setImgError(true)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />
        {/* Subtle Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-40 group-hover:opacity-60 transition-opacity" />

        {/* Small Supplementary Icon Badge if provided */}
        {icon && (
          <div className="absolute top-3 left-3 w-8 h-8 rounded-lg bg-[var(--bg-surface)]/90 backdrop-blur-xs text-base flex items-center justify-center shadow-xs border border-white/20">
            {icon}
          </div>
        )}

        {/* Arrow Badge Right */}
        <div className="absolute bottom-3 right-3 w-7 h-7 rounded-full bg-white/90 text-[var(--button-primary)] flex items-center justify-center text-xs font-black shadow-md opacity-0 group-hover:opacity-100 transform translate-y-1 group-hover:translate-y-0 transition-all duration-200">
          &rarr;
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between gap-1">
        <div>
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-black text-[var(--text-primary)] text-[17px] sm:text-[18px] group-hover:text-[var(--accent)] transition-colors tracking-tight">
              {title}
            </h3>
          </div>
          {subtitle && (
            <p className="text-[13px] text-[var(--text-secondary)] line-clamp-2 mt-1 leading-snug">
              {subtitle}
            </p>
          )}
        </div>

        {count !== undefined && (
          <div className="mt-2 pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-[12px] font-bold text-[var(--text-muted)]">
            <span>Explore directory</span>
            <span className="text-[var(--accent)] font-semibold">{count} listings &rarr;</span>
          </div>
        )}
      </div>
    </Link>
  );
}

export default CategoryCard;
