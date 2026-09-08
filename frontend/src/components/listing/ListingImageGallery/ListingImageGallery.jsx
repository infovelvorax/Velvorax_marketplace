import React, { useState, useEffect, useCallback, useRef } from 'react';
import './ListingImageGallery.css';

/**
 * ListingImageGallery - Luxury, ultra-responsive image gallery for listing and property details.
 * Supports blur-ambient backdrop (zero image distortion for any aspect ratio),
 * smooth navigation, interactive thumbnail filmstrip, and a high-resolution lightbox.
 *
 * @param {Object} props
 * @param {Array<string|Object>} props.images - List of image URLs or media objects
 * @param {string} props.title - Listing title for accessibility & lightbox
 * @param {string} props.badgeText - Optional badge text (e.g., 'FOR SALE', 'FEATURED')
 * @param {string} props.badgeVariant - 'primary' | 'success' | 'warning'
 * @param {boolean} props.allowMosaic - Whether to allow 5-tile mosaic mode when 5+ images exist
 */
export function ListingImageGallery({
  images = [],
  title = 'Listing photo',
  badgeText = '',
  badgeVariant = 'primary',
  allowMosaic = true,
}) {
  // Normalize images to array of string URLs
  const normalizedImages = React.useMemo(() => {
    if (!Array.isArray(images) || images.length === 0) {
      return [];
    }
    return images
      .map((item) => {
        if (typeof item === 'string') return item.trim();
        if (item && typeof item === 'object') {
          return item.secure_url || item.url || '';
        }
        return '';
      })
      .filter(Boolean);
  }, [images]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxZoom, setLightboxZoom] = useState(1);
  const [isMosaicView, setIsMosaicView] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const thumbnailsRef = useRef(null);

  // Safe fallback if activeIndex exceeds available photos
  const safeActiveIndex = Math.min(activeIndex, Math.max(0, normalizedImages.length - 1));
  const currentImage = normalizedImages[safeActiveIndex] || '';

  // Scroll active thumbnail into view smoothly
  useEffect(() => {
    if (thumbnailsRef.current) {
      const activeEl = thumbnailsRef.current.querySelector(`[data-thumb-idx="${safeActiveIndex}"]`);
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [safeActiveIndex]);

  // Navigate photos
  const handlePrev = useCallback((e) => {
    e?.stopPropagation();
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : normalizedImages.length - 1));
  }, [normalizedImages.length]);

  const handleNext = useCallback((e) => {
    e?.stopPropagation();
    setActiveIndex((prev) => (prev < normalizedImages.length - 1 ? prev + 1 : 0));
  }, [normalizedImages.length]);

  // Keyboard navigation for lightbox & stage
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isLightboxOpen) {
        if (e.key === 'Escape') setIsLightboxOpen(false);
        if (e.key === 'ArrowLeft') handlePrev();
        if (e.key === 'ArrowRight') handleNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, handlePrev, handleNext]);

  // Reset zoom on slide change
  useEffect(() => {
    setLightboxZoom(1);
  }, [safeActiveIndex]);

  // If no images provided, render empty placeholder
  if (normalizedImages.length === 0) {
    return (
      <div className="listing-gallery-empty">
        <div className="listing-gallery-empty-icon">📸</div>
        <div className="listing-gallery-empty-title">No Photos Available</div>
        <div className="listing-gallery-empty-desc">The seller has not uploaded photos for this listing yet.</div>
      </div>
    );
  }

  const hasMultiple = normalizedImages.length > 1;
  const canMosaic = allowMosaic && normalizedImages.length >= 5;

  return (
    <div className="listing-gallery-container">
      {/* ============================================================ */}
      {/* GALLERY TOP ACTION / MODE BAR                                */}
      {/* ============================================================ */}
      <div className="listing-gallery-header-bar">
        <div className="listing-gallery-header-left">
          {badgeText && (
            <span className={`listing-gallery-pill-badge badge-${badgeVariant}`}>
              {badgeText}
            </span>
          )}
          <span className="listing-gallery-counter-pill">
            <span className="camera-icon">📷</span>
            <span>
              {safeActiveIndex + 1} / {normalizedImages.length} Photos
            </span>
          </span>
        </div>

        <div className="listing-gallery-header-right">
          {canMosaic && (
            <button
              type="button"
              onClick={() => setIsMosaicView((prev) => !prev)}
              className="listing-gallery-action-btn"
              title={isMosaicView ? 'Switch to Slide View' : 'Switch to Grid View'}
            >
              <span>{isMosaicView ? '🖼️ Slider' : '⊞ Grid'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsLightboxOpen(true)}
            className="listing-gallery-action-btn primary"
            title="Expand Fullscreen"
          >
            <span>⛶</span>
            <span className="hidden sm:inline">Fullscreen</span>
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 5-TILE AIRBNB MOSAIC GRID (If enabled and 5+ images)         */}
      {/* ============================================================ */}
      {isMosaicView && canMosaic ? (
        <div className="listing-gallery-mosaic-grid">
          {/* Main Large Left Tile */}
          <div
            className="mosaic-tile mosaic-tile-main"
            onClick={() => {
              setActiveIndex(0);
              setIsLightboxOpen(true);
            }}
          >
            <img src={normalizedImages[0]} alt={`${title} - Main photo`} loading="eager" />
            <div className="mosaic-tile-overlay" />
          </div>

          {/* 4 Small Right Tiles */}
          <div className="mosaic-subgrid">
            {normalizedImages.slice(1, 5).map((img, idx) => {
              const actualIdx = idx + 1;
              const isLast = idx === 3;
              const remaining = normalizedImages.length - 5;

              return (
                <div
                  key={actualIdx}
                  className="mosaic-tile mosaic-tile-sub"
                  onClick={() => {
                    setActiveIndex(actualIdx);
                    setIsLightboxOpen(true);
                  }}
                >
                  <img src={img} alt={`${title} - Photo ${actualIdx + 1}`} loading="lazy" />
                  <div className="mosaic-tile-overlay" />

                  {isLast && remaining > 0 && (
                    <div className="mosaic-more-overlay">
                      <span className="mosaic-more-icon">📷</span>
                      <span className="mosaic-more-text">+{remaining} More</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* ============================================================ */
        /* HERO STAGE (Cinematic Dual-Layer Stage)                       */
        /* ============================================================ */
        <div className="listing-gallery-stage-wrapper">
          <div
            className="listing-gallery-stage"
            onClick={() => setIsLightboxOpen(true)}
            role="button"
            tabIndex={0}
            aria-label="Click to enlarge photo in fullscreen"
          >
            {/* Layer 1: Ambient Blurred Background (Ensures zero black bars & fills viewport) */}
            <div
              className="listing-gallery-stage-ambient"
              style={{ backgroundImage: `url(${currentImage})` }}
              aria-hidden="true"
            />

            {/* Subtle dark vignette overlay */}
            <div className="listing-gallery-stage-vignette" />

            {/* Layer 2: Main Sharp Foreground Image (Preserves natural aspect ratio without distortion) */}
            <img
              key={currentImage}
              src={currentImage}
              alt={`${title} - Photo ${safeActiveIndex + 1}`}
              className={`listing-gallery-stage-img ${isLoaded ? 'loaded' : ''}`}
              onLoad={() => setIsLoaded(true)}
            />

            {/* Floating Navigation Arrows */}
            {hasMultiple && (
              <>
                <button
                  type="button"
                  onClick={handlePrev}
                  className="listing-gallery-nav-arrow arrow-left"
                  aria-label="Previous photo"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="listing-gallery-nav-arrow arrow-right"
                  aria-label="Next photo"
                >
                  ›
                </button>
              </>
            )}

            {/* Floating Expand Tooltip on Hover */}
            <div className="listing-gallery-hover-hint">
              <span>🔍 Click image to enlarge</span>
            </div>
          </div>

          {/* ============================================================ */}
          {/* INTERACTIVE THUMBNAIL FILMSTRIP                              */}
          {/* ============================================================ */}
          {hasMultiple && (
            <div className="listing-gallery-filmstrip-container">
              {normalizedImages.length > 5 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="filmstrip-scroll-btn scroll-left"
                  aria-label="Scroll thumbnails left"
                >
                  ‹
                </button>
              )}

              <div className="listing-gallery-filmstrip" ref={thumbnailsRef}>
                {normalizedImages.map((img, idx) => {
                  const isActive = idx === safeActiveIndex;
                  return (
                    <button
                      key={idx}
                      data-thumb-idx={idx}
                      type="button"
                      onClick={() => setActiveIndex(idx)}
                      className={`listing-gallery-thumb-btn ${isActive ? 'active' : ''}`}
                      aria-label={`View photo ${idx + 1}`}
                    >
                      <img src={img} alt={`Thumbnail ${idx + 1}`} loading="lazy" />
                      <span className="thumb-idx-badge">{idx + 1}</span>
                      {isActive && <span className="thumb-active-indicator" />}
                    </button>
                  );
                })}
              </div>

              {normalizedImages.length > 5 && (
                <button
                  type="button"
                  onClick={handleNext}
                  className="filmstrip-scroll-btn scroll-right"
                  aria-label="Scroll thumbnails right"
                >
                  ›
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* FULLSCREEN LIGHTBOX MODAL                                    */}
      {/* ============================================================ */}
      {isLightboxOpen && (
        <div
          className="listing-lightbox-backdrop"
          onClick={() => setIsLightboxOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          {/* Lightbox Header Bar */}
          <div className="listing-lightbox-header" onClick={(e) => e.stopPropagation()}>
            <div className="lightbox-title-box">
              <span className="lightbox-counter">
                Photo {safeActiveIndex + 1} of {normalizedImages.length}
              </span>
              <span className="lightbox-title">{title}</span>
            </div>

            <div className="lightbox-actions">
              <button
                type="button"
                onClick={() => setLightboxZoom((z) => (z >= 2.5 ? 1 : z + 0.5))}
                className="lightbox-btn"
                title="Toggle Zoom"
              >
                {lightboxZoom > 1 ? `🔍 ${Math.round(lightboxZoom * 100)}%` : '🔍 Zoom'}
              </button>

              <button
                type="button"
                onClick={() => setIsLightboxOpen(false)}
                className="lightbox-btn close"
                title="Close (Esc)"
              >
                ✕ Close
              </button>
            </div>
          </div>

          {/* Lightbox Center Image Stage */}
          <div className="listing-lightbox-stage" onClick={(e) => e.stopPropagation()}>
            {hasMultiple && (
              <button
                type="button"
                onClick={handlePrev}
                className="lightbox-arrow arrow-left"
                aria-label="Previous image"
              >
                ‹
              </button>
            )}

            <div
              className="lightbox-img-wrapper"
              style={{
                transform: `scale(${lightboxZoom})`,
                transition: 'transform 0.25s cubic-bezier(0.2, 0, 0, 1)',
              }}
            >
              <img
                src={currentImage}
                alt={`${title} - Enlarged photo ${safeActiveIndex + 1}`}
                className="lightbox-img"
              />
            </div>

            {hasMultiple && (
              <button
                type="button"
                onClick={handleNext}
                className="lightbox-arrow arrow-right"
                aria-label="Next image"
              >
                ›
              </button>
            )}
          </div>

          {/* Lightbox Bottom Thumbnail Filmstrip */}
          {hasMultiple && (
            <div className="listing-lightbox-filmstrip" onClick={(e) => e.stopPropagation()}>
              {normalizedImages.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                  className={`lightbox-thumb-btn ${idx === safeActiveIndex ? 'active' : ''}`}
                >
                  <img src={img} alt={`Thumb ${idx + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ListingImageGallery;
