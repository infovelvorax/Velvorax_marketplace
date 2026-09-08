import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container } from '../../components/common/Container';
import { Loader } from '../../components/common/Loader';
import { RealMapLocation } from '../../components/common/RealMapLocation/RealMapLocation';
import { PropertyCard } from './components/PropertyCard';
import { ListingImageGallery } from '../../components/listing';
import { listingsService } from '../../services/api/listings.service';
import { chatService } from '../../services/api/chat.service';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { useLocationContext } from '../../context/LocationContext';
import { ROUTES } from '../../constants';
import { formatListingPrice, formatCurrency, cn } from '../../utils';

export const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { showToast } = useToast();
  const { selectedLocation } = useLocationContext();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [inquiryText, setInquiryText] = useState('');
  const [sendingInquiry, setSendingInquiry] = useState(false);
  const [similarProperties, setSimilarProperties] = useState([]);

  // EMI Calculator State (for Sale properties)
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [loanTenureYears, setLoanTenureYears] = useState(20);
  const [interestRate, setInterestRate] = useState(8.5);

  // Rental Affordability Calculator State (for Rent properties)
  const [monthlyIncome, setMonthlyIncome] = useState(120000);

  useEffect(() => {
    const fetchPropertyData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await listingsService.getListingById(id);
        const data = res?.data || res;
        setListing(data);
        setIsSaved(data?.isFavorited || false);

        // Fetch similar properties in the same category
        try {
          const simRes = await listingsService.getListings({
            category: 'properties',
            limit: 4
          });
          const fetchedSim = (simRes?.data?.listings || simRes?.listings || []).filter(
            (p) => (p._id || p.id) !== id
          );
          setSimilarProperties(fetchedSim.slice(0, 3));
        } catch (simErr) {
          console.error('Failed to load similar properties', simErr);
        }
      } catch (err) {
        console.error('Failed to load property details', err);
        setError(err.message || 'Property not found or moderation review is pending.');
      } finally {
        setLoading(false);
      }
    };

    fetchPropertyData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      showToast('info', 'Please sign in to save this property to your wishlist.');
      navigate(ROUTES.AUTH.LOGIN);
      return;
    }
    try {
      if (isSaved) {
        await listingsService.removeFromFavorites(id);
        setIsSaved(false);
        showToast('info', 'Property removed from saved wishlist.');
      } else {
        await listingsService.addToFavorites(id);
        setIsSaved(true);
        showToast('success', 'Property saved to your wishlist!');
      }
    } catch (err) {
      showToast('error', err.message || 'Failed to update wishlist.');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: listing?.title,
        text: `Check out this property on Velvorax: ${listing?.title}`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('success', 'Property link copied to clipboard!');
    }
  };

  const handleSendInquiry = async (e) => {
    e?.preventDefault();
    if (!isAuthenticated) {
      showToast('info', 'Please sign in to send an inquiry to the seller.');
      navigate(ROUTES.AUTH.LOGIN);
      return;
    }

    const sellerId = listing?.sellerId?._id || listing?.sellerId;
    if (sellerId === user?._id) {
      showToast('info', 'This is your own property listing.');
      return;
    }

    const defaultMsg = `Hello, I am interested in your property "${listing?.title}". Please let me know when we can arrange a site visit.`;
    const messageToSend = inquiryText.trim() || defaultMsg;

    setSendingInquiry(true);
    try {
      const conversation = await chatService.startConversation(sellerId, listing?._id);
      const convoId = conversation?._id || conversation?.data?._id;
      await chatService.sendMessage(convoId, { content: messageToSend });
      showToast('success', 'Inquiry sent! The seller has received a notification and message on their dashboard.');
      setShowContactModal(false);
      setInquiryText('');
      navigate(`/dashboard/messages?conversation=${convoId}`);
    } catch (err) {
      showToast('error', err.message || 'Failed to send inquiry to seller.');
    } finally {
      setSendingInquiry(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-[var(--bg-primary)] min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader size="lg" />
        <span className="text-sm font-bold text-[var(--text-secondary)]">Loading luxury property details...</span>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="bg-[var(--bg-primary)] min-h-[70vh] py-16 flex items-center justify-center">
        <Container size="md">
          <div className="bg-[var(--bg-surface)] p-8 sm:p-12 rounded-3xl border border-[var(--border-primary)] text-center space-y-4 shadow-md">
            <div className="text-5xl">🏢</div>
            <h2 className="text-2xl font-black text-[var(--text-primary)]">Property Not Available</h2>
            <p className="text-[14px] text-[var(--text-secondary)]">
              {error || 'This property listing may have been removed or is pending approval.'}
            </p>
            <Link
              to={ROUTES.PROPERTIES}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[var(--button-primary)] text-[var(--button-primary-text)] font-bold text-xs shadow-xs cursor-pointer"
            >
              &larr; Return to Properties Marketplace
            </Link>
          </div>
        </Container>
      </div>
    );
  }

  const propSpecs = listing.propertyDetails || listing.details || {};
  const images = listing.images && listing.images.length > 0 
    ? listing.images 
    : ['https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1200'];

  const price = listing.price || 0;
  const isRent = listing.listingType?.toUpperCase() === 'RENT' || propSpecs.purpose === 'RENT';

  const displayCurrency = listing.currency || 'INR';

  const formattedPrice = formatListingPrice(price, displayCurrency, listing.currencySymbol, {
    listingType: isRent ? 'RENT' : 'SELL',
    compact: false
  });

  // EMI Calculator Calculation
  const loanPrincipal = price * (1 - downPaymentPercent / 100);
  const monthlyRate = (interestRate / 100) / 12;
  const totalMonths = loanTenureYears * 12;
  const emi = monthlyRate > 0 && totalMonths > 0
    ? Math.round((loanPrincipal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1))
    : 0;

  // Rent to income ratio
  const rentRatio = monthlyIncome > 0 ? Math.round((price / monthlyIncome) * 100) : 0;

  const seller = typeof listing.sellerId === 'object' ? listing.sellerId : {};
  const sellerPhone = seller?.phone || '';
  const sellerEmail = seller?.email || '';

  const defaultAmenities = [
    'Car Parking',
    'High Speed Lift',
    '24/7 Security & CCTV',
    '100% Power Backup',
    'Swimming Pool',
    'Modern Gymnasium',
    'Landscaped Garden',
    'Club House',
    '24/7 Water Supply',
    'Children Play Area',
    'Intercom Facility',
    'Piped Gas Pipeline'
  ];

  const amenitiesList = Array.isArray(propSpecs.amenities) && propSpecs.amenities.length > 0
    ? propSpecs.amenities
    : defaultAmenities;

  const fullLocationText = [
    listing.location?.address,
    listing.location?.landmark,
    listing.location?.localArea,
    listing.location?.city,
    listing.location?.region,
    listing.location?.country
  ].filter(Boolean).join(', ') || 'Prime Real Estate Locality';

  const area = propSpecs.area || propSpecs.builtUpArea || propSpecs.superBuiltupArea || propSpecs.carpetArea;
  const areaUnit = propSpecs.areaUnit || 'sq.ft';
  const pricePerSqFt = area && Number(area) > 0 && price && Number(price) > 0
    ? Math.round(Number(price) / Number(area))
    : null;

  const quickQuestions = [
    "Is the price negotiable?",
    "Can I schedule a property site visit this weekend?",
    "Are all legal approvals and RERA documents verified?",
    "Is dedicated parking included in the price?"
  ];

  return (
    <div className="bg-[var(--bg-primary)] text-[var(--text-primary)] min-h-screen py-8 transition-colors duration-200">
      <Container size="7xl">
        
        {/* ============================================================ */}
        {/* TOP BACK TO HOME & BREADCRUMBS                               */}
        {/* ============================================================ */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3 flex-wrap">
            <Link
              to={ROUTES.HOME}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-xs sm:text-sm font-bold text-[var(--text-primary)] hover:text-[var(--accent)] shadow-2xs transition-all active:scale-95 cursor-pointer group"
            >
              <span className="text-base group-hover:-translate-x-0.5 transition-transform">&larr;</span>
              <span>Back to Home</span>
            </Link>

            <nav className="flex items-center gap-2 text-xs font-semibold text-[var(--text-secondary)] overflow-x-auto whitespace-nowrap">
              <Link to={ROUTES.HOME} className="hover:text-[var(--text-primary)] transition-colors">Home</Link>
              <span>/</span>
              <Link to={ROUTES.PROPERTIES} className="hover:text-[var(--text-primary)] transition-colors">Properties</Link>
              {listing.location?.city && (
                <>
                  <span>/</span>
                  <Link to={`/properties?city=${listing.location.city}`} className="hover:text-[var(--text-primary)] transition-colors">
                    {listing.location.city}
                  </Link>
                </>
              )}
              <span>/</span>
              <span className="text-[var(--text-primary)] font-bold truncate max-w-[200px] sm:max-w-xs">{listing.title}</span>
            </nav>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
            <button
              type="button"
              onClick={handleToggleFavorite}
              className={cn(
                "px-3.5 py-2 rounded-xl border transition-all cursor-pointer shadow-2xs flex items-center gap-2 text-xs font-bold",
                isSaved 
                  ? "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400" 
                  : "bg-[var(--bg-surface)] border-[var(--border-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              )}
            >
              <span>{isSaved ? '❤️' : '🤍'}</span>
              <span>{isSaved ? 'Saved' : 'Save'}</span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="px-3.5 py-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer shadow-2xs flex items-center gap-2 text-xs font-bold"
            >
              <span>🔗</span>
              <span>Share</span>
            </button>
          </div>
        </div>

        {/* ============================================================ */}
        {/* PROPERTY TITLE & ADDRESS HEADER                             */}
        {/* ============================================================ */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className={cn(
                "px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-2xs",
                isRent ? "bg-blue-600 text-white" : "bg-emerald-600 text-white"
              )}>
                {isRent ? 'For Rent' : 'For Sale'}
              </span>

              {propSpecs.propertyType && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-primary)]">
                  {propSpecs.propertyType}
                </span>
              )}

              {propSpecs.possessionStatus && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  ✓ {propSpecs.possessionStatus}
                </span>
              )}

              {seller?.verificationStatus === 'VERIFIED' && (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  🛡️ Verified Merchant Listing
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[var(--text-primary)] tracking-tight">
              {listing.title}
            </h1>

            <p className="text-sm sm:text-base text-[var(--text-secondary)] flex items-center gap-2">
              <span>📍</span>
              <span>{fullLocationText}</span>
            </p>
          </div>

          {/* Clean Top Price Box */}
          <div className="flex flex-col md:items-end shrink-0 bg-[var(--bg-surface)] p-4 sm:p-5 rounded-2xl border border-[var(--border-primary)] shadow-xs">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
              {isRent ? 'Monthly Rent' : 'Selling Price'}
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
              {formattedPrice}
              {isRent && <span className="text-sm font-normal text-[var(--text-secondary)]"> / mo</span>}
            </div>
            {pricePerSqFt && (
              <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                ≈ {formatListingPrice(pricePerSqFt, selectedCurrency)}/{areaUnit}
              </div>
            )}
          </div>
        </div>

        {/* ============================================================ */}
        {/* LUXURY LISTING IMAGE GALLERY                                 */}
        {/* ============================================================ */}
        <div className="mb-10">
          <ListingImageGallery
            images={images}
            title={listing.title}
            badgeText={isRent ? 'FOR RENT' : 'FOR SALE'}
            badgeVariant={isRent ? 'primary' : 'success'}
            allowMosaic={true}
          />
        </div>

        {/* ============================================================ */}
        {/* TWO-COLUMN LAYOUT: Details (Left) + Contact Card (Right)     */}
        {/* ============================================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* LEFT 2 COLUMNS: Property Information, Specs, Map & Calculators */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Quick Property Metrics Tile Bar */}
            <div className="bg-[var(--bg-surface)] p-6 sm:p-8 rounded-3xl border border-[var(--border-primary)] shadow-xs">
              <h2 className="text-lg font-black text-[var(--text-primary)] mb-6 flex items-center gap-2">
                <span>🏡</span>
                <span>Property Key Highlights</span>
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <div className="p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                  <div className="text-xs text-[var(--text-secondary)] font-bold flex items-center gap-1">
                    <span>🛏️</span>
                    <span>Bedrooms</span>
                  </div>
                  <div className="text-base sm:text-lg font-black text-[var(--text-primary)] mt-1 truncate">
                    {propSpecs.bhk || propSpecs.bedrooms || '3 BHK'}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                  <div className="text-xs text-[var(--text-secondary)] font-bold flex items-center gap-1">
                    <span>🛁</span>
                    <span>Bathrooms</span>
                  </div>
                  <div className="text-base sm:text-lg font-black text-[var(--text-primary)] mt-1 truncate">
                    {propSpecs.bathrooms || '2 Baths'}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                  <div className="text-xs text-[var(--text-secondary)] font-bold flex items-center gap-1">
                    <span>📐</span>
                    <span>Super Area</span>
                  </div>
                  <div className="text-base sm:text-lg font-black text-[var(--text-primary)] mt-1 truncate">
                    {area ? `${area} ${areaUnit}` : '2,450 sq.ft'}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                  <div className="text-xs text-[var(--text-secondary)] font-bold flex items-center gap-1">
                    <span>🛋️</span>
                    <span>Furnishing</span>
                  </div>
                  <div className="text-base sm:text-lg font-black text-[var(--text-primary)] mt-1 truncate">
                    {propSpecs.furnishing || propSpecs.furnishingStatus || 'Semi Furnished'}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                  <div className="text-xs text-[var(--text-secondary)] font-bold flex items-center gap-1">
                    <span>🧭</span>
                    <span>Facing</span>
                  </div>
                  <div className="text-base sm:text-lg font-black text-[var(--text-primary)] mt-1 truncate">
                    {propSpecs.facing || 'East Facing / Vastu'}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                  <div className="text-xs text-[var(--text-secondary)] font-bold flex items-center gap-1">
                    <span>🚗</span>
                    <span>Parking</span>
                  </div>
                  <div className="text-base sm:text-lg font-black text-[var(--text-primary)] mt-1 truncate">
                    {propSpecs.parking || '2 Covered'}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                  <div className="text-xs text-[var(--text-secondary)] font-bold flex items-center gap-1">
                    <span>🏢</span>
                    <span>Floor Level</span>
                  </div>
                  <div className="text-base sm:text-lg font-black text-[var(--text-primary)] mt-1 truncate">
                    {propSpecs.floor ? `${propSpecs.floor} of ${propSpecs.totalFloors || 14}` : '4th of 12 Floors'}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                  <div className="text-xs text-[var(--text-secondary)] font-bold flex items-center gap-1">
                    <span>🏗️</span>
                    <span>Status</span>
                  </div>
                  <div className="text-base sm:text-lg font-black text-[var(--text-primary)] mt-1 truncate">
                    {propSpecs.possessionStatus || 'Ready to Move'}
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-[var(--bg-surface)] p-6 sm:p-8 rounded-3xl border border-[var(--border-primary)] shadow-xs space-y-4">
              <h2 className="text-lg font-black text-[var(--text-primary)] flex items-center gap-2">
                <span>📄</span>
                <span>About This Property</span>
              </h2>
              <div className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">
                {listing.description || 'Exclusive luxury residential property situated in a prime neighborhood with top-tier construction, 24/7 security, lush green surroundings, and seamless connectivity.'}
              </div>
            </div>

            {/* Amenities Grid */}
            <div className="bg-[var(--bg-surface)] p-6 sm:p-8 rounded-3xl border border-[var(--border-primary)] shadow-xs">
              <h2 className="text-lg font-black text-[var(--text-primary)] mb-6 flex items-center gap-2">
                <span>✨</span>
                <span>Amenities & Lifestyle Facilities</span>
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {amenitiesList.map((amenity, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 p-3 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-xs font-bold text-[var(--text-primary)]"
                  >
                    <span className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs shrink-0 font-black">
                      ✓
                    </span>
                    <span className="truncate">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Interactive Real Map Location & Directions */}
            <div className="bg-[var(--bg-surface)] p-6 sm:p-8 rounded-3xl border border-[var(--border-primary)] shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-lg font-black text-[var(--text-primary)] flex items-center gap-2">
                    <span>📍</span>
                    <span>Real Map Location & Neighborhood</span>
                  </h2>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                    {fullLocationText}
                  </p>
                </div>
              </div>

              {/* Interactive Real Map Location Component */}
              <div className="rounded-2xl overflow-hidden border border-[var(--border-subtle)]">
                <RealMapLocation
                  location={listing.location}
                  title={listing.title}
                  height="420px"
                />
              </div>
            </div>

            {/* Financial Calculator: EMI Calculator (for Sale) or Affordability (for Rent) */}
            {!isRent ? (
              <div className="bg-[var(--bg-surface)] p-6 sm:p-8 rounded-3xl border border-[var(--border-primary)] shadow-xs space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-black text-[var(--text-primary)] flex items-center gap-2">
                      <span>🧮</span>
                      <span>Home Loan EMI Calculator</span>
                    </h2>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                      Estimate your monthly home loan installments for this property
                    </p>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    Instant Calculation
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Sliders */}
                  <div className="md:col-span-2 space-y-5">
                    {/* Down Payment Slider */}
                    <div>
                      <div className="flex justify-between text-xs font-bold text-[var(--text-primary)] mb-1.5">
                        <span>Down Payment ({downPaymentPercent}%)</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-black">
                          {formatListingPrice((price * downPaymentPercent) / 100, displayCurrency, listing?.currencySymbol)}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="50"
                        step="5"
                        value={downPaymentPercent}
                        onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                        className="w-full accent-emerald-500 cursor-pointer"
                      />
                    </div>

                    {/* Loan Tenure Slider */}
                    <div>
                      <div className="flex justify-between text-xs font-bold text-[var(--text-primary)] mb-1.5">
                        <span>Loan Tenure</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-black">{loanTenureYears} Years</span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="30"
                        step="1"
                        value={loanTenureYears}
                        onChange={(e) => setLoanTenureYears(Number(e.target.value))}
                        className="w-full accent-emerald-500 cursor-pointer"
                      />
                    </div>

                    {/* Interest Rate Slider */}
                    <div>
                      <div className="flex justify-between text-xs font-bold text-[var(--text-primary)] mb-1.5">
                        <span>Interest Rate</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-black">{interestRate}% p.a.</span>
                      </div>
                      <input
                        type="range"
                        min="6.5"
                        max="14.0"
                        step="0.25"
                        value={interestRate}
                        onChange={(e) => setInterestRate(Number(e.target.value))}
                        className="w-full accent-emerald-500 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Calculated Output Box */}
                  <div className="p-5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex flex-col justify-between text-center">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                        Estimated Monthly EMI
                      </div>
                      <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                        {formatListingPrice(emi, displayCurrency, listing?.currencySymbol)}
                      </div>
                      <div className="text-[11px] text-[var(--text-muted)] mt-0.5">per month</div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] text-[11px] text-[var(--text-secondary)] space-y-1 text-left">
                      <div className="flex justify-between">
                        <span>Loan Amount:</span>
                        <span className="font-bold text-[var(--text-primary)]">{formatListingPrice(loanPrincipal, displayCurrency, listing?.currencySymbol)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Months:</span>
                        <span className="font-bold text-[var(--text-primary)]">{totalMonths} Months</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-[var(--bg-surface)] p-6 sm:p-8 rounded-3xl border border-[var(--border-primary)] shadow-xs space-y-4">
                <h2 className="text-lg font-black text-[var(--text-primary)] flex items-center gap-2">
                  <span>💰</span>
                  <span>Rental Affordability Check</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                      Your Monthly Income (₹)
                    </label>
                    <input
                      type="number"
                      value={monthlyIncome}
                      onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-sm font-bold text-[var(--text-primary)]"
                    />
                  </div>
                  <div className="p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
                    <div className="text-xs text-[var(--text-secondary)]">Rent to Income Ratio</div>
                    <div className={cn(
                      "text-xl font-black mt-0.5",
                      rentRatio <= 35 ? "text-emerald-600" : "text-amber-500"
                    )}>
                      {rentRatio}% of Income
                    </div>
                    <div className="text-[11px] text-[var(--text-muted)]">
                      {rentRatio <= 35 ? '✓ Highly Affordable (Below 35% standard)' : '⚠️ Consider co-living or higher budget allowance'}
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* ============================================================ */}
          {/* RIGHT SIDEBAR: Sticky Verified Seller & Inquiry Card         */}
          {/* ============================================================ */}
          <div className="lg:col-span-1 sticky top-24 space-y-6">
            
            {/* Main Seller Action Card */}
            <div className="bg-[var(--bg-surface)] p-6 rounded-3xl border border-[var(--border-primary)] shadow-md space-y-5 text-[var(--text-primary)]">
              
              {/* Pricing Header */}
              <div className="pb-4 border-b border-[var(--border-subtle)]">
                <div className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  {isRent ? 'Monthly Rent' : 'Listed Price'}
                </div>
                <div className="text-3xl font-black text-[var(--text-primary)] tracking-tight mt-0.5">
                  {formattedPrice}
                  {isRent && <span className="text-sm font-bold text-[var(--text-secondary)]">/ month</span>}
                </div>
                {pricePerSqFt && (
                  <div className="text-xs font-semibold text-[var(--text-secondary)] mt-1">
                    {formatListingPrice(pricePerSqFt, selectedCurrency)} per sq.ft • All Inclusive
                  </div>
                )}
              </div>

              {/* Seller Profile Summary */}
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-base font-black text-emerald-600 dark:text-emerald-400 uppercase shrink-0">
                  {seller?.name?.charAt(0) || 'S'}
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-sm text-[var(--text-primary)] truncate flex items-center gap-1.5">
                    <span>{seller?.name || 'Verified Property Partner'}</span>
                    {seller?.verificationStatus === 'VERIFIED' && (
                      <span className="text-blue-500 font-bold" title="Verified Seller">✓</span>
                    )}
                  </div>
                  <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                    ● Active Seller • Fast Response
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-2">
                {/* 1. Direct Phone Dial Button */}
                {sellerPhone ? (
                  <a
                    href={`tel:${sellerPhone}`}
                    className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                    title="Open device native phone dialer"
                  >
                    <span className="text-lg">📞</span>
                    <span>Call Seller ({sellerPhone})</span>
                  </a>
                ) : (
                  <div className="py-2.5 px-3 rounded-xl bg-[var(--bg-secondary)] text-center text-xs text-[var(--text-muted)] font-medium">
                    Direct calling available via Inquire Chat
                  </div>
                )}

                {/* 2. Direct Send Inquiry / Chat Button */}
                <button
                  type="button"
                  onClick={() => setShowContactModal(true)}
                  className="w-full py-3.5 px-4 rounded-2xl bg-[var(--button-primary)] hover:bg-[var(--button-primary-hover)] text-[var(--button-primary-text)] font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 border border-[var(--button-primary)]"
                >
                  <span className="text-lg">💬</span>
                  <span>Contact Seller via Message</span>
                </button>

                {/* 3. Direct Email Button */}
                {sellerEmail && (
                  <a
                    href={`mailto:${sellerEmail}?subject=Inquiry regarding ${encodeURIComponent(listing.title)}`}
                    className="w-full py-2.5 px-4 rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-primary)] text-xs font-bold transition-colors flex items-center justify-center gap-2"
                  >
                    <span>✉️</span>
                    <span>Send Official Email</span>
                  </a>
                )}
              </div>

              {/* Safety & Verification Guarantee */}
              <div className="p-3.5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[11px] text-[var(--text-secondary)] space-y-1">
                <div className="font-bold text-[var(--text-primary)] flex items-center gap-1">
                  <span>🛡️</span>
                  <span>Velvorax Buyer Assurance</span>
                </div>
                <p className="leading-normal">
                  Zero commission on direct contact. Inspect property in person before transferring advance payments.
                </p>
              </div>

            </div>

          </div>

        </div>

        {/* ============================================================ */}
        {/* SIMILAR PROPERTIES IN LOCALITY SECTION                       */}
        {/* ============================================================ */}
        {similarProperties.length > 0 && (
          <div className="mt-16 pt-10 border-t border-[var(--border-subtle)] space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">
                  Similar Verified Properties
                </h2>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5">
                  Explore other handpicked listings in the same locality & budget
                </p>
              </div>
              <Link
                to={ROUTES.PROPERTIES}
                className="text-xs font-bold text-[var(--accent)] hover:underline flex items-center gap-1"
              >
                <span>View All</span>
                <span>&rarr;</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {similarProperties.map((simItem) => (
                <PropertyCard key={simItem._id || simItem.id} {...simItem} />
              ))}
            </div>
          </div>
        )}

      </Container>

      {/* ============================================================ */}
      {/* INQUIRY MODAL (Direct MongoDB Message Submission)             */}
      {/* ============================================================ */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in" role="dialog" aria-modal="true">
          <div className="bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5 text-[var(--text-primary)]">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
              <div>
                <h3 className="text-lg font-black text-[var(--text-primary)]">
                  Inquire to Seller
                </h3>
                <p className="text-xs text-[var(--text-secondary)] truncate max-w-sm">
                  Re: {listing.title}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowContactModal(false)}
                className="w-8 h-8 rounded-full bg-[var(--bg-secondary)] hover:bg-[var(--bg-surface)] text-[var(--text-secondary)] flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Quick Suggestion Chips */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                Quick Questions:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {quickQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setInquiryText(q)}
                    className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-[var(--bg-secondary)] hover:bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer text-left"
                  >
                    + {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Inquiry Form */}
            <form onSubmit={handleSendInquiry} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">
                  Your Message / Proposal
                </label>
                <textarea
                  rows="4"
                  value={inquiryText}
                  onChange={(e) => setInquiryText(e.target.value)}
                  placeholder={`Hello, I am interested in "${listing.title}". Please share visit timings...`}
                  className="w-full px-4 py-3 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--button-primary)] resize-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowContactModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-[var(--border-primary)] text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingInquiry}
                  className="px-6 py-2.5 rounded-xl bg-[var(--button-primary)] text-[var(--button-primary-text)] font-bold text-xs shadow-md hover:bg-[var(--button-primary-hover)] transition-all cursor-pointer disabled:opacity-50"
                >
                  {sendingInquiry ? 'Sending Inquiry...' : 'Send Message & Alert Seller'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mobile & Tablet Sticky Bottom Action Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--bg-surface)]/95 backdrop-blur-md border-t border-[var(--border-primary)] p-3 px-4 sm:px-6 shadow-2xl flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">{isRent ? 'Rent' : 'Price'}</div>
          <div className="text-base sm:text-lg font-black text-[var(--text-primary)] tracking-tight truncate">
            {formattedPrice}
            {isRent && <span className="text-xs text-[var(--text-secondary)] font-normal ml-0.5">/mo</span>}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {sellerPhone && (
            <a
              href={`tel:${sellerPhone}`}
              className="h-10 px-3 sm:px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
              title="Call Seller"
            >
              <span>📞</span>
              <span>Call</span>
            </a>
          )}
          <button
            type="button"
            onClick={() => setShowContactModal(true)}
            className="h-10 px-3.5 sm:px-4 rounded-xl bg-[var(--button-primary)] hover:bg-[var(--button-primary-hover)] text-[var(--button-primary-text)] font-bold text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95 border border-[var(--button-primary)]"
          >
            <span>💬</span>
            <span>Inquire</span>
          </button>
        </div>
      </div>

    </div>
  );
};

export default PropertyDetails;
