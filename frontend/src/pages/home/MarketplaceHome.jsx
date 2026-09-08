import './MarketplaceHome.css';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container } from '../../components/common/Container';
import { CategoryCard } from '../../components/marketplace/CategoryCard';
import { PropertyCard } from '../properties/components/PropertyCard';
import { ListingCard } from '../../components/listing/ListingCard';
import { SearchBar } from '../../components/marketplace/SearchBar';
import { Loader } from '../../components/common/Loader';
import { LocationSelector } from '../../components/common/LocationSelector';
import { GradientWaves } from '../../components/animations/GradientWaves';
import { useLocationContext } from '../../context/LocationContext';
import { useTheme } from '../../hooks/useTheme';
import { listingsService } from '../../services/api/listings.service';
import { ROUTES } from '../../constants';
import { cn } from '../../utils';

export function MarketplaceHome() {
  const { selectedLocation, setCity } = useLocationContext();
  const { isDark } = useTheme();
  const [showLocationModal, setShowLocationModal] = useState(false);

  // Active Category Filter for Recommended Listings Feed
  const [activeCategory, setActiveCategory] = useState('all');
  const [recommendedListings, setRecommendedListings] = useState([]);
  const [loadingListings, setLoadingListings] = useState(true);

  // 9 Photographic Categories with real high-resolution images
  const photographicCategories = [
    {
      id: 'properties',
      title: 'Properties & Real Estate',
      subtitle: 'Luxury apartments, villas, plots & commercial spaces',
      image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=800',
      icon: '🏢',
      path: ROUTES.PROPERTIES,
      count: '1.2k+'
    },
    {
      id: 'vehicles',
      title: 'Cars & Bikes',
      subtitle: 'Sedans, SUVs, motorcycles & spare parts',
      image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=800',
      icon: '🚗',
      path: ROUTES.VEHICLES,
      count: '3.4k+'
    },
    {
      id: 'products',
      title: 'Mobiles & Electronics',
      subtitle: 'Smartphones, laptops, smart TVs & gaming',
      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800',
      icon: '📱',
      path: ROUTES.PRODUCTS,
      count: '5.8k+'
    },
    {
      id: 'jobs',
      title: 'Jobs & Careers',
      subtitle: 'Full-time, remote, engineering & healthcare',
      image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800',
      icon: '💼',
      path: ROUTES.JOBS,
      count: '850+'
    },
    {
      id: 'services',
      title: 'Local Services',
      subtitle: 'Repairs, cleaning, packers, salon & pros',
      image: '/service-technician-standard.jpg',
      icon: '🛠️',
      path: ROUTES.SERVICES,
      count: '920+'
    },
    {
      id: 'farm',
      title: 'Agriculture & Farm',
      subtitle: 'Tractors, farming machinery & acreage',
      image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=800',
      icon: '🌾',
      path: ROUTES.FARM,
      count: '430+'
    },
    {
      id: 'businesses',
      title: 'Business Directory',
      subtitle: 'Commercial shops, companies & suppliers',
      image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=800',
      icon: '🏬',
      path: ROUTES.BUSINESSES,
      count: '640+'
    },
    {
      id: 'rentals',
      title: 'Rentals & Leasing',
      subtitle: 'House leases, equipment & car rentals',
      image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=800',
      icon: '🔑',
      path: ROUTES.RENTALS,
      count: '1.9k+'
    },
    {
      id: 'giveaways',
      title: 'Free Giveaways',
      subtitle: '100% free community sharing & donations',
      image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=800',
      icon: '🎁',
      path: ROUTES.FREE,
      count: '280+'
    }
  ];

  // Quick Filter Options for Recommended Feed
  const feedFilterOptions = [
    { id: 'all', label: '✨ All Featured', query: {} },
    { id: 'properties', label: '🏡 Properties', query: { category: 'properties' } },
    { id: 'vehicles', label: '🚗 Vehicles', query: { category: 'vehicles' } },
    { id: 'products', label: '📱 Electronics', query: { category: 'products' } },
    { id: 'jobs', label: '💼 Jobs', query: { category: 'jobs' } },
    { id: 'services', label: '🛠️ Services', query: { category: 'services' } }
  ];

  // Major Global Cities Quick-Picks
  const hubCities = [
    { name: 'Dubai', country: 'United Arab Emirates', region: 'Dubai', symbol: 'AED' },
    { name: 'London', country: 'United Kingdom', region: 'England', symbol: '£' },
    { name: 'New York City', country: 'United States', region: 'New York', symbol: '$' },
    { name: 'San Francisco', country: 'United States', region: 'California', symbol: '$' },
    { name: 'Bengaluru', country: 'India', region: 'Karnataka', symbol: '₹' },
    { name: 'Chennai', country: 'India', region: 'Tamil Nadu', symbol: '₹' },
    { name: 'Mumbai', country: 'India', region: 'Maharashtra', symbol: '₹' },
    { name: 'Hyderabad', country: 'India', region: 'Telangana', symbol: '₹' }
  ];

  // Trust features ticker
  const trustHighlights = [
    { icon: '🛡️', title: '100% Verified', desc: 'Authentic listings & trusted sellers' },
    { icon: '🌍', title: 'Global Reach', desc: 'Worldwide hubs & multi-currency' },
    { icon: '💬', title: 'Direct Chat', desc: 'Zero middleman buyer inquiries' },
    { icon: '⚡', title: 'Instant Live', desc: 'Real-time moderation & update content' }
  ];

  // Fetch real listings dynamically based on active filter
  useEffect(() => {
    let isMounted = true;
    const fetchRecommended = async () => {
      setLoadingListings(true);
      try {
        const activeObj = feedFilterOptions.find(f => f.id === activeCategory) || feedFilterOptions[0];
        const res = await listingsService.getListings({
          ...activeObj.query,
          limit: 6,
          sortBy: 'newest'
        });
        const items = res?.data?.listings || res?.listings || res?.data || [];
        if (isMounted) {
          setRecommendedListings(items);
        }
      } catch (err) {
        console.error('Failed to fetch recommended listings', err);
        if (isMounted) setRecommendedListings([]);
      } finally {
        if (isMounted) setLoadingListings(false);
      }
    };

    fetchRecommended();
    return () => { isMounted = false; };
  }, [activeCategory]);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-200">
      
      {/* ============================================================ */}
      {/* 1. HERO SECTION & MAIN SEARCH (GRADIENT WAVES BACKGROUND)    */}
      {/* ============================================================ */}
      <section className="hero-animated-bg relative pt-10 pb-12 sm:pt-16 sm:pb-18 overflow-hidden border-b border-[var(--border-subtle)] flex items-center">
        
        {/* Dynamic Theme-Aware Gradient Waves Background */}
        <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden opacity-90 transition-opacity duration-300">
          <GradientWaves
            horizonColor={isDark ? '#0b091a' : '#f1f5f9'}
            waveColor={isDark ? '#4338ca' : '#93c5fd'}
            crestColor={isDark ? '#c084fc' : '#ffffff'}
            speed={0.35}
            amplitude={2.2}
            waveScale={0.55}
            waveRatio={0.85}
            swell={30}
            turbulence={18}
            tilt={1.15}
            zoom={1.0}
            height={5.2}
            fogDepth={16}
            detail="medium"
            brightness={isDark ? 0.95 : 1.05}
            opacity={isDark ? 0.75 : 0.42}
            mouseInteraction={true}
            parallaxStrength={0.4}
            grain={true}
            grainIntensity={isDark ? 0.035 : 0.02}
          />
        </div>

        {/* Ambient Floating Light Orbs */}
        <div className="floating-orb floating-orb-1" />
        <div className="floating-orb floating-orb-2" />
        <div className="floating-orb floating-orb-3" />

        <Container size="7xl" className="relative z-10 w-full">
          {/* Centered Hero Branding & Search */}
          <div className="max-w-4xl mx-auto flex flex-col items-center text-center space-y-4 sm:space-y-6">
            
            {/* Animated Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--bg-surface)]/90 backdrop-blur-md border border-[var(--border-primary)] text-[var(--text-primary)] text-[11px] sm:text-xs font-black shadow-xs tracking-wide">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block pulse-indicator text-emerald-500" />
              <span>Velvorax Next-Gen Global Classifieds</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight hero-headline-gradient leading-[1.12]">
              What Are You Looking For Today?
            </h1>

            {/* Supporting Copy */}
            <p className="text-xs sm:text-sm md:text-base text-[var(--text-secondary)] max-w-2xl leading-relaxed font-medium">
              Explore verified real estate properties, vehicles, electronics, careers, and local services across worldwide hubs with zero friction.
            </p>

            {/* Centerpiece Hero Search Bar */}
            <div className="w-full max-w-3xl pt-1 sm:pt-2">
              <SearchBar compact={false} className="glass-panel-luxury" />
            </div>

            {/* Quick Category Shortcuts */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 pt-1">
              <span className="text-[var(--text-muted)] font-bold text-[11px] uppercase tracking-wider mr-1">
                Popular Categories:
              </span>
              <Link
                to={ROUTES.PROPERTIES}
                className="px-3 py-1.5 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[11px] sm:text-xs font-bold text-[var(--text-secondary)] hover:text-blue-400 transition-colors shadow-2xs"
              >
                🏢 Properties
              </Link>
              <Link
                to={ROUTES.VEHICLES}
                className="px-3 py-1.5 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[11px] sm:text-xs font-bold text-[var(--text-secondary)] hover:text-emerald-400 transition-colors shadow-2xs"
              >
                🚗 Vehicles
              </Link>
              <Link
                to={ROUTES.PRODUCTS}
                className="px-3 py-1.5 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[11px] sm:text-xs font-bold text-[var(--text-secondary)] hover:text-purple-400 transition-colors shadow-2xs"
              >
                📱 Electronics
              </Link>
              <Link
                to={ROUTES.SERVICES}
                className="px-3 py-1.5 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[11px] sm:text-xs font-bold text-[var(--text-secondary)] hover:text-amber-400 transition-colors shadow-2xs"
              >
                🛠️ Services
              </Link>
              <Link
                to={ROUTES.JOBS}
                className="px-3 py-1.5 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[11px] sm:text-xs font-bold text-[var(--text-secondary)] hover:text-indigo-400 transition-colors shadow-2xs"
              >
                💼 Jobs
              </Link>
              <Link
                to={ROUTES.AGRICULTURE}
                className="px-3 py-1.5 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[11px] sm:text-xs font-bold text-[var(--text-secondary)] hover:text-lime-400 transition-colors shadow-2xs"
              >
                🌾 Agriculture
              </Link>
            </div>

          </div>

          {/* Interactive Trust Highlights Bar (Full-Width Across Columns) */}
          <div className="w-full pt-8 sm:pt-12 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {trustHighlights.map((item, idx) => (
              <div
                key={idx}
                className="trust-badge-card p-3.5 sm:p-4 rounded-2xl bg-[var(--bg-surface)]/80 backdrop-blur-md border border-[var(--border-primary)] flex items-center gap-3 text-left shadow-2xs"
              >
                <span className="text-2xl sm:text-3xl shrink-0">{item.icon}</span>
                <div className="min-w-0">
                  <div className="text-xs sm:text-sm font-black text-[var(--text-primary)] truncate">
                    {item.title}
                  </div>
                  <div className="text-[10px] sm:text-[11px] text-[var(--text-secondary)] truncate">
                    {item.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>

        </Container>
      </section>

      {/* ============================================================ */}
      {/* 2. ALL OTHER MARKETPLACE CATEGORIES (9 Photographic Cards)   */}
      {/* ============================================================ */}
      <section id="categories" className="py-12 sm:py-16 md:py-20 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
        <Container size="7xl">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 md:mb-12">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-[var(--accent)] inline-block" />
                <span className="text-[11px] sm:text-[12px] font-black uppercase tracking-widest text-[var(--accent)]">
                  Complete Directory
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[var(--text-primary)] tracking-tight">
                All Other Marketplace Categories
              </h2>
              <p className="text-[13px] sm:text-[15px] text-[var(--text-secondary)] mt-1">
                Explore high-quality verified classifieds curated across all 9 core sectors
              </p>
            </div>
            
            <Link 
              to={ROUTES.CATEGORIES}
              className="px-4 py-2.5 rounded-2xl bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-primary)] text-[13px] sm:text-[14px] font-bold text-[var(--text-primary)] hover:text-[var(--accent)] flex items-center gap-2 transition-all shrink-0 group shadow-xs"
            >
              <span>View All 9 Sectors</span>
              <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
            </Link>
          </div>

          {/* 9 Photographic Category Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {photographicCategories.map((cat) => (
              <CategoryCard
                key={cat.id}
                title={cat.title}
                subtitle={cat.subtitle}
                image={cat.image}
                icon={cat.icon}
                path={cat.path}
                count={cat.count}
              />
            ))}
          </div>
        </Container>
      </section>

      {/* ============================================================ */}
      {/* 3. RECOMMENDED FOR YOU (Live Listings Feed)                  */}
      {/* ============================================================ */}
      <section className="py-12 sm:py-16 md:py-20 border-b border-[var(--border-subtle)] bg-[var(--bg-primary)]">
        <Container size="7xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1 text-xs font-black uppercase tracking-wider text-[var(--accent)]">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block pulse-indicator text-emerald-500" />
                <span>Live Marketplace Feed</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
                Recommended For You
              </h2>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5">
                Fresh verified classifieds recently published by verified merchants
              </p>
            </div>

            {/* Quick Filter Switcher */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              {feedFilterOptions.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setActiveCategory(f.id)}
                  className={cn(
                    "px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold transition-all cursor-pointer select-none category-pill-btn",
                    activeCategory === f.id
                      ? "active"
                      : "bg-[var(--bg-surface)] hover:bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Listings Grid */}
          {loadingListings ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <Loader size="lg" />
              <span className="text-xs font-bold text-[var(--text-secondary)]">Fetching verified listings...</span>
            </div>
          ) : recommendedListings.length === 0 ? (
            <div className="p-12 sm:p-16 bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-3xl text-center space-y-4 shadow-xs">
              <div className="text-4xl">🏢</div>
              <h3 className="text-xl font-bold text-[var(--text-primary)]">
                No active listings found in this filter
              </h3>
              <p className="text-xs text-[var(--text-secondary)] max-w-md mx-auto">
                Be the first verified merchant to publish an ad in this sector and reach prospective buyers.
              </p>
              <Link
                to={ROUTES.POST_LISTING}
                className="inline-block px-5 py-2.5 bg-[var(--button-primary)] text-[var(--button-primary-text)] font-bold text-xs rounded-xl shadow-xs"
              >
                + Post First Listing
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedListings.map((item) => {
                if (activeCategory === 'properties' || item.categorySlug === 'properties') {
                  return <PropertyCard key={item._id} {...item} />;
                }
                return <ListingCard key={item._id} {...item} />;
              })}
            </div>
          )}

          {/* Luxury Post Listing CTA Bar */}
          <div className="mt-12 p-6 sm:p-8 lg:p-10 cta-luxury-banner flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-1.5 max-w-2xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 dark:text-emerald-400 text-[11px] font-black uppercase tracking-wider">
                <span>📢</span>
                <span>Verified Seller Network</span>
              </span>
              <h3 className="font-black text-xl sm:text-2xl text-[var(--text-primary)] tracking-tight">
                Are you a Seller, Landlord, or Service Provider?
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                Upload photos of your property, vehicle, or item, list your direct contact channels, and start receiving real-time buyer inquiries immediately.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link
                to={ROUTES.POST_LISTING}
                className="btn-shimmer px-6 py-3.5 rounded-2xl bg-[var(--button-primary)] hover:bg-[var(--button-primary-hover)] text-[var(--button-primary-text)] font-black text-xs sm:text-sm shadow-md transition-all active:scale-95 border border-[var(--button-primary)] cursor-pointer"
              >
                + Post Free Listing &rarr;
              </Link>
            </div>
          </div>

        </Container>
      </section>

      {/* ============================================================ */}
      {/* 4. POPULAR MARKETPLACE LOCATIONS (Worldwide Hubs)            */}
      {/* ============================================================ */}
      <section className="py-12 sm:py-16 md:py-20 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
        <Container size="7xl">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                <span className="text-[11px] sm:text-[12px] font-black uppercase tracking-widest text-blue-500">
                  Global Hubs
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
                Popular Marketplace Locations
              </h2>
              <p className="text-[13px] sm:text-[14px] text-[var(--text-secondary)] mt-1">
                Select a major city to instantly filter available classifieds
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowLocationModal(true)}
              className="px-4 py-2.5 rounded-2xl bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-primary)] text-[13px] sm:text-[14px] font-bold text-[var(--text-primary)] hover:text-[var(--accent)] flex items-center gap-2 transition-all cursor-pointer shadow-xs"
            >
              <span>Explore All Countries & Regions</span>
              <span>&rarr;</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4">
            {hubCities.map((city, idx) => {
              const isCurrent = selectedLocation?.city === city.name;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCity(city.name, city.region, city.country)}
                  className={cn(
                    "city-chip-card p-4 sm:p-5 rounded-2xl border text-left transition-all cursor-pointer shadow-2xs flex items-center justify-between group",
                    isCurrent 
                      ? "bg-[var(--bg-surface)] border-[var(--button-primary)] ring-2 ring-[var(--button-primary)]/20 shadow-md" 
                      : "bg-[var(--bg-surface)] border-[var(--border-primary)] hover:border-[var(--button-primary)] hover:bg-[var(--bg-secondary)]"
                  )}
                >
                  <div className="min-w-0">
                    <div className="font-black text-[14px] sm:text-[15px] text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors truncate">
                      {city.name}
                    </div>
                    <div className="text-[11px] sm:text-[12px] text-[var(--text-muted)] truncate mt-0.5">
                      {city.region}, {city.country}
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-[var(--text-secondary)] font-black px-2.5 py-1 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] shrink-0 ml-2">
                    {city.symbol}
                  </span>
                </button>
              );
            })}
          </div>
        </Container>
      </section>

      {/* Global Location Selector Modal */}
      {showLocationModal && (
        <LocationSelector onClose={() => setShowLocationModal(false)} />
      )}

    </div>
  );
}

export default MarketplaceHome;
