import './Categories.css';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { categoryService } from '../../services/api/category.service';
import { Container } from '../../components/common/Container';
import { Loader } from '../../components/common/Loader';
import { ROUTES } from '../../constants';

export const CORE_SECTOR_HUBS = [
  {
    slug: 'properties',
    name: 'Properties & Real Estate',
    sellerLabel: 'Brokers & Builders',
    icon: '🏢',
    path: '/properties',
    tagline: 'Apartments, villas, plots & commercial spaces',
    stats: '1.2k+ listings'
  },
  {
    slug: 'vehicles',
    name: 'Cars & Bikes',
    sellerLabel: 'Auto Showrooms & Dealers',
    icon: '🚗',
    path: '/vehicles',
    tagline: 'Sedans, SUVs, motorcycles & spare parts',
    stats: '3.4k+ listings'
  },
  {
    slug: 'products',
    name: 'Mobiles & Electronics',
    sellerLabel: 'Electronics Retailers',
    icon: '📱',
    path: '/products',
    tagline: 'Smartphones, laptops, smart TVs & gaming',
    stats: '5.8k+ listings'
  },
  {
    slug: 'jobs',
    name: 'Jobs & Careers',
    sellerLabel: 'Employers & HR Recruiters',
    icon: '💼',
    path: '/jobs',
    tagline: 'Full-time, remote, engineering & healthcare',
    stats: '850+ vacancies'
  },
  {
    slug: 'services',
    name: 'Local Services',
    sellerLabel: 'Service Pros & Contractors',
    icon: '🛠️',
    path: '/services',
    tagline: 'Repairs, cleaning, packers, salon & pros',
    stats: '920+ services'
  },
  {
    slug: 'farm',
    name: 'Agriculture & Farm',
    sellerLabel: 'Agri Vendors & Farmers',
    icon: '🌾',
    path: '/farm',
    tagline: 'Tractors, farming machinery & acreage',
    stats: '430+ listings'
  },
  {
    slug: 'businesses',
    name: 'Business Directory',
    sellerLabel: 'Commercial Outlets & B2B',
    icon: '🏬',
    path: '/businesses',
    tagline: 'Commercial shops, companies & suppliers',
    stats: '640+ businesses'
  },
  {
    slug: 'rentals',
    name: 'Rentals & Leasing',
    sellerLabel: 'Rental Agencies & Hosts',
    icon: '🔑',
    path: '/rentals',
    tagline: 'House leases, equipment & car rentals',
    stats: '1.9k+ rentals'
  },
  {
    slug: 'free',
    name: 'Free Giveaways & Donations',
    sellerLabel: 'NGOs & Community Donors',
    icon: '🎁',
    path: '/free',
    tagline: '100% free community sharing & donations',
    stats: 'Community Aid'
  }
];

export const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoryService.getCategories();
        setCategories(data || []);
      } catch (err) {
        console.error('Error loading categories:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  return (
    <div className="bg-[var(--bg-primary)] text-[var(--text-primary)] min-h-screen py-12 transition-colors duration-200">
      <Container size="7xl">
        
        {/* Back to Home Navigation */}
        <div className="flex items-center gap-2 mb-6">
          <Link
            to={ROUTES.HOME}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-xs sm:text-sm font-bold text-[var(--text-primary)] hover:text-[var(--accent)] shadow-2xs transition-all active:scale-95 cursor-pointer group"
          >
            <span className="text-base group-hover:-translate-x-0.5 transition-transform">&larr;</span>
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--bg-surface)] border border-[var(--border-primary)] text-[var(--text-primary)] text-[12px] font-bold uppercase tracking-wider shadow-xs">
            <span className="text-[var(--accent)]">📂</span>
            <span>Complete Marketplace Directory</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-[var(--text-primary)] tracking-tight">
            All Marketplace Categories & Sectors
          </h1>
          <p className="text-[15px] sm:text-[17px] text-[var(--text-secondary)] leading-relaxed">
            Explore verified classifieds curated across all 9 core sectors, or register as a specialized seller or provider.
          </p>
        </div>

        {/* 9 Core Vertical Sector Showcases */}
        <div className="mb-14">
          <div className="flex items-center justify-between mb-6 pb-2 border-b border-[var(--border-subtle)]">
            <h2 className="text-xl font-black text-[var(--text-primary)] tracking-tight flex items-center gap-2">
              <span>🌟</span>
              <span>9 Core Marketplace Sectors</span>
            </h2>
            <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
              Dedicated Portals & Dedicated Sellers
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CORE_SECTOR_HUBS.map((sector) => (
              <div 
                key={sector.slug}
                className="bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-3xl p-6 sm:p-7 hover:border-[var(--button-primary)] transition-all hover:shadow-lg flex flex-col justify-between shadow-xs group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-primary)] flex items-center justify-center text-3xl shadow-xs group-hover:scale-105 transition-transform">
                      {sector.icon}
                    </div>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      {sector.stats}
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-black text-[var(--text-primary)] mb-1 group-hover:text-[var(--accent)] transition-colors">
                    {sector.name}
                  </h3>
                  
                  <p className="text-xs font-bold text-[var(--accent)] mb-2">
                    For: {sector.sellerLabel}
                  </p>

                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] mb-6 leading-relaxed">
                    {sector.tagline}
                  </p>
                </div>

                <div className="pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between gap-3">
                  <Link 
                    to={sector.path}
                    className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors"
                  >
                    <span>Explore Directory</span>
                    <span>&rarr;</span>
                  </Link>

                  <Link
                    to={`${ROUTES.AUTH.REGISTER}?role=SELLER&category=${sector.slug}`}
                    className="text-xs font-bold px-3 py-1.5 rounded-xl bg-[var(--bg-secondary)] hover:bg-emerald-500/15 text-[var(--text-secondary)] hover:text-emerald-500 border border-[var(--border-subtle)] hover:border-emerald-500/30 transition-all"
                  >
                    Register as Seller
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Database Categories with Subcategories */}
        {loading ? (
          <div className="py-16 flex justify-center"><Loader size="lg" /></div>
        ) : categories && categories.length > 0 ? (
          <div className="mb-14">
            <div className="flex items-center justify-between mb-6 pb-2 border-b border-[var(--border-subtle)]">
              <h2 className="text-xl font-black text-[var(--text-primary)] tracking-tight flex items-center gap-2">
                <span>📑</span>
                <span>Taxonomy & Subcategory Directory</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((cat) => (
                <div 
                  key={cat._id || cat.slug}
                  className="bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-xs"
                >
                  <div>
                    <h3 className="text-base font-bold text-[var(--text-primary)] mb-2 flex items-center gap-2">
                      <span className="text-[var(--accent)] font-black">#</span>
                      <span>{cat.name}</span>
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)] mb-4">
                      {cat.description || 'Verified classified listings in this domain.'}
                    </p>

                    {cat.subcategories && cat.subcategories.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {cat.subcategories.map(sub => (
                          <Link
                            key={sub.slug || sub.name}
                            to={`${ROUTES.SEARCH}?category=${cat.slug}&subcategory=${encodeURIComponent(sub.name)}`}
                            className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-subtle)] transition-colors"
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-[var(--border-subtle)]">
                    <Link 
                      to={`/${cat.slug === 'farm' ? 'farm' : cat.slug}`}
                      className="text-xs font-bold text-[var(--accent)] hover:underline inline-flex items-center gap-1"
                    >
                      <span>View All in {cat.name}</span>
                      <span>&rarr;</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Global Seller Onboarding Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-indigo-500/10 border border-emerald-500/30 p-8 sm:p-12 text-center max-w-4xl mx-auto space-y-4 shadow-lg">
          <span className="text-4xl">🚀</span>
          <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
            Are you a Seller, Dealership, Pro or Company?
          </h2>
          <p className="text-sm sm:text-base text-[var(--text-secondary)] max-w-xl mx-auto leading-relaxed">
            Velvorax provides tailored merchant portals for real estate builders, auto dealers, electronics stores, hiring employers, service pros, farmers & commercial enterprises.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              to={`${ROUTES.AUTH.REGISTER}?role=SELLER`}
              className="px-6 py-3.5 rounded-xl font-black text-sm bg-[var(--button-primary)] text-[var(--button-primary-text)] hover:opacity-90 transition-all shadow-md"
            >
              Register as a Seller &rarr;
            </Link>
            <Link
              to={`${ROUTES.AUTH.LOGIN}?role=SELLER`}
              className="px-6 py-3.5 rounded-xl font-bold text-sm bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-primary)] hover:border-[var(--accent)] transition-all shadow-xs"
            >
              Seller Sign In
            </Link>
          </div>
        </div>

      </Container>
    </div>
  );
};

export default Categories;
