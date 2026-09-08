import React, { useState } from 'react';
import { cn } from '../../../utils';

/**
 * RealMapLocation
 * High-performance, responsive interactive map viewer component.
 * Renders real map coordinates or address with interactive pins,
 * directions via Google Maps, and nearby connectivity points.
 */
export function RealMapLocation({
  location = {},
  title = 'Property Location',
  height = '420px',
  showDirections = true,
  className = ''
}) {
  const [mapType, setMapType] = useState('standard'); // 'standard' | 'satellite'

  const {
    country = 'India',
    region = '',
    city = 'Bengaluru',
    localArea = '',
    address = '',
    landmark = '',
    latitude,
    longitude
  } = location || {};

  const fullAddress = [localArea, address, landmark, city, region, country]
    .filter(Boolean)
    .join(', ');

  const hasCoords = 
    typeof latitude === 'number' && 
    typeof longitude === 'number' && 
    !isNaN(latitude) && 
    !isNaN(longitude) && 
    (latitude !== 0 || longitude !== 0);

  // Fallback query if coordinates are not provided
  const queryAddress = hasCoords 
    ? `${latitude},${longitude}` 
    : encodeURIComponent(fullAddress || `${city}, ${country}`);

  const googleMapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${queryAddress}`;
  const googleMapsDirUrl = `https://www.google.com/maps/dir/?api=1&destination=${queryAddress}`;

  // Embedded map iframe URL
  const embedUrl = hasCoords
    ? `https://maps.google.com/maps?q=${latitude},${longitude}&t=${mapType === 'satellite' ? 'k' : ''}&z=15&ie=UTF8&iwloc=&output=embed`
    : `https://maps.google.com/maps?q=${encodeURIComponent(fullAddress || `${city}, ${country}`)}&t=${mapType === 'satellite' ? 'k' : ''}&z=14&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className={cn("bg-[var(--bg-surface)] rounded-3xl border border-[var(--border-primary)] overflow-hidden shadow-xs text-[var(--text-primary)] transition-all", className)}>
      
      {/* Header bar with Address & Quick Actions */}
      <div className="p-5 sm:p-6 border-b border-[var(--border-subtle)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-base">📍</span>
            <h3 className="text-base sm:text-lg font-black text-[var(--text-primary)] truncate">
              {localArea ? `${localArea}, ${city}` : (city || 'Location')}
            </h3>
            {hasCoords && (
              <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                GPS Verified
              </span>
            )}
          </div>
          
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] truncate">
            {fullAddress || 'Location details available on request'}
          </p>

          {landmark && (
            <div className="text-xs text-[var(--accent)] font-bold flex items-center gap-1 mt-0.5">
              <span>🏛️</span>
              <span>Landmark: {landmark}</span>
            </div>
          )}
        </div>

        {/* Action Buttons: Directions & Map Layer Toggle */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setMapType(mapType === 'standard' ? 'satellite' : 'standard')}
            className="px-3.5 py-2 rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-primary)] text-xs font-bold text-[var(--text-primary)] transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
          >
            <span>{mapType === 'standard' ? '🛰️' : '🗺️'}</span>
            <span>{mapType === 'standard' ? 'Satellite View' : 'Map View'}</span>
          </button>

          {showDirections && (
            <a
              href={googleMapsDirUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-[var(--button-primary)] hover:bg-[var(--button-primary-hover)] text-[var(--button-primary-text)] text-xs font-bold transition-all shadow-xs border border-[var(--button-primary)] flex items-center gap-1.5 cursor-pointer active:scale-98"
            >
              <span>🧭</span>
              <span>Get Directions</span>
            </a>
          )}
        </div>
      </div>

      {/* Interactive Map Frame */}
      <div className="relative w-full overflow-hidden bg-[var(--bg-secondary)]" style={{ height }}>
        <iframe
          title={title || 'Real Map Location'}
          width="100%"
          height="100%"
          frameBorder="0"
          scrolling="no"
          marginHeight="0"
          marginWidth="0"
          src={embedUrl}
          className="w-full h-full border-0 filter contrast-105"
          loading="lazy"
          allowFullScreen
        />

        {/* Floating Open Full Map Badge */}
        <div className="absolute bottom-4 right-4 z-10">
          <a
            href={googleMapsSearchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-xl bg-black/80 hover:bg-black text-white backdrop-blur-md text-xs font-bold border border-white/20 shadow-lg transition-all flex items-center gap-1.5"
          >
            <span>↗️</span>
            <span>Open in Google Maps</span>
          </a>
        </div>
      </div>

      {/* Proximity & Neighbourhood Highlights */}
      <div className="p-5 sm:p-6 bg-[var(--bg-surface)] border-t border-[var(--border-subtle)]">
        <h4 className="text-xs uppercase font-bold text-[var(--text-secondary)] mb-3 tracking-wider flex items-center gap-2">
          <span>🏙️</span>
          <span>Neighbourhood & Connectivity</span>
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 text-xs text-[var(--text-primary)]">
          <div className="p-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex items-center gap-2">
            <span>🚇</span>
            <span className="font-semibold truncate">Metro / Rapid Transit</span>
          </div>
          <div className="p-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex items-center gap-2">
            <span>🛒</span>
            <span className="font-semibold truncate">Supermarkets & Retail</span>
          </div>
          <div className="p-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex items-center gap-2">
            <span>🏥</span>
            <span className="font-semibold truncate">Healthcare & Hospitals</span>
          </div>
          <div className="p-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex items-center gap-2">
            <span>🏫</span>
            <span className="font-semibold truncate">Schools & Colleges</span>
          </div>
        </div>
      </div>

    </div>
  );
}

export default RealMapLocation;
