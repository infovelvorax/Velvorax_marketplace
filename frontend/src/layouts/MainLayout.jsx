import { ScrollToTop } from '../components';
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../components/navigation/Header';
import { Footer } from '../components/navigation/Footer';
import { MobileNav } from '../components/navigation/MobileNav';
import { CategoryDrawer } from '../components/navigation/CategoryDrawer';
import { MobileBottomBar } from '../components/navigation/MobileBottomBar';
import { MarketplaceAI } from '../components/marketplace-ai';

export function MainLayout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [categoryDrawerOpen, setCategoryDrawerOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-200">
      <ScrollToTop />
      
      {/* Top Header Navbar */}
      <Header
        onMenuClick={() => setMobileNavOpen(true)}
        onOpenCategories={() => setCategoryDrawerOpen(true)}
      />

      {/* Category Mega Drawer */}
      <CategoryDrawer
        isOpen={categoryDrawerOpen}
        onClose={() => setCategoryDrawerOpen(false)}
      />

      {/* Mobile Navigation Drawer */}
      <MobileNav
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
      />

      {/* Main Page Content (with mobile bottom padding compensation for sticky bar) */}
      <main className="flex-1 w-full bg-[var(--bg-primary)] pb-16 md:pb-0">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />

      {/* Mobile Persistent Bottom Navigation Bar (<768px) */}
      <MobileBottomBar
        onOpenCategories={() => setCategoryDrawerOpen(true)}
      />

      {/* Single Marketplace AI Assistant (Buyer & Seller Dynamic Modes) */}
      <MarketplaceAI />
    </div>
  );
}

export default MainLayout;
