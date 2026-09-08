import './AuthLayout.css';
import React from 'react';
import { ScrollToTop } from '../components';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { ROUTES } from '../constants';
import { BrandLogo } from '../components/common/BrandLogo';
import { ThemeToggle } from '../components/common/ThemeToggle';
import { GradientWaves } from '../components/animations/GradientWaves';
import { useTheme } from '../hooks/useTheme';

/**
 * Premium Velvorax Authentication Canvas
 * Supports centered full-canvas role selection and responsive form layouts.
 */
export function AuthLayout() {
  const location = useLocation();
  const { isDark } = useTheme();
  const isLoginPage = location.pathname === ROUTES.AUTH.LOGIN || location.pathname === '/auth/login';

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300 relative overflow-x-hidden auth-canvas-bg">
      <ScrollToTop />

      {/* Dynamic Theme-Aware Gradient Waves Background */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden opacity-80">
        <GradientWaves
          horizonColor={isDark ? '#0b091a' : '#f1f5f9'}
          waveColor={isDark ? '#4338ca' : '#93c5fd'}
          crestColor={isDark ? '#c084fc' : '#ffffff'}
          speed={0.3}
          amplitude={2.0}
          waveScale={0.5}
          waveRatio={0.85}
          swell={25}
          turbulence={15}
          tilt={1.12}
          zoom={1.0}
          height={5.0}
          fogDepth={16}
          detail="low"
          brightness={isDark ? 0.9 : 1.05}
          opacity={isDark ? 0.6 : 0.35}
          mouseInteraction={true}
          parallaxStrength={0.3}
          grain={true}
          grainIntensity={isDark ? 0.03 : 0.015}
        />
      </div>

      {/* Decorative ambient background glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* TOP BRANDING BAR */}
      <header className="w-full max-w-7xl mx-auto px-6 sm:px-8 py-5 flex items-center justify-between z-20">
        {/* Brand Logo */}
        <Link to={ROUTES.HOME} className="flex items-center gap-3 group select-none">
          <BrandLogo 
            height={40} 
            className="h-[38px] sm:h-[40px] transition-transform group-hover:scale-105" 
          />
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-[var(--text-primary)] font-black tracking-wider text-xl sm:text-2xl leading-none uppercase">
                VELVORAX
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-md bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20">
                AUTH
              </span>
            </div>
            <span className="text-[var(--text-muted)] text-[10px] tracking-widest font-bold uppercase mt-0.5">
              GLOBAL MARKETPLACE
            </span>
          </div>
        </Link>

        {/* Right Controls */}
        <div className="flex items-center gap-3 sm:gap-4">
          <ThemeToggle size="md" />
          <Link
            to={ROUTES.HOME}
            className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-xs font-bold text-[var(--text-primary)] transition-all shadow-xs cursor-pointer select-none hover:border-[var(--accent)]"
          >
            <span>&larr;</span>
            <span className="hidden sm:inline">Back to Marketplace</span>
            <span className="sm:hidden">Exit</span>
          </Link>
        </div>
      </header>

      {/* MAIN AUTHENTICATION CONTENT */}
      <main className="flex-1 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-6 sm:py-10 z-10">
        <div className={`w-full ${isLoginPage ? 'max-w-6xl' : 'max-w-md'} mx-auto transition-all duration-300`}>
          <Outlet />
        </div>
      </main>

      {/* FOOTER */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-6 text-center text-xs text-[var(--text-muted)] flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-[var(--border-subtle)] z-10">
        <div>
          &copy; {new Date().getFullYear()} Velvorax Global Marketplace. All rights reserved.
        </div>
        <div className="flex items-center gap-4 text-xs font-semibold text-[var(--text-secondary)]">
          <Link to={ROUTES.HOME} className="hover:text-[var(--text-primary)] hover:underline">Privacy Policy</Link>
          <span>•</span>
          <Link to={ROUTES.HOME} className="hover:text-[var(--text-primary)] hover:underline">Terms of Service</Link>
          <span>•</span>
          <Link to={ROUTES.HOME} className="hover:text-[var(--text-primary)] hover:underline">Security</Link>
        </div>
      </footer>
    </div>
  );
}

export default AuthLayout;
