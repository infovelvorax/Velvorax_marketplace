import './ListingDetails.css';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { listingsService } from '../../services/api/listings.service';
import { chatService } from '../../services/api/chat.service';
import { offerService } from '../../services/api/offer.service';
import { favoriteService } from '../../services/api/favorite.service';
import { reportService } from '../../services/api/report.service';
import { jobService } from '../../services/api/job.service';
import { serviceMarketplaceService } from '../../services/api/service.service';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { Container } from '../../components/common/Container';
import { BackButton } from '../../components/common/BackButton';
import { ListingCard, ListingImageGallery } from '../../components/listing';
import { Loader } from '../../components/common/Loader';
import { Modal } from '../../components/common/Modal';
import { Badge } from '../../components/common/Badge';
import { RealMapLocation } from '../../components/common/RealMapLocation/RealMapLocation';
import { ROUTES } from '../../constants';
import { cn } from '../../utils';
import { formatListingPrice } from '../../utils/formatters';
import { useLocation as useMarketLocation } from '../../context/LocationContext';

export function ListingDetails() {
  const { selectedCurrency } = useMarketLocation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { showToast } = useToast();

  const [listing, setListing] = useState(null);
  const [similarListings, setSimilarListings] = useState([]);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerAmount, setOfferAmount] = useState('');
  const [offerMessage, setOfferMessage] = useState('');
  const [submittingOffer, setSubmittingOffer] = useState(false);

  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('FRAUD');
  const [reportDesc, setReportDesc] = useState('');
  const [reportSignature, setReportSignature] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);

  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyData, setApplyData] = useState({ name: '', email: '', phone: '', coverLetter: '', experienceYears: '' });
  const [submittingApply, setSubmittingApply] = useState(false);

  const [showBookModal, setShowBookModal] = useState(false);
  const [bookData, setBookData] = useState({ bookingDate: '', timeSlot: 'Morning (9 AM - 12 PM)', address: '', phone: '', notes: '' });
  const [submittingBook, setSubmittingBook] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await listingsService.getListingDetails(id);
        setListing(data);
        setOfferAmount(data.price ? data.price.toString() : '');

        // Prepopulate apply/book forms if logged in
        if (user) {
          setApplyData(prev => ({ ...prev, name: user.name || '', email: user.email || '', phone: user.phone || '' }));
          setBookData(prev => ({ ...prev, phone: user.phone || '', address: user.location?.city || '' }));
          setReportSignature(user.name || '');
        }

        // Check favorite
        if (isAuthenticated) {
          const isFav = await favoriteService.checkFavorite(id);
          setIsFavorite(isFav);
        }

        // Fetch similar
        const similar = await listingsService.getSimilarListings(id);
        setSimilarListings(similar);

        // Save to recently viewed
        try {
          const recents = JSON.parse(localStorage.getItem('velvorax_recently_viewed') || '[]');
          const filtered = [data, ...recents.filter(r => (r._id || r.id) !== id)].slice(0, 8);
          localStorage.setItem('velvorax_recently_viewed', JSON.stringify(filtered));
        } catch (e) {
          console.error(e);
        }
      } catch (err) {
        console.error(err);
        setError('Listing not found or has been removed.');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id, isAuthenticated, user]);

  const handleFavoriteToggle = async () => {
    if (!isAuthenticated) {
      showToast('info', 'Please sign in to favorite listings');
      return;
    }
    try {
      const res = await favoriteService.toggleFavorite(id);
      setIsFavorite(res.isFavorite);
      showToast('success', res.message || 'Updated wishlist');
    } catch (e) {
      showToast('error', 'Failed to update wishlist');
    }
  };

  const handleStartChat = async () => {
    if (!isAuthenticated) {
      showToast('info', 'Please sign in to message the seller');
      navigate(ROUTES.AUTH.LOGIN);
      return;
    }

    if (listing.sellerId?._id === user?._id || listing.sellerId === user?._id) {
      showToast('info', 'This is your own listing');
      return;
    }

    try {
      const conversation = await chatService.startConversation(listing.sellerId?._id || listing.sellerId, listing._id);
      navigate(ROUTES.DASHBOARD.MESSAGES, { state: { activeConversationId: conversation._id } });
    } catch (e) {
      showToast('error', 'Failed to initiate conversation');
    }
  };

  const handleSendOffer = async (e) => {
    e.preventDefault();
    if (!offerAmount || Number(offerAmount) <= 0) {
      showToast('error', 'Please enter a valid offer amount');
      return;
    }

    setSubmittingOffer(true);
    try {
      await offerService.createOffer({
        listingId: listing._id,
        sellerId: listing.sellerId?._id || listing.sellerId,
        amount: Number(offerAmount),
        message: offerMessage
      });
      showToast('success', 'Offer sent to seller successfully!');
      setShowOfferModal(false);
    } catch (err) {
      showToast('error', err.response?.data?.message || err.message || 'Failed to submit offer');
    } finally {
      setSubmittingOffer(false);
    }
  };

  const handleSendReport = async (e) => {
    e.preventDefault();
    if (!reportDesc.trim()) {
      showToast('error', 'Please enter report explanation');
      return;
    }
    if (!reportSignature.trim()) {
      showToast('error', 'Please enter your digital signature / typed full name');
      return;
    }

    setSubmittingReport(true);
    try {
      await reportService.createReport({
        targetType: 'LISTING',
        targetId: listing._id,
        reason: reportReason,
        description: reportDesc.trim(),
        signature: reportSignature.trim()
      });
      showToast('success', 'Thank you! Report submitted for safety review.');
      setShowReportModal(false);
    } catch (e) {
      showToast('error', e.response?.data?.message || e.message || 'Failed to submit report');
    } finally {
      setSubmittingReport(false);
    }
  };

  const handleApplyJob = async (e) => {
    e.preventDefault();
    if (!applyData.name?.trim() || !applyData.email?.trim() || !applyData.phone?.trim()) {
      showToast('error', 'Please provide full name, email, and contact number');
      return;
    }
    setSubmittingApply(true);
    try {
      await jobService.applyForJob(listing._id, applyData);
      showToast('success', 'Application submitted to recruiter successfully!');
      setShowApplyModal(false);
    } catch (e) {
      showToast('error', e.response?.data?.message || e.message || 'Failed to submit application');
    } finally {
      setSubmittingApply(false);
    }
  };

  const handleBookService = async (e) => {
    e.preventDefault();
    setSubmittingBook(true);
    try {
      await serviceMarketplaceService.createBooking({
        serviceId: listing._id,
        ...bookData
      });
      showToast('success', 'Service booking request placed! Provider will confirm soon.');
      setShowBookModal(false);
    } catch (e) {
      showToast('error', e.response?.data?.message || e.message || 'Failed to request booking');
    } finally {
      setSubmittingBook(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: listing.title,
        text: `Check out ${listing.title} on Velvorax Marketplace!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('success', 'Listing link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-[var(--bg-primary)]">
        <Loader size="lg" />
        <p className="mt-4 text-[var(--text-secondary)] font-medium">Loading marketplace listing...</p>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <div className="text-6xl mb-4">🔍</div>
        <h2 className="text-2xl font-bold mb-2">Listing Unavailable</h2>
        <p className="text-[var(--text-secondary)] mb-6 max-w-md">{error || 'This listing does not exist or was deleted.'}</p>
        <Link 
          to={ROUTES.HOME}
          className="px-6 py-3 bg-[var(--button-primary)] text-[var(--button-primary-text)] font-bold rounded-xl"
        >
          Return to Marketplace
        </Link>
      </div>
    );
  }

  const isJob = listing.categorySlug === 'jobs';
  const isService = listing.categorySlug === 'services';

  const images = isService
    ? ['/service-technician-standard.jpg']
    : ((listing.images && listing.images.length > 0)
      ? listing.images
      : (listing.media && listing.media.length > 0)
        ? listing.media.map(m => m.secure_url || m.url).filter(Boolean)
        : []);

  const seller = listing.sellerId || {};

  return (
    <div className="bg-[var(--bg-primary)] text-[var(--text-primary)] min-h-screen py-5 sm:py-10 transition-colors duration-200">
      <Container size="7xl">
        
        {/* Top Back Navigation & Breadcrumbs */}
        <div className="flex items-center justify-between gap-3 mb-4 sm:mb-8 flex-wrap">
          <div className="flex items-center gap-2">
            <BackButton fallbackUrl={ROUTES.HOME} label="Back" />
            <Link
              to={ROUTES.HOME}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-xs sm:text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] shadow-2xs transition-all active:scale-95"
            >
              <span>Home</span>
            </Link>
          </div>

          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-[12px] sm:text-[13px] text-[var(--text-secondary)] truncate font-semibold">
            <Link to={ROUTES.HOME} className="hover:text-[var(--text-primary)] transition-colors">Home</Link>
            <span>/</span>
            <Link to={`${ROUTES.SEARCH}?category=${listing.categorySlug}`} className="hover:text-[var(--text-primary)] transition-colors capitalize">
              {listing.categoryId?.name || listing.categorySlug}
            </Link>
            {listing.subcategoryName && (
              <>
                <span>/</span>
                <span className="text-[var(--text-primary)] truncate">{listing.subcategoryName}</span>
              </>
            )}
          </div>
        </div>

        {/* Main Grid: Left Gallery & Details, Right Seller Box */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-10 items-start">
          
          {/* Left 2 Columns */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            
            {/* Gallery Component */}
            <div className="bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-3xl overflow-hidden p-3.5 sm:p-5 shadow-xs">
              <ListingImageGallery
                images={images}
                title={listing.title}
                badgeText={listing.featured ? 'FEATURED' : ''}
                badgeVariant="primary"
                allowMosaic={true}
              />
            </div>

            {/* Structured Details & Specifications */}
            <div className="bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-3xl p-4 sm:p-7 md:p-9 space-y-6 sm:space-y-7 shadow-xs">
              
              <div className="border-b border-[var(--border-subtle)] pb-6">
                <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4 mb-3">
                  <div className="flex items-center gap-2 sm:gap-2.5">
                    <span className={cn(
                      "px-3 py-0.5 sm:px-3.5 sm:py-1 rounded-full text-[11px] sm:text-[12px] font-bold uppercase shadow-2xs",
                      listing.listingType === 'FREE' ? "bg-[var(--success-light)] text-[var(--success)] border border-[var(--success)]/30" :
                      "bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-primary)]"
                    )}>
                      {listing.listingType}
                    </span>
                    {listing.condition && listing.condition !== 'NOT_APPLICABLE' && (
                      <span className="px-3 py-0.5 sm:px-3.5 sm:py-1 rounded-full bg-[var(--bg-secondary)] text-[var(--text-secondary)] text-[11px] sm:text-[12px] font-bold border border-[var(--border-primary)]">
                        Condition: {listing.condition}
                      </span>
                    )}
                  </div>
                  
                  {/* Action buttons: Favorite, Share, Report */}
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <button 
                      onClick={handleFavoriteToggle}
                      className={cn(
                        "p-2.5 sm:p-3 rounded-xl border border-[var(--border-primary)] hover:border-[var(--button-primary)] transition-colors flex items-center gap-1.5 sm:gap-2 text-[12px] sm:text-[13px] font-bold cursor-pointer",
                        isFavorite ? "bg-[var(--bg-secondary)] text-[var(--error)] border-[var(--border-primary)]" : "bg-[var(--bg-surface)] text-[var(--text-secondary)]"
                      )}
                    >
                      <svg className={cn("w-4 h-4", isFavorite && "fill-current text-[var(--error)]")} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      <span>{isFavorite ? 'Saved' : 'Save'}</span>
                    </button>

                    <button 
                      onClick={handleShare}
                      className="p-2.5 sm:p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)] hover:border-[var(--button-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-[12px] sm:text-[13px] font-bold flex items-center gap-1.5 sm:gap-2 transition-colors cursor-pointer"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                      <span>Share</span>
                    </button>

                    <button 
                      onClick={() => setShowReportModal(true)}
                      className="p-2.5 sm:p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)] hover:border-[var(--error)] text-[var(--text-muted)] hover:text-[var(--error)] text-[12px] sm:text-[13px] transition-colors cursor-pointer font-bold"
                    >
                      🚩 Report
                    </button>
                  </div>
                </div>

                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[var(--text-primary)] mb-3 leading-tight tracking-tight">
                  {listing.title}
                </h1>
                
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[13px] sm:text-[14px] text-[var(--text-secondary)] font-medium">
                  <span>📍 {listing.location?.city || 'Location'}, {listing.location?.region} {listing.location?.country}</span>
                  <span>•</span>
                  <span>Posted {new Date(listing.createdAt).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>👁️ {listing.views || 0} views</span>
                </div>
              </div>

              {/* Category-Specific Specifications Box */}
              {listing.details && Object.keys(listing.details).length > 0 && (
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-[var(--text-primary)] uppercase tracking-wider mb-3 sm:mb-4">Specifications & Details</h3>
                  <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3.5">
                    {Object.entries(listing.details).map(([key, val]) => {
                      if (!val) return null;
                      return (
                        <div key={key} className="p-3.5 sm:p-4 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-primary)]">
                          <span className="text-[10px] sm:text-[11px] text-[var(--text-muted)] uppercase font-bold tracking-wider block mb-1">
                            {key.replace(/([A-Z])/g, ' $1')}
                          </span>
                          <span className="text-[14px] sm:text-[15px] font-bold text-[var(--text-primary)] truncate block">
                            {val.toString()}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Description Section */}
              <div>
                <h3 className="text-sm sm:text-base font-bold text-[var(--text-primary)] uppercase tracking-wider mb-2.5 sm:mb-3">Description</h3>
                <div className="text-[14px] sm:text-[16px] text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">
                  {listing.description}
                </div>
              </div>

            </div>

            {/* Real Map Location & Directions */}
            {listing.location && (
              <div className="space-y-3">
                <h3 className="text-lg font-black text-[var(--text-primary)] flex items-center gap-2">
                  <span>🗺️</span>
                  <span>Real Map Location & Directions</span>
                </h3>
                <RealMapLocation
                  location={listing.location}
                  title={listing.title}
                  height="360px"
                />
              </div>
            )}

          </div>

          {/* Right Column: Price Box, Action CTAs, and Seller Profile */}
          <div className="space-y-5 sm:space-y-6">
            
            {/* Price & Primary Action Box */}
            <div className="bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-3xl p-5 sm:p-7 md:p-9 shadow-xs space-y-5 sm:space-y-6">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-[var(--text-muted)] uppercase font-bold tracking-wider">Marketplace Price</span>
                  {listing.currency && (
                    <span className="px-2.5 py-0.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[11px] font-bold text-[var(--text-secondary)]">
                      {listing.currency} ({listing.currencySymbol || '₹'})
                    </span>
                  )}
                </div>
                <div className="text-2xl sm:text-3xl md:text-4xl font-black text-[var(--text-primary)] tracking-tight mt-1.5">
                  {formatListingPrice(listing.price, listing.currency || 'INR', listing.currencySymbol, { listingType: listing.listingType })}
                  {listing.listingType === 'RENT' && <span className="text-sm text-[var(--text-secondary)] font-normal ml-1">/ month</span>}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {isJob ? (
                  <button 
                    onClick={() => setShowApplyModal(true)}
                    className="w-full py-3.5 sm:py-4 bg-[var(--button-primary)] text-[var(--button-primary-text)] hover:bg-[var(--button-primary-hover)] font-bold text-[14px] sm:text-[15px] rounded-2xl transition-all shadow-md cursor-pointer active:scale-95 border border-[var(--button-primary)]"
                  >
                    💼 Apply For Job
                  </button>
                ) : isService ? (
                  <button 
                    onClick={() => setShowBookModal(true)}
                    className="w-full py-3.5 sm:py-4 bg-[var(--button-primary)] text-[var(--button-primary-text)] hover:bg-[var(--button-primary-hover)] font-bold text-[14px] sm:text-[15px] rounded-2xl transition-all shadow-md cursor-pointer active:scale-95 border border-[var(--button-primary)]"
                  >
                    📅 Book Service
                  </button>
                ) : (
                  <>
                    <button 
                      onClick={handleStartChat}
                      className="w-full py-3.5 sm:py-4 bg-[var(--button-primary)] text-[var(--button-primary-text)] hover:bg-[var(--button-primary-hover)] font-bold text-[14px] sm:text-[15px] rounded-2xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2.5 active:scale-95 border border-[var(--button-primary)]"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                      <span>Chat with Seller</span>
                    </button>

                    {seller.phone && (
                      <a
                        href={`tel:${seller.phone}`}
                        className="w-full py-3 sm:py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[13px] sm:text-[14px] rounded-2xl transition-all shadow-xs flex items-center justify-center gap-2 text-center"
                        title={`Click to call ${seller.phone}`}
                      >
                        <span>📞</span>
                        <span>Call Seller ({seller.phone})</span>
                      </a>
                    )}

                    {listing.listingType !== 'FREE' && (
                      <button 
                        onClick={() => {
                          if (!isAuthenticated) {
                            showToast('info', 'Please sign in to make an offer');
                            navigate(ROUTES.AUTH.LOGIN);
                          } else {
                            setShowOfferModal(true);
                          }
                        }}
                        className="w-full py-3 sm:py-3.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-primary)] font-bold text-[14px] sm:text-[15px] rounded-2xl transition-all hover:border-[var(--button-primary)] cursor-pointer shadow-xs"
                      >
                        🤝 Make an Offer
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Seller / Provider Card */}
            <div className="bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-3xl p-5 sm:p-7 space-y-4 sm:space-y-5 shadow-xs">
              <span className="text-xs text-[var(--text-muted)] uppercase font-bold tracking-wider">Posted By</span>
              
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-[var(--bg-secondary)] text-[var(--text-primary)] flex items-center justify-center overflow-hidden shrink-0 border border-[var(--border-primary)]">
                  {seller.profilePhoto ? (
                    <img src={seller.profilePhoto} alt={seller.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xl font-bold">{seller.name?.charAt(0) || 'S'}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-[var(--text-primary)] text-[17px] truncate">{seller.name || 'Velvorax Seller'}</h4>
                    {(seller.verificationStatus === 'VERIFIED' || seller.verified) && (
                      <svg className="w-4 h-4 text-[var(--accent)] shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[13px] text-[var(--text-secondary)] mt-1 font-semibold">
                    <span>⭐ {seller.rating || '5.0'}</span>
                    <span>•</span>
                    <span>Member since {seller.createdAt ? new Date(seller.createdAt).getFullYear() : '2024'}</span>
                  </div>
                </div>
              </div>

              {seller.bio && (
                <p className="text-[13px] text-[var(--text-secondary)] italic bg-[var(--bg-secondary)] p-4 rounded-2xl border border-[var(--border-primary)]">
                  "{seller.bio}"
                </p>
              )}

              <div className="pt-2 border-t border-[var(--border-subtle)] space-y-2 text-[13px] text-[var(--text-secondary)]">
                {seller.phone && (
                  <div className="flex items-center justify-between">
                    <span>Direct Phone</span>
                    <a href={`tel:${seller.phone}`} className="text-emerald-500 font-bold hover:underline">
                      📞 {seller.phone}
                    </a>
                  </div>
                )}
                {seller.email && (
                  <div className="flex items-center justify-between">
                    <span>Direct Email</span>
                    <a href={`mailto:${seller.email}`} className="text-blue-500 font-bold hover:underline truncate max-w-[180px]">
                      ✉️ {seller.email}
                    </a>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Location</span>
                  <span className="font-bold text-[var(--text-primary)]">{listing.location?.city || 'Local Area'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Verified User ID</span>
                  <span className="text-[var(--accent)] font-bold">✓ Verified</span>
                </div>
              </div>
            </div>

            {/* Safety Tips Card */}
            <div className="p-6 bg-[var(--bg-surface)] rounded-3xl border border-[var(--border-primary)] space-y-3 text-xs text-[var(--text-secondary)] shadow-xs">
              <div className="flex items-center gap-2 font-bold text-[var(--text-primary)] text-sm">
                <span>🛡️</span> <span>Safety & Transaction Guidelines</span>
              </div>
              <ul className="list-disc list-inside space-y-1.5 leading-relaxed">
                <li>Meet in a well-lit, public location for local pickups.</li>
                <li>Never share banking OTPs, PINs, or sensitive passwords.</li>
                <li>Inspect and verify item condition in person before releasing funds.</li>
              </ul>
            </div>

          </div>

        </div>

        {/* Similar Listings Carousel / Grid */}
        {similarListings.length > 0 && (
          <div className="mt-20 pt-12 border-t border-[var(--border-subtle)]">
            <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight mb-8">
              Similar Marketplace Listings
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {similarListings.map(item => (
                <ListingCard key={item._id} {...item} />
              ))}
            </div>
          </div>
        )}

      </Container>

      {/* Make Offer Modal */}
      {showOfferModal && (
        <Modal isOpen={showOfferModal} onClose={() => setShowOfferModal(false)} title="🤝 Submit an Offer to Seller">
          <form onSubmit={handleSendOffer} className="space-y-4 pt-2 text-[var(--text-primary)]">
            <p className="text-sm text-[var(--text-secondary)]">
              Asking Price: <span className="font-bold text-[var(--text-primary)]">{listing.currencySymbol}{listing.price}</span>
            </p>
            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase mb-1">Your Offer Amount ({listing.currencySymbol})</label>
              <input 
                type="number"
                required
                value={offerAmount}
                onChange={(e) => setOfferAmount(e.target.value)}
                className="w-full bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-xl px-4 py-3 text-[var(--text-primary)] font-bold text-lg focus:outline-none focus:border-[var(--button-primary)]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase mb-1">Message to Seller (Optional)</label>
              <textarea 
                rows="3"
                value={offerMessage}
                onChange={(e) => setOfferMessage(e.target.value)}
                placeholder="e.g. Can pick up today with cash payment..."
                className="w-full bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-xl px-4 py-2.5 text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--button-primary)]"
              />
            </div>
            <div className="flex justify-end gap-3 pt-3">
              <button 
                type="button" 
                onClick={() => setShowOfferModal(false)}
                className="px-5 py-2.5 rounded-xl border border-[var(--border-primary)] text-[var(--text-secondary)] text-sm font-bold"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={submittingOffer}
                className="px-6 py-2.5 rounded-xl bg-[var(--button-primary)] text-[var(--button-primary-text)] text-sm font-bold shadow-xs hover:bg-[var(--button-primary-hover)]"
              >
                {submittingOffer ? 'Sending...' : 'Send Offer'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <Modal isOpen={showReportModal} onClose={() => setShowReportModal(false)} title="🚩 Report Suspicious Listing">
          <form onSubmit={handleSendReport} className="space-y-4 pt-2 text-[var(--text-primary)]">
            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase mb-1">Reason for Report</label>
              <select 
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="w-full bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-xl px-4 py-2.5 text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--button-primary)]"
              >
                <option value="FRAUD">Suspected Fraud or Scam</option>
                <option value="INAPPROPRIATE">Inappropriate Content</option>
                <option value="SPAM">Spam or Duplicate Post</option>
                <option value="MISCATEGORIZED">Wrong Category / Misleading Details</option>
                <option value="PROHIBITED_ITEM">Prohibited Item</option>
                <option value="HARASSMENT">Harassment or Offensive Behavior</option>
                <option value="OTHER">Other Violation</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase mb-1">Explanation</label>
              <textarea 
                rows="4"
                required
                value={reportDesc}
                onChange={(e) => setReportDesc(e.target.value)}
                placeholder="Explain why this listing violates marketplace rules..."
                className="w-full bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-xl px-4 py-2.5 text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--button-primary)]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase mb-1">
                Digital Signature (Type your full name as acknowledgment) <span className="text-[var(--error)]">*</span>
              </label>
              <input 
                type="text" 
                required
                value={reportSignature}
                onChange={(e) => setReportSignature(e.target.value)}
                placeholder="e.g. Johnathan Doe"
                className="w-full bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-xl px-4 py-2.5 text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--button-primary)] font-mono"
              />
              <p className="text-[11px] text-[var(--text-muted)] mt-1">
                By submitting this report, you confirm under penalty of terms violation that the information provided is accurate.
              </p>
            </div>
            <div className="flex justify-end gap-3 pt-3">
              <button 
                type="button" 
                onClick={() => setShowReportModal(false)}
                className="px-5 py-2.5 rounded-xl border border-[var(--border-primary)] text-[var(--text-secondary)] text-sm font-bold"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={submittingReport}
                className="px-6 py-2.5 rounded-xl bg-[var(--error)] text-white text-sm font-bold shadow-xs hover:opacity-90"
              >
                {submittingReport ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Apply Job Modal */}
      {showApplyModal && (
        <Modal isOpen={showApplyModal} onClose={() => setShowApplyModal(false)} title="💼 Apply for Position">
          <form onSubmit={handleApplyJob} className="space-y-4 pt-2 text-[var(--text-primary)]">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase mb-1">Full Name</label>
                <input 
                  type="text" 
                  required
                  value={applyData.name}
                  onChange={(e) => setApplyData(p => ({ ...p, name: e.target.value }))}
                  className="w-full bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-xl px-4 py-2.5 text-[var(--text-primary)] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase mb-1">Email</label>
                <input 
                  type="email" 
                  required
                  value={applyData.email}
                  onChange={(e) => setApplyData(p => ({ ...p, email: e.target.value }))}
                  className="w-full bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-xl px-4 py-2.5 text-[var(--text-primary)] text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase mb-1">Phone Number</label>
              <input 
                type="tel" 
                required
                value={applyData.phone}
                onChange={(e) => setApplyData(p => ({ ...p, phone: e.target.value }))}
                className="w-full bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-xl px-4 py-2.5 text-[var(--text-primary)] text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase mb-1">Years of Relevant Experience</label>
              <input 
                type="text" 
                value={applyData.experienceYears}
                onChange={(e) => setApplyData(p => ({ ...p, experienceYears: e.target.value }))}
                placeholder="e.g. 4 Years"
                className="w-full bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-xl px-4 py-2.5 text-[var(--text-primary)] text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase mb-1">Brief Cover Letter / Introduction</label>
              <textarea 
                rows="4"
                value={applyData.coverLetter}
                onChange={(e) => setApplyData(p => ({ ...p, coverLetter: e.target.value }))}
                placeholder="Highlight your background and suitability for this role..."
                className="w-full bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-xl px-4 py-2.5 text-[var(--text-primary)] text-sm"
              />
            </div>
            <div className="flex justify-end gap-3 pt-3">
              <button 
                type="button" 
                onClick={() => setShowApplyModal(false)}
                className="px-5 py-2.5 rounded-xl border border-[var(--border-primary)] text-[var(--text-secondary)] text-sm font-bold"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={submittingApply}
                className="px-6 py-2.5 rounded-xl bg-[var(--button-primary)] text-[var(--button-primary-text)] hover:bg-[var(--button-primary-hover)] text-sm font-bold shadow-xs"
              >
                {submittingApply ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Service Booking Modal */}
      {showBookModal && (
        <Modal isOpen={showBookModal} onClose={() => setShowBookModal(false)} title="📅 Book Service Appointment">
          <form onSubmit={handleBookService} className="space-y-4 pt-2 text-[var(--text-primary)]">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase mb-1">Preferred Date</label>
                <input 
                  type="date" 
                  required
                  value={bookData.bookingDate}
                  onChange={(e) => setBookData(p => ({ ...p, bookingDate: e.target.value }))}
                  className="w-full bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-xl px-4 py-2.5 text-[var(--text-primary)] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase mb-1">Time Slot</label>
                <select
                  value={bookData.timeSlot}
                  onChange={(e) => setBookData(p => ({ ...p, timeSlot: e.target.value }))}
                  className="w-full bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-xl px-4 py-2.5 text-[var(--text-primary)] text-sm"
                >
                  <option value="Morning (9 AM - 12 PM)">Morning (9 AM - 12 PM)</option>
                  <option value="Afternoon (12 PM - 4 PM)">Afternoon (12 PM - 4 PM)</option>
                  <option value="Evening (4 PM - 8 PM)">Evening (4 PM - 8 PM)</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase mb-1">Service Address / Location</label>
              <input 
                type="text" 
                required
                value={bookData.address}
                onChange={(e) => setBookData(p => ({ ...p, address: e.target.value }))}
                placeholder="House No, Street, Landmark, Area"
                className="w-full bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-xl px-4 py-2.5 text-[var(--text-primary)] text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase mb-1">Contact Phone</label>
              <input 
                type="tel" 
                required
                value={bookData.phone}
                onChange={(e) => setBookData(p => ({ ...p, phone: e.target.value }))}
                className="w-full bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-xl px-4 py-2.5 text-[var(--text-primary)] text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase mb-1">Special Instructions / Work Notes</label>
              <textarea 
                rows="3"
                value={bookData.notes}
                onChange={(e) => setBookData(p => ({ ...p, notes: e.target.value }))}
                placeholder="Describe specific problems or requirements..."
                className="w-full bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-xl px-4 py-2.5 text-[var(--text-primary)] text-sm"
              />
            </div>
            <div className="flex justify-end gap-3 pt-3">
              <button 
                type="button" 
                onClick={() => setShowBookModal(false)}
                className="px-5 py-2.5 rounded-xl border border-[var(--border-primary)] text-[var(--text-secondary)] text-sm font-bold"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={submittingBook}
                className="px-6 py-2.5 rounded-xl bg-[var(--button-primary)] text-[var(--button-primary-text)] hover:bg-[var(--button-primary-hover)] text-sm font-bold shadow-xs"
              >
                {submittingBook ? 'Booking...' : 'Confirm Booking'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Mobile & Tablet Sticky Bottom Action Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--bg-surface)]/95 backdrop-blur-md border-t border-[var(--border-primary)] p-3 px-4 sm:px-6 shadow-2xl flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">{listing.listingType === 'FREE' ? 'Giveaway' : listing.listingType === 'RENT' ? 'Rent' : 'Price'}</div>
          <div className="text-base sm:text-lg font-black text-[var(--text-primary)] tracking-tight truncate">
            {formatListingPrice(listing.price, listing.currency || selectedCurrency || 'INR', null, { listingType: listing.listingType })}
            {listing.listingType === 'RENT' && <span className="text-xs text-[var(--text-secondary)] font-normal ml-0.5">/mo</span>}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {seller.phone && (
            <a
              href={`tel:${seller.phone}`}
              className="h-10 px-3 sm:px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
              title="Call Seller"
            >
              <span>📞</span>
              <span>Call</span>
            </a>
          )}
          {isJob ? (
            <button
              type="button"
              onClick={() => setShowApplyModal(true)}
              className="h-10 px-3.5 sm:px-4 rounded-xl bg-[var(--button-primary)] hover:bg-[var(--button-primary-hover)] text-[var(--button-primary-text)] font-bold text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95 border border-[var(--button-primary)]"
            >
              <span>💼</span>
              <span>Apply</span>
            </button>
          ) : isService ? (
            <button
              type="button"
              onClick={() => setShowBookModal(true)}
              className="h-10 px-3.5 sm:px-4 rounded-xl bg-[var(--button-primary)] hover:bg-[var(--button-primary-hover)] text-[var(--button-primary-text)] font-bold text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95 border border-[var(--button-primary)]"
            >
              <span>📅</span>
              <span>Book</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleStartChat}
              className="h-10 px-3.5 sm:px-4 rounded-xl bg-[var(--button-primary)] hover:bg-[var(--button-primary-hover)] text-[var(--button-primary-text)] font-bold text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95 border border-[var(--button-primary)]"
            >
              <span>💬</span>
              <span>Chat</span>
            </button>
          )}
        </div>
      </div>

    </div>
  );
}

export default ListingDetails;
