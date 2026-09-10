import './CategoryDrawer.css';
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../constants';
import { cn } from '../../../utils';

export function CategoryDrawer({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('all');
  const [mobileExpanded, setMobileExpanded] = useState(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // The 9 core marketplace categories with verified photographic assets and subcategories
  const categories = [
    {
      id: 'properties',
      title: 'Properties & Real Estate',
      subtitle: 'Homes, villas, plots & commercial spaces',
      image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=800',
      icon: '🏢',
      path: ROUTES.PROPERTIES,
      count: '1.2k+ ads',
      tag: 'Real Estate',
      subcategories: [
        { name: 'Houses & Apartments for Sale', path: `${ROUTES.PROPERTIES}?listingType=sell` },
        { name: 'Houses for Rent', path: `${ROUTES.PROPERTIES}?listingType=rent` },
        { name: 'Land & Plots', path: `${ROUTES.SEARCH}?category=properties&subcategory=Land` },
        { name: 'Commercial Spaces', path: `${ROUTES.SEARCH}?category=properties&subcategory=Commercial` }
      ]
    },
    {
      id: 'vehicles',
      title: 'Cars & Bikes',
      subtitle: 'Sedans, SUVs, motorcycles & spare parts',
      image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=800',
      icon: '🚗',
      path: ROUTES.VEHICLES,
      count: '3.4k+ ads',
      tag: 'Motors',
      subcategories: [
        { name: 'Used & New Cars', path: `${ROUTES.VEHICLES}?subcategory=Cars` },
        { name: 'Motorcycles & Scooters', path: `${ROUTES.VEHICLES}?subcategory=Motorcycles+%26+Scooters` },
        { name: 'Commercial Vehicles', path: `${ROUTES.VEHICLES}?subcategory=Commercial+Vehicles` },
        { name: 'Auto Spare Parts', path: `${ROUTES.VEHICLES}?subcategory=Spare+Parts+%26+Accessories` }
      ]
    },
    {
      id: 'products',
      title: 'Mobiles & Electronics',
      subtitle: 'Smartphones, laptops, smart TVs & gaming',
      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800',
      icon: '📱',
      path: ROUTES.PRODUCTS,
      count: '5.8k+ ads',
      tag: 'Tech',
      subcategories: [
        { name: 'Smartphones & Tablets', path: `${ROUTES.SEARCH}?category=products&subcategory=Mobile+Phones` },
        { name: 'Laptops & PCs', path: `${ROUTES.SEARCH}?category=products&subcategory=Laptops` },
        { name: 'TVs & Audio Systems', path: `${ROUTES.SEARCH}?category=products&subcategory=TVs+%26+Audio` },
        { name: 'Gaming & Consoles', path: `${ROUTES.SEARCH}?category=products&subcategory=Gaming` }
      ]
    },
    {
      id: 'jobs',
      title: 'Jobs & Careers',
      subtitle: 'Full-time, remote, engineering & healthcare',
      image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800',
      icon: '💼',
      path: ROUTES.JOBS,
      count: '850+ jobs',
      tag: 'Careers',
      subcategories: [
        { name: 'Full-Time Positions', path: `${ROUTES.JOBS}?jobType=full` },
        { name: 'Remote & Work from Home', path: `${ROUTES.JOBS}?jobType=remote` },
        { name: 'Part-Time & Internship', path: `${ROUTES.JOBS}?jobType=part` },
        { name: 'Freelance & Contract', path: `${ROUTES.JOBS}?jobType=freelance` }
      ]
    },
    {
      id: 'services',
      title: 'Local Services',
      subtitle: 'Repairs, cleaning, packers, salon & pros',
      image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=800',
      icon: '🛠️',
      path: ROUTES.SERVICES,
      count: '920+ pros',
      tag: 'Services',
      subcategories: [
        { name: 'AC & Appliance Repair', path: `${ROUTES.SEARCH}?category=services&subcategory=Home+Services` },
        { name: 'Deep Cleaning & Pest Control', path: `${ROUTES.SEARCH}?category=services&subcategory=Cleaning` },
        { name: 'Packers & Movers', path: `${ROUTES.SEARCH}?category=services&subcategory=Movers` },
        { name: 'Business Consultants', path: `${ROUTES.SEARCH}?category=services&subcategory=Professional+Services` }
      ]
    },
    {
      id: 'farm',
      title: 'Agriculture & Farm',
      subtitle: 'Tractors, farming machinery & acreage',
      image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=800',
      icon: '🌾',
      path: ROUTES.FARM,
      count: '430+ items',
      tag: 'Agri',
      subcategories: [
        { name: 'Tractors & Harvesters', path: `${ROUTES.FARM}?subcategory=Tractors+%26+Machinery` },
        { name: 'Livestock & Animals', path: `${ROUTES.FARM}?subcategory=Livestock+%26+Animals` },
        { name: 'Organic Seeds & Feed', path: `${ROUTES.FARM}?subcategory=Seeds+%26+Feed` },
        { name: 'Farmland & Plots', path: `${ROUTES.FARM}?subcategory=Agricultural+Land` }
      ]
    },
    {
      id: 'businesses',
      title: 'Business Directory',
      subtitle: 'Commercial shops, companies & suppliers',
      image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=800',
      icon: '🏬',
      path: ROUTES.BUSINESSES,
      count: '640+ stores',
      tag: 'B2B',
      subcategories: [
        { name: 'Businesses for Sale', path: ROUTES.BUSINESSES },
        { name: 'Retail Shops & Outlets', path: `${ROUTES.SEARCH}?category=businesses&subcategory=Shops` },
        { name: 'Wholesale Suppliers', path: `${ROUTES.SEARCH}?category=businesses&subcategory=Suppliers` },
        { name: 'Commercial Equipment', path: `${ROUTES.SEARCH}?category=businesses&subcategory=Companies` }
      ]
    },
    {
      id: 'rentals',
      title: 'Rentals & Leasing',
      subtitle: 'House leases, equipment & car rentals',
      image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=800',
      icon: '🔑',
      path: `${ROUTES.SEARCH}?listingType=rent`,
      count: '1.9k+ listings',
      tag: 'Rentals',
      subcategories: [
        { name: 'Residential House Rent', path: `${ROUTES.PROPERTIES}?listingType=rent` },
        { name: 'Car & Bike Rentals', path: `${ROUTES.SEARCH}?category=vehicles&listingType=rent` },
        { name: 'Equipment & Tool Hire', path: `${ROUTES.SEARCH}?listingType=rent` },
        { name: 'Event Space Leasing', path: `${ROUTES.SEARCH}?category=properties&listingType=rent` }
      ]
    },
    {
      id: 'giveaways',
      title: 'Free Giveaways',
      subtitle: '100% free community sharing & donations',
      image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=800',
      icon: '🎁',
      path: `${ROUTES.SEARCH}?listingType=free`,
      count: '280+ gifts',
      tag: 'Free',
      subcategories: [
        { name: 'Household Furniture', path: `${ROUTES.SEARCH}?listingType=free` },
        { name: 'Books, Hobbies & Toys', path: `${ROUTES.SEARCH}?listingType=free&category=products` },
        { name: 'Clothing & Essentials', path: `${ROUTES.SEARCH}?listingType=free` },
        { name: 'Community Donations', path: `${ROUTES.SEARCH}?listingType=free` }
      ]
    }
  ];

  const handleNavigate = (path) => {
    onClose?.();
    navigate(path);
  };

  const filteredCategories = !activeFilter || activeFilter === 'all'
    ? categories
    : categories.filter((c) => (c?.tag || '').toLowerCase() === (activeFilter || '').toLowerCase());

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true" aria-label="Marketplace categories mega menu">
      
      {/* Backdrop overlay */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* ============================================================ */}
      {/* DESKTOP & TABLET: MEGA MENU MODAL (screen >= 768px)          */}
      {/* ============================================================ */}
      <div className="hidden md:flex min-h-full items-start justify-center p-4 sm:p-6 lg:p-8 pt-10 sm:pt-14">
        <div className="relative w-full max-w-6xl bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-3xl shadow-2xl z-10 overflow-hidden transform transition-all duration-300 animate-scale-in text-[var(--text-primary)]">
          
          {/* Header Bar */}
          <div className="flex items-center justify-between px-6 sm:px-10 py-6 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-primary)] flex items-center justify-center text-xl text-[var(--accent)] shadow-xs">
                ☰
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black uppercase tracking-widest text-[var(--accent)]">
                    Marketplace Explorer
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-md font-bold bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-primary)]">
                    9 Sectors
                  </span>
                </div>
                <h2 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">
                  Explore All Categories
                </h2>
              </div>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close categories"
              className="p-2.5 rounded-2xl text-[var(--text-muted)] hover:text-[var(--text-primary)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-primary)] transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Quick Purpose Tabs */}
          <div className="px-6 sm:px-10 py-3.5 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] flex items-center justify-between gap-4 overflow-x-auto">
            <div className="flex items-center gap-2">
              {[
                { label: 'All 9 Sectors', id: 'all' },
                { label: 'Real Estate', id: 'real estate' },
                { label: 'Motors', id: 'motors' },
                { label: 'Tech & Electronics', id: 'tech' },
                { label: 'Jobs', id: 'careers' },
                { label: 'Services', id: 'services' },
                { label: 'Free Items', id: 'free' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveFilter(tab.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    activeFilter === tab.id
                      ? 'bg-[var(--button-primary)] text-[var(--button-primary-text)] shadow-xs border border-[var(--button-primary)]'
                      : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-transparent hover:border-[var(--border-primary)]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <Link
              to={ROUTES.CATEGORIES}
              onClick={onClose}
              className="text-xs font-bold text-[var(--accent)] hover:underline whitespace-nowrap hidden lg:inline-flex items-center gap-1"
            >
              <span>Full Directory</span>
              <span>&rarr;</span>
            </Link>
          </div>

          {/* 3-Column Grid of Photographic Category Cards */}
          <div className="p-6 sm:p-8 lg:p-10 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
              {filteredCategories.map((cat) => (
                <div
                  key={cat.id}
                  className="group relative bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-2xl overflow-hidden hover:border-[var(--button-primary)] hover:shadow-lg transition-all duration-200 flex flex-col justify-between"
                >
                  {/* Category Card Header with Photographic Banner */}
                  <div
                    onClick={() => handleNavigate(cat.path)}
                    className="cursor-pointer select-none"
                  >
                    <div className="relative h-28 w-full overflow-hidden bg-[var(--bg-secondary)]">
                      <img
                        src={cat.image}
                        alt={cat.title}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                      
                      {/* Floating Category Tag / Count */}
                      <div className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-[11px] font-bold text-white border border-white/20">
                        {cat.count}
                      </div>

                      {/* Icon & Category Title Overlay */}
                      <div className="absolute bottom-2.5 left-3.5 right-3.5 flex items-center justify-between text-white">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-xl shrink-0">{cat.icon}</span>
                          <h3 className="font-bold text-[15px] sm:text-[16px] truncate text-white">
                            {cat.title}
                          </h3>
                        </div>
                        <span className="text-white/80 group-hover:text-white group-hover:translate-x-1 transition-all text-sm font-bold shrink-0 ml-1">
                          &rarr;
                        </span>
                      </div>
                    </div>

                    {/* Subtitle / Description */}
                    <div className="p-3.5 pb-2">
                      <p className="text-[12px] text-[var(--text-secondary)] line-clamp-1 leading-snug">
                        {cat.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Quick Subcategory Pills */}
                  <div className="px-3.5 pb-3.5 pt-1 border-t border-[var(--border-subtle)] flex flex-wrap gap-1.5 mt-auto">
                    {cat.subcategories.map((sub, sIdx) => (
                      <button
                        key={sIdx}
                        type="button"
                        onClick={() => handleNavigate(sub.path)}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-[var(--bg-secondary)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] hover:border-[var(--button-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer truncate max-w-[200px]"
                        title={sub.name}
                      >
                        {sub.name}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mega Menu Footer */}
          <div className="p-5 px-6 sm:px-10 border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)] flex items-center justify-between gap-4 text-xs text-[var(--text-secondary)]">
            <div className="flex items-center gap-4">
              <span>⚡ Fast Direct Transactions</span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline">🛡️ Verified Buyer & Seller Badges</span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline">🌍 Global Locations</span>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link
                to={ROUTES.POST_LISTING}
                onClick={onClose}
                className="px-4 py-2 bg-[var(--button-primary)] text-[var(--button-primary-text)] font-bold rounded-xl hover:bg-[var(--button-primary-hover)] transition-colors shadow-xs border border-[var(--button-primary)]"
              >
                + Post Free Listing
              </Link>
            </div>
          </div>

        </div>
      </div>

      {/* ============================================================ */}
      {/* MOBILE: FULL-HEIGHT SLIDE-OVER DRAWER (screen < 768px)       */}
      {/* ============================================================ */}
      <div className="md:hidden fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-md bg-[var(--bg-surface)] border-l border-[var(--border-primary)] shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out animate-slide-left text-[var(--text-primary)]">
          
          {/* Mobile Drawer Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)] flex items-center justify-center text-base text-[var(--accent)] shadow-xs">
                ☰
              </div>
              <div>
                <h2 className="text-lg font-black text-[var(--text-primary)] tracking-tight">
                  Categories
                </h2>
                <p className="text-[11px] text-[var(--text-secondary)]">
                  9 Verified Marketplace Sectors
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close categories"
              className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors cursor-pointer border border-transparent hover:border-[var(--border-primary)]"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Mobile Drawer Content List (>= 48px touch targets) */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {categories.map((cat) => {
              const isExpanded = mobileExpanded === cat.id;

              return (
                <div
                  key={cat.id}
                  className="rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-surface)] overflow-hidden transition-all shadow-xs"
                >
                  <div
                    onClick={() => setMobileExpanded(isExpanded ? null : cat.id)}
                    className="p-3.5 flex items-center justify-between gap-3 cursor-pointer select-none min-h-[52px] active:bg-[var(--bg-secondary)]"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-[var(--bg-secondary)] border border-[var(--border-primary)] shrink-0 relative">
                        <img
                          src={cat.image}
                          alt={cat.title}
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-[14px] text-[var(--text-primary)] truncate">
                          {cat.title}
                        </div>
                        <div className="text-[11px] text-[var(--text-secondary)] truncate">
                          {cat.count} • {cat.subtitle}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={`text-[var(--text-muted)] font-bold text-base transition-transform duration-200 ${
                        isExpanded ? 'rotate-90 text-[var(--accent)]' : ''
                      }`}>
                        ›
                      </span>
                    </div>
                  </div>

                  {/* Subcategories Expanded Area */}
                  {isExpanded && (
                    <div className="px-3.5 pb-3.5 pt-2 border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)]/50 space-y-2">
                      <div className="grid grid-cols-1 gap-1.5">
                        {cat.subcategories.map((sub, sIdx) => (
                          <button
                            key={sIdx}
                            type="button"
                            onClick={() => handleNavigate(sub.path)}
                            className="w-full text-left px-3 py-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--button-primary)] text-[12px] font-semibold text-[var(--text-primary)] transition-colors flex items-center justify-between min-h-[44px] active:scale-98"
                          >
                            <span className="truncate">{sub.name}</span>
                            <span className="text-[var(--accent)] font-bold">&rarr;</span>
                          </button>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleNavigate(cat.path)}
                        className="w-full py-2.5 px-3 rounded-xl bg-[var(--button-primary)] text-[var(--button-primary-text)] font-bold text-[12px] text-center shadow-xs border border-[var(--button-primary)] mt-1"
                      >
                        View All {cat.title} &rarr;
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Mobile Footer */}
          <div className="p-4 border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)] flex items-center justify-between gap-3">
            <Link
              to={ROUTES.CATEGORIES}
              onClick={onClose}
              className="text-xs font-bold text-[var(--accent)] hover:underline"
            >
              All 9 Sectors Directory &rarr;
            </Link>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-primary)] text-[var(--text-primary)] font-bold text-xs rounded-xl"
            >
              Close
            </button>
          </div>

        </div>
      </div>

    </div>
  );
}

export default CategoryDrawer;
