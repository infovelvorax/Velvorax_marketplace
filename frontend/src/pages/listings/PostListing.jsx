import './PostListing.css';
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { listingsService } from '../../services/api/listings.service';
import { categoryService } from '../../services/api/category.service';
import { locationService } from '../../services/api/location.service';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { useLocationContext } from '../../context/LocationContext';
import { Container } from '../../components/common/Container';
import { BackButton } from '../../components/common/BackButton';
import { RealMapLocation } from '../../components/common/RealMapLocation/RealMapLocation';
import { ListingImageUploader } from '../../components/listing/ListingImageUploader/ListingImageUploader';
import { CurrencySelector } from '../../components/common/CurrencySelector/CurrencySelector';
import { getDefaultCurrencyForCountry, getCurrencyByCode } from '../../config/currencies';
import { formatListingPrice } from '../../utils/formatters';
import { ROUTES } from '../../constants';
import { normalizeCategoryId } from '../../constants/categories';
import { cn } from '../../utils';

const CITY_COORDS = {
  'Bengaluru': { lat: 12.9716, lng: 77.5946, region: 'Karnataka', country: 'India' },
  'Bangalore': { lat: 12.9716, lng: 77.5946, region: 'Karnataka', country: 'India' },
  'Mumbai': { lat: 19.0760, lng: 72.8777, region: 'Maharashtra', country: 'India' },
  'Delhi': { lat: 28.6139, lng: 77.2090, region: 'Delhi NCR', country: 'India' },
  'New Delhi': { lat: 28.6139, lng: 77.2090, region: 'Delhi NCR', country: 'India' },
  'Hyderabad': { lat: 17.3850, lng: 78.4867, region: 'Telangana', country: 'India' },
  'Chennai': { lat: 13.0827, lng: 80.2707, region: 'Tamil Nadu', country: 'India' },
  'Pune': { lat: 18.5204, lng: 73.8567, region: 'Maharashtra', country: 'India' },
  'Kolkata': { lat: 22.5726, lng: 88.3639, region: 'West Bengal', country: 'India' },
  'Ahmedabad': { lat: 23.0225, lng: 72.5714, region: 'Gujarat', country: 'India' },
  'Dubai': { lat: 25.2048, lng: 55.2708, region: 'Dubai', country: 'United Arab Emirates' },
  'London': { lat: 51.5074, lng: -0.1278, region: 'Greater London', country: 'United Kingdom' },
  'New York': { lat: 40.7128, lng: -74.0060, region: 'New York', country: 'United States' }
};

export const SECTORS = [
  { slug: 'properties', name: 'Properties & Real Estate', icon: '🏢', path: '/properties', placeholderTitle: 'e.g. Luxurious 3 BHK Apartment in Indiranagar' },
  { slug: 'vehicles', name: 'Cars & Bikes', icon: '🚗', path: '/vehicles', placeholderTitle: 'e.g. 2023 Hyundai Creta SX(O) 1.5 Diesel Automatic, 18,000 KM' },
  { slug: 'products', name: 'Mobiles & Electronics', icon: '📱', path: '/products', placeholderTitle: 'e.g. Apple iPhone 15 Pro Max 256GB Natural Titanium (Under Warranty)' },
  { slug: 'jobs', name: 'Jobs & Careers', icon: '💼', path: '/jobs', placeholderTitle: 'e.g. Senior Full Stack Engineer (React + Node.js) - 3+ Yrs Exp' },
  { slug: 'services', name: 'Local Services', icon: '🛠️', path: '/services', placeholderTitle: 'e.g. Professional Deep Home Cleaning & Sanitization Service' },
  { slug: 'farm', name: 'Agriculture & Farm', icon: '🌾', path: '/farm', placeholderTitle: 'e.g. 2022 Mahindra 575 DI 45 HP Tractor with Rotavator' },
  { slug: 'businesses', name: 'Business Directory', icon: '🏬', path: '/businesses', placeholderTitle: 'e.g. Running Premium Supermarket Store for Sale in Prime Mall' },
  { slug: 'rentals', name: 'Rentals & Leasing', icon: '🔑', path: '/rentals', placeholderTitle: 'e.g. Fully Furnished 2 BHK Flat for Monthly Rent in HSR Layout' },
  { slug: 'free', name: 'Free Giveaways', icon: '🎁', path: '/free', placeholderTitle: 'e.g. Solid Wood Study Table & Bookshelf for Students (Free Donation)' }
];

export function PostListing() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, activeCategory } = useAuth();
  const { showToast } = useToast();
  const { selectedLocation } = useLocationContext();

  const editId = searchParams.get('edit') || searchParams.get('id');

  // Determine initial category: URL param -> activeCategory -> User's sellerCategory -> properties
  const urlCat = searchParams.get('category');
  const userCat = activeCategory || (user?.sellerCategory && user.sellerCategory !== 'general' ? user.sellerCategory : null);
  const initialCategorySlug = normalizeCategoryId(urlCat || userCat || 'properties');

  // Default currency based on current marketplace country
  const defaultCurrencyObj = useMemo(() => {
    return getDefaultCurrencyForCountry(selectedLocation?.country || 'India');
  }, [selectedLocation?.country]);

  const [step, setStep] = useState(1);
  const totalSteps = 5;
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);

  // Form State
  const [formData, setFormData] = useState({
    categorySlug: initialCategorySlug,
    categoryId: '',
    subcategoryName: '',
    listingType: initialCategorySlug === 'free' ? 'FREE' : initialCategorySlug === 'rentals' ? 'RENT' : 'SELL',
    condition: 'GOOD',
    title: '',
    description: '',
    price: '',
    currency: defaultCurrencyObj.code || 'INR',
    currencySymbol: defaultCurrencyObj.symbol || '₹',
    negotiable: true,
    country: selectedLocation?.country || 'India',
    region: selectedLocation?.region || 'Karnataka',
    city: selectedLocation?.city || 'Bengaluru',
    localArea: '',
    address: '',
    landmark: '',
    latitude: 12.9716,
    longitude: 77.5946,
    zipCode: '',
    images: [],
    video: '',
    details: {
      // Properties
      propertyType: 'Apartment',
      bhk: '3 BHK',
      bedrooms: '3 BHK',
      bathrooms: '2',
      balconies: '1',
      builtUpArea: '',
      carpetArea: '',
      plotArea: '',
      floor: '4',
      totalFloors: '12',
      propertyAge: '1-3 Years',
      facing: 'East',
      furnishing: 'Semi Furnished',
      possessionStatus: 'Ready to Move',
      maintenanceCharges: '',
      
      // Vehicles
      vehicleType: 'Car',
      brand: 'Hyundai',
      model: 'Creta',
      variant: 'SX(O)',
      year: '2023',
      fuel: 'Diesel',
      transmission: 'Automatic',
      kmDriven: '18000',
      owners: '1st Owner',
      insurance: 'Comprehensive',
      
      // Electronics
      productType: 'Smartphone',
      electronicsBrand: 'Apple',
      electronicsModel: 'iPhone 15 Pro',
      storage: '256 GB',
      ram: '8 GB',
      warranty: 'Under Brand Warranty',
      includesBox: true,
      includesCharger: true,
      includesBill: true,

      // Jobs
      jobRole: 'Software Engineer',
      company: user?.companyName || 'Tech Solutions Pvt Ltd',
      jobType: 'Full-Time',
      experienceRequired: '2-4 Years',
      minQualification: "Bachelor's Degree",
      salaryRange: '₹6,00,000 - ₹10,00,000 P.A.',
      skills: 'React, Node.js, JavaScript, MongoDB',
      workMode: 'In-Office',

      // Services
      serviceType: 'Home Cleaning',
      providerName: user?.companyName || 'QuickFix Services',
      pricingModel: 'Fixed Price',
      serviceExperience: '5+ Years',
      availability: 'Mon-Sun (8 AM - 8 PM)',
      responseTime: 'Within 2 Hours',

      // Agriculture
      farmType: 'Tractor & Machinery',
      farmMachineryBrand: 'Mahindra',
      farmArea: '',
      soilType: '',
      waterSource: '',

      // Businesses
      businessType: 'Retail Store',
      businessName: user?.companyName || 'Prime Store',
      establishedYear: '2019',
      monthlyRevenue: '',
      moq: '',

      // Rentals
      rentalCategory: 'Residential House',
      rentalPeriod: 'Monthly',
      securityDeposit: '',
      leasePeriod: '11 Months',

      // Free Giveaways
      donationCategory: 'Books & Stationery',
      pickupMode: 'Doorstep Pick-up',

      // Universal amenities / perks list
      amenities: []
    }
  });

  const [mediaList, setMediaList] = useState([]);

  const activeSector = SECTORS.find(s => s.slug === formData.categorySlug) || SECTORS[0];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cats, locs] = await Promise.all([
          categoryService.getCategories(),
          locationService.getLocations()
        ]);
        setCategories(cats || []);
        setLocations(locs || []);
        if (cats && cats.length > 0) {
          const matchCat = cats.find(c => c.slug === formData.categorySlug) || cats[0];
          setFormData(prev => ({
            ...prev,
            categorySlug: matchCat.slug,
            categoryId: matchCat._id,
            subcategoryName: matchCat.subcategories?.[0]?.name || ''
          }));
        }
      } catch (e) {
        console.error('Failed to load categories/locations', e);
      }
    };
    fetchData();
  }, []);

  // If editing an existing listing, load and pre-fill form
  useEffect(() => {
    if (!editId) return;
    const loadListingForEdit = async () => {
      try {
        setLoading(true);
        const res = await listingsService.getListingById(editId);
        const listing = res?.data || res;
        if (listing) {
          const currObj = getCurrencyByCode(listing.currency || 'INR');
          setFormData(prev => ({
            ...prev,
            title: listing.title || '',
            description: listing.description || '',
            categorySlug: listing.category?.slug || listing.sellerCategory || listing.categorySlug || prev.categorySlug,
            categoryId: listing.category?._id || listing.categoryId || prev.categoryId,
            subcategoryName: listing.subcategoryName || listing.subcategory || prev.subcategoryName,
            listingType: listing.listingType || prev.listingType,
            condition: listing.condition || prev.condition,
            price: listing.price !== undefined ? String(listing.price) : '',
            currency: listing.currency || currObj?.code || 'INR',
            currencySymbol: listing.currencySymbol || currObj?.symbol || '₹',
            negotiable: listing.negotiable ?? true,
            country: listing.location?.country || prev.country,
            region: listing.location?.region || prev.region,
            city: listing.location?.city || prev.city,
            localArea: listing.location?.localArea || prev.localArea,
            address: listing.location?.address || prev.address,
            landmark: listing.location?.landmark || prev.landmark,
            latitude: listing.location?.latitude || prev.latitude,
            longitude: listing.location?.longitude || prev.longitude,
            zipCode: listing.location?.zipCode || prev.zipCode,
            details: {
              ...prev.details,
              ...(listing.details || {})
            }
          }));

          if (listing.media && listing.media.length > 0) {
            setMediaList(listing.media);
          } else if (listing.images && listing.images.length > 0) {
            setMediaList(listing.images.map((img, idx) => ({
              url: typeof img === 'string' ? img : img.url,
              secure_url: typeof img === 'string' ? img : img.secure_url || img.url,
              public_id: img.public_id || `existing-img-${idx}`
            })));
          }
        }
      } catch (err) {
        console.error('Failed to load listing for edit:', err);
        showToast('error', 'Failed to load listing details for editing');
      } finally {
        setLoading(false);
      }
    };
    loadListingForEdit();
  }, [editId]);

  const handleCategorySwitch = (slug) => {
    const cat = categories.find(c => c.slug === slug);
    const defaultType = slug === 'free' ? 'FREE' : slug === 'rentals' ? 'RENT' : 'SELL';
    
    // Set default amenities based on category
    let defaultAmenities = [];
    if (slug === 'properties') {
      defaultAmenities = ['Car Parking', 'High Speed Lift', '24/7 Security & CCTV', '100% Power Backup'];
    } else if (slug === 'vehicles') {
      defaultAmenities = ['Touchscreen Infotainment', 'ABS & EBD', 'Reverse Camera', 'Alloy Wheels', 'Power Windows'];
    } else if (slug === 'products') {
      defaultAmenities = ['Original Box Included', 'Original Fast Charger', 'Original Invoice / Bill Available', 'Brand Warranty'];
    } else if (slug === 'jobs') {
      defaultAmenities = ['Health Insurance', 'Annual Performance Bonus', 'Flexible Working Hours', 'Paid Time Off'];
    } else if (slug === 'services') {
      defaultAmenities = ['Verified Background Checked Pros', '30-Day Service Guarantee', 'Transparent Pricing', 'Doorstep Service'];
    }

    setFormData(prev => ({
      ...prev,
      categorySlug: slug,
      categoryId: cat?._id || prev.categoryId,
      subcategoryName: cat?.subcategories?.[0]?.name || '',
      listingType: defaultType,
      details: {
        ...prev.details,
        amenities: defaultAmenities
      }
    }));
  };

  const handleDetailChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      details: {
        ...prev.details,
        [key]: value
      }
    }));
  };

  const toggleAmenity = (amenity) => {
    const current = formData.details.amenities || [];
    const updated = current.includes(amenity)
      ? current.filter(a => a !== amenity)
      : [...current, amenity];
    handleDetailChange('amenities', updated);
  };

  const validateStep = () => {
    if (step === 1) {
      if (!formData.title.trim()) {
        showToast('error', 'Please enter a descriptive listing title');
        return false;
      }
      if (!formData.description.trim()) {
        showToast('error', 'Please enter a detailed description');
        return false;
      }
    }
    if (step === 2) {
      if (!formData.price && formData.listingType !== 'FREE') {
        showToast('error', 'Please specify the price, rent, or salary amount');
        return false;
      }
    }
    if (step === 4) {
      if (!formData.city.trim()) {
        showToast('error', 'Please specify the city');
        return false;
      }
    }
    if (step === 5) {
      if (formData.categorySlug === 'services') {
        return true;
      }
      if (mediaList.length < 3) {
        showToast('error', `Please upload at least 3 genuine photos of your listing before submitting (currently ${mediaList.length}/3 uploaded).`);
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    setStep(s => Math.min(s + 1, totalSteps));
  };

  const handlePrev = () => setStep(s => Math.max(s - 1, 1));

  const handleSubmit = async () => {
    const isServices = formData.categorySlug === 'services';

    if (!isServices && mediaList.length < 3) {
      showToast('error', `Please upload at least 3 genuine photos of your listing before submitting (currently ${mediaList.length}/3 uploaded).`);
      return;
    }

    setLoading(true);
    try {
      const finalMedia = isServices
        ? [{ url: '/service-technician-standard.jpg', secure_url: '/service-technician-standard.jpg', public_id: 'standard-service-technician' }]
        : mediaList;
      const finalImages = isServices
        ? ['/service-technician-standard.jpg']
        : mediaList.map(m => m.secure_url || m.url);

      const payload = {
        ...formData,
        price: formData.listingType === 'FREE' ? 0 : Number(formData.price),
        currency: (formData.currency || 'INR').toUpperCase(),
        currencySymbol: formData.currencySymbol || getCurrencyByCode(formData.currency)?.symbol || '₹',
        media: finalMedia,
        images: finalImages,
        location: {
          country: formData.country,
          region: formData.region,
          city: formData.city,
          localArea: formData.localArea,
          landmark: formData.landmark || '',
          address: formData.address || '',
          latitude: typeof formData.latitude === 'number' ? formData.latitude : (Number(formData.latitude) || null),
          longitude: typeof formData.longitude === 'number' ? formData.longitude : (Number(formData.longitude) || null),
          zipCode: formData.zipCode || ''
        },
        status: 'PENDING_REVIEW',
        details: {
          ...formData.details,
          sellerCategory: formData.categorySlug
        }
      };

      if (editId) {
        await listingsService.updateListing(editId, payload);
        showToast('success', `Your ${activeSector.name} listing has been updated successfully!`);
      } else {
        await listingsService.createListing(payload);
        showToast('success', `Your ${activeSector.name} listing has been submitted for review! It will be published upon admin approval.`);
      }
      
      // Navigate to seller dashboard
      navigate('/seller/dashboard');
    } catch (err) {
      console.error(err);
      showToast('error', err.message || 'Failed to submit listing');
    } finally {
      setLoading(false);
    }
  };

  const userRole = (user?.role || 'BUYER').toUpperCase();
  const isPendingSeller = userRole === 'SELLER' && (user?.sellerStatus === 'PENDING_APPROVAL' || user?.sellerStatus === 'PENDING');
  const isRejectedSeller = userRole === 'SELLER' && user?.sellerStatus === 'REJECTED';
  const isBuyer = userRole === 'BUYER' || userRole === 'USER';

  if (isBuyer) {
    return (
      <div className="bg-[var(--bg-primary)] text-[var(--text-primary)] min-h-[80vh] flex items-center justify-center py-12 transition-colors duration-200">
        <Container size="md">
          <div className="bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-3xl p-8 sm:p-10 text-center shadow-lg">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-3xl flex items-center justify-center mx-auto mb-4">
              🛍️
            </div>
            <h2 className="text-2xl font-black text-[var(--text-primary)]">Seller Account Required</h2>
            <p className="text-sm text-[var(--text-secondary)] mt-2 max-w-md mx-auto">
              You are currently signed in as a <strong>Buyer</strong>. To post listings, please register or sign in as a verified Seller.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/buyer/dashboard')}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-surface-hover)] text-sm font-bold cursor-pointer"
              >
                Buyer Dashboard
              </button>
              <button
                type="button"
                onClick={() => navigate(`${ROUTES.AUTH.LOGIN}?role=SELLER`)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[var(--button-primary)] text-[var(--button-primary-text)] text-sm font-bold cursor-pointer"
              >
                Sign In as Seller
              </button>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  if (isPendingSeller) {
    return (
      <div className="bg-[var(--bg-primary)] text-[var(--text-primary)] min-h-[80vh] flex items-center justify-center py-12 transition-colors duration-200">
        <Container size="md">
          <div className="bg-[var(--bg-surface)] border border-amber-500/30 rounded-3xl p-8 sm:p-10 text-center shadow-lg">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-3xl flex items-center justify-center mx-auto mb-4 animate-pulse">
              ⏳
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold uppercase mb-3">
              Pending Admin Verification
            </div>
            <h2 className="text-2xl font-black text-[var(--text-primary)]">Waiting for Admin Approval</h2>
            <p className="text-sm text-[var(--text-secondary)] mt-2 max-w-md mx-auto">
              Your seller application is under review. You will be able to post listings as soon as your account is approved.
            </p>
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={() => navigate('/seller/dashboard')}
                className="px-6 py-2.5 rounded-xl bg-[var(--button-primary)] text-[var(--button-primary-text)] text-sm font-bold cursor-pointer"
              >
                Go to Seller Dashboard
              </button>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="bg-[var(--bg-primary)] text-[var(--text-primary)] min-h-screen py-3 xs:py-4 sm:py-8 md:py-10 transition-colors duration-200">
      <Container size="4xl" className="px-2 xs:px-3 sm:px-6">
        
        {/* Back Navigation */}
        <div className="flex items-center gap-2 mb-3 sm:mb-5">
          <BackButton fallbackUrl={ROUTES.HOME} label="Back" />
          <button
            type="button"
            onClick={() => navigate(ROUTES.HOME)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-xs sm:text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] shadow-2xs transition-all active:scale-95 cursor-pointer"
          >
            <span>Home</span>
          </button>
        </div>

        <div className="bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-2xl sm:rounded-3xl p-3.5 xs:p-4 sm:p-8 lg:p-10 shadow-md">
          
          {/* Header */}
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center justify-between flex-wrap gap-1.5 mb-1.5 sm:mb-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-primary)] text-[11px] sm:text-[12px] font-bold uppercase tracking-wider shadow-2xs">
                <span className="text-[var(--accent)]">{activeSector.icon}</span>
                <span>{activeSector.name} Listing</span>
              </div>
              <span className="text-[10px] sm:text-xs font-bold text-[var(--text-muted)]">
                Posting as Verified Merchant
              </span>
            </div>

            <h1 className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-black text-[var(--text-primary)] tracking-tight leading-tight">
              Post a {activeSector.name} Listing
            </h1>
            <p className="text-[11px] xs:text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5 sm:mt-1">
              Fill in the verified specifications below to publish directly in the marketplace.
            </p>

            {/* Category Switcher Tabs */}
            <div className="mt-3 xs:mt-4 sm:mt-5 p-1.5 sm:p-2 rounded-xl sm:rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {SECTORS.map(sec => (
                <button
                  key={sec.slug}
                  type="button"
                  onClick={() => handleCategorySwitch(sec.slug)}
                  className={cn(
                    "px-2.5 xs:px-3 py-1.5 rounded-lg sm:rounded-xl text-[11px] xs:text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer shrink-0",
                    formData.categorySlug === sec.slug
                      ? "bg-[var(--button-primary)] text-[var(--button-primary-text)] shadow-xs"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]"
                  )}
                >
                  <span>{sec.icon}</span>
                  <span>{sec.name}</span>
                </button>
              ))}
            </div>

            {/* Stepper Progress */}
            <div className="mt-4 sm:mt-6 flex items-center gap-1.5 sm:gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <div
                  key={s}
                  className={cn(
                    'h-1.5 sm:h-2 flex-1 rounded-full transition-all duration-300',
                    s <= step ? 'bg-[var(--button-primary)]' : 'bg-[var(--border-primary)]'
                  )}
                />
              ))}
            </div>
            <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-0.5 mt-1.5 sm:mt-2 text-[11px] sm:text-xs font-bold text-[var(--text-secondary)]">
              <span>
                {step === 1 && 'Step 1: Title & Overview'}
                {step === 2 && 'Step 2: Specifications & Pricing'}
                {step === 3 && 'Step 3: Features & Highlights'}
                {step === 4 && 'Step 4: Location & Map Pin'}
                {step === 5 && 'Step 5: Photos & Submission'}
              </span>
              <span>Step {step} of {totalSteps}</span>
            </div>
          </div>

          {/* ============================================================ */}
          {/* STEP 1: Title & Purpose                                      */}
          {/* ============================================================ */}
          {step === 1 && (
            <div className="space-y-4 sm:space-y-5">
              <div>
                <label className="block text-[11px] sm:text-xs uppercase font-bold text-[var(--text-secondary)] mb-1.5 sm:mb-2 tracking-wider">
                  Listing Title *
                </label>
                <input
                  type="text"
                  placeholder={activeSector.placeholderTitle}
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-xl px-3.5 py-2.5 sm:px-4 sm:py-3 text-[var(--text-primary)] text-xs sm:text-sm focus:outline-hidden focus:border-[var(--button-primary)] font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] sm:text-xs uppercase font-bold text-[var(--text-secondary)] mb-1.5 sm:mb-2 tracking-wider">
                  Detailed Description *
                </label>
                <textarea
                  rows={5}
                  placeholder={`Describe your ${activeSector.name.toLowerCase()} listing in full detail (condition, specs, warranty, features, contact details)...`}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-xl px-3.5 py-2.5 sm:px-4 sm:py-3 text-[var(--text-primary)] text-xs sm:text-sm focus:outline-hidden focus:border-[var(--button-primary)] leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* STEP 2: Category-Specific Specifications & Price             */}
          {/* ============================================================ */}
          {step === 2 && (
            <div className="space-y-4 sm:space-y-5">
              
              {/* --- VEHICLES (CARS & BIKES) --- */}
              {formData.categorySlug === 'vehicles' && (
                <div className="space-y-3 sm:space-y-4">
                  <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
                    <div>
                      <label className="block text-xs uppercase font-bold text-[var(--text-secondary)] mb-1.5">Vehicle Type</label>
                      <select
                        value={formData.details.vehicleType}
                        onChange={(e) => handleDetailChange('vehicleType', e.target.value)}
                        className="w-full bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-xl px-3 py-2.5 text-xs text-[var(--text-primary)]"
                      >
                        {['Car', 'Motorcycle', 'Scooter', 'Commercial Vehicle', 'Auto Spare Parts'].map(v => <option key={v} value={v}>{v}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs uppercase font-bold text-[var(--text-secondary)] mb-1.5">Brand / Make</label>
                      <input
                        type="text"
                        placeholder="e.g. Maruti, Hyundai, Tata"
                        value={formData.details.brand}
                        onChange={(e) => handleDetailChange('brand', e.target.value)}
                        className="w-full bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-xl px-3 py-2.5 text-xs text-[var(--text-primary)]"
                      />
                    </div>

                    <div className="xs:col-span-2 sm:col-span-1">
                      <label className="block text-xs uppercase font-bold text-[var(--text-secondary)] mb-1.5">Model Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Swift, Creta, Thar"
                        value={formData.details.model}
                        onChange={(e) => handleDetailChange('model', e.target.value)}
                        className="w-full bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-xl px-3 py-2.5 text-xs text-[var(--text-primary)]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                    <div>
                      <label className="block text-xs uppercase font-bold text-[var(--text-secondary)] mb-1.5">Year</label>
                      <input
                        type="number"
                        placeholder="2023"
                        value={formData.details.year}
                        onChange={(e) => handleDetailChange('year', e.target.value)}
                        className="w-full bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-xl px-3 py-2.5 text-xs text-[var(--text-primary)]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase font-bold text-[var(--text-secondary)] mb-1.5">Fuel Type</label>
                      <select
                        value={formData.details.fuel}
                        onChange={(e) => handleDetailChange('fuel', e.target.value)}
                        className="w-full bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-xl px-3 py-2.5 text-xs text-[var(--text-primary)]"
                      >
                        {['Petrol', 'Diesel', 'CNG', 'Electric (EV)', 'Hybrid'].map(f => <option key={f} value={f}>{f}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs uppercase font-bold text-[var(--text-secondary)] mb-1.5">Transmission</label>
                      <select
                        value={formData.details.transmission}
                        onChange={(e) => handleDetailChange('transmission', e.target.value)}
                        className="w-full bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-xl px-3 py-2.5 text-xs text-[var(--text-primary)]"
                      >
                        {['Manual', 'Automatic', 'AMT'].map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs uppercase font-bold text-[var(--text-secondary)] mb-1.5">KM Driven</label>
                      <input
                        type="number"
                        placeholder="e.g. 24000"
                        value={formData.details.kmDriven}
                        onChange={(e) => handleDetailChange('kmDriven', e.target.value)}
                        className="w-full bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-xl px-3 py-2.5 text-xs text-[var(--text-primary)]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* --- MOBILES & ELECTRONICS --- */}
              {formData.categorySlug === 'products' && (
                <div className="space-y-3 sm:space-y-4">
                  <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
                    <div>
                      <label className="block text-xs uppercase font-bold text-[var(--text-secondary)] mb-1.5">Electronics Type</label>
                      <select
                        value={formData.details.productType}
                        onChange={(e) => handleDetailChange('productType', e.target.value)}
                        className="w-full bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-xl px-3 py-2.5 text-xs text-[var(--text-primary)]"
                      >
                        {['Smartphone', 'Laptop', 'Tablet', 'Smart Watch', 'TV & Audio', 'Gaming Console', 'Camera'].map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs uppercase font-bold text-[var(--text-secondary)] mb-1.5">Brand</label>
                      <input
                        type="text"
                        placeholder="e.g. Apple, Samsung"
                        value={formData.details.electronicsBrand}
                        onChange={(e) => handleDetailChange('electronicsBrand', e.target.value)}
                        className="w-full bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-xl px-3 py-2.5 text-xs text-[var(--text-primary)]"
                      />
                    </div>

                    <div className="xs:col-span-2 sm:col-span-1">
                      <label className="block text-xs uppercase font-bold text-[var(--text-secondary)] mb-1.5">Model / Variant</label>
                      <input
                        type="text"
                        placeholder="e.g. iPhone 15 Pro"
                        value={formData.details.electronicsModel}
                        onChange={(e) => handleDetailChange('electronicsModel', e.target.value)}
                        className="w-full bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-xl px-3 py-2.5 text-xs text-[var(--text-primary)]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                    <div>
                      <label className="block text-xs uppercase font-bold text-[var(--text-secondary)] mb-1.5">Storage</label>
                      <select
                        value={formData.details.storage}
                        onChange={(e) => handleDetailChange('storage', e.target.value)}
                        className="w-full bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-xl px-3 py-2.5 text-xs text-[var(--text-primary)]"
                      >
                        {['64 GB', '128 GB', '256 GB', '512 GB', '1 TB'].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs uppercase font-bold text-[var(--text-secondary)] mb-1.5">RAM</label>
                      <select
                        value={formData.details.ram}
                        onChange={(e) => handleDetailChange('ram', e.target.value)}
                        className="w-full bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-xl px-3 py-2.5 text-xs text-[var(--text-primary)]"
                      >
                        {['4 GB', '6 GB', '8 GB', '16 GB', '32 GB'].map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs uppercase font-bold text-[var(--text-secondary)] mb-1.5">Condition</label>
                      <select
                        value={formData.condition}
                        onChange={(e) => setFormData(prev => ({ ...prev, condition: e.target.value }))}
                        className="w-full bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-xl px-3 py-2.5 text-xs text-[var(--text-primary)]"
                      >
                        {['NEW', 'LIKE_NEW', 'GOOD', 'FAIR'].map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs uppercase font-bold text-[var(--text-secondary)] mb-1.5">Warranty</label>
                      <select
                        value={formData.details.warranty}
                        onChange={(e) => handleDetailChange('warranty', e.target.value)}
                        className="w-full bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-xl px-3 py-2.5 text-xs text-[var(--text-primary)]"
                      >
                        {['Under Brand Warranty', 'Out of Warranty', 'Seller Warranty'].map(w => <option key={w} value={w}>{w}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* --- JOBS & CAREERS --- */}
              {formData.categorySlug === 'jobs' && (
                <div className="space-y-3 sm:space-y-4">
                  <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
                    <div>
                      <label className="block text-xs uppercase font-bold text-[var(--text-secondary)] mb-1.5">Job Designation / Role</label>
                      <input
                        type="text"
                        placeholder="e.g. Frontend Developer"
                        value={formData.details.jobRole}
                        onChange={(e) => handleDetailChange('jobRole', e.target.value)}
                        className="w-full bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-xl px-3 py-2.5 text-xs text-[var(--text-primary)]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase font-bold text-[var(--text-secondary)] mb-1.5">Company Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Acme Tech"
                        value={formData.details.company}
                        onChange={(e) => handleDetailChange('company', e.target.value)}
                        className="w-full bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-xl px-3 py-2.5 text-xs text-[var(--text-primary)]"
                      />
                    </div>

                    <div className="xs:col-span-2 sm:col-span-1">
                      <label className="block text-xs uppercase font-bold text-[var(--text-secondary)] mb-1.5">Employment Type</label>
                      <select
                        value={formData.details.jobType}
                        onChange={(e) => handleDetailChange('jobType', e.target.value)}
                        className="w-full bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-xl px-3 py-2.5 text-xs text-[var(--text-primary)]"
                      >
                        {['Full-Time', 'Part-Time', 'Contract', 'Remote', 'Internship'].map(j => <option key={j} value={j}>{j}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                    <div>
                      <label className="block text-xs uppercase font-bold text-[var(--text-secondary)] mb-1.5">Experience Required</label>
                      <select
                        value={formData.details.experienceRequired}
                        onChange={(e) => handleDetailChange('experienceRequired', e.target.value)}
                        className="w-full bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-xl px-3 py-2.5 text-xs text-[var(--text-primary)]"
                      >
                        {['Fresher', '1-3 Years', '3-5 Years', '5+ Years', '10+ Years'].map(e => <option key={e} value={e}>{e}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs uppercase font-bold text-[var(--text-secondary)] mb-1.5">Key Skills (Comma Separated)</label>
                      <input
                        type="text"
                        placeholder="e.g. React, Node.js, Excel"
                        value={formData.details.skills}
                        onChange={(e) => handleDetailChange('skills', e.target.value)}
                        className="w-full bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-xl px-3 py-2.5 text-xs text-[var(--text-primary)]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* --- LOCAL SERVICES --- */}
              {formData.categorySlug === 'services' && (
                <div className="space-y-3 sm:space-y-4">
                  <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
                    <div>
                      <label className="block text-xs uppercase font-bold text-[var(--text-secondary)] mb-1.5">Service Type</label>
                      <select
                        value={formData.details.serviceType}
                        onChange={(e) => handleDetailChange('serviceType', e.target.value)}
                        className="w-full bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-xl px-3 py-2.5 text-xs text-[var(--text-primary)]"
                      >
                        {['Home Cleaning', 'Electrician', 'Plumber', 'AC Repair', 'Packers & Movers', 'Painter', 'Carpenter', 'Salon & Spa', 'Pest Control'].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs uppercase font-bold text-[var(--text-secondary)] mb-1.5">Provider / Agency Name</label>
                      <input
                        type="text"
                        placeholder="e.g. QuickFix Services"
                        value={formData.details.providerName}
                        onChange={(e) => handleDetailChange('providerName', e.target.value)}
                        className="w-full bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-xl px-3 py-2.5 text-xs text-[var(--text-primary)]"
                      />
                    </div>

                    <div className="xs:col-span-2 sm:col-span-1">
                      <label className="block text-xs uppercase font-bold text-[var(--text-secondary)] mb-1.5">Pricing Model</label>
                      <select
                        value={formData.details.pricingModel}
                        onChange={(e) => handleDetailChange('pricingModel', e.target.value)}
                        className="w-full bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-xl px-3 py-2.5 text-xs text-[var(--text-primary)]"
                      >
                        {['Fixed Price', 'Starting From', 'Per Hour', 'Inspection Charge'].map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* --- PROPERTIES --- */}
              {formData.categorySlug === 'properties' && (
                <div className="space-y-3 sm:space-y-4">
                  <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
                    <div>
                      <label className="block text-xs uppercase font-bold text-[var(--text-secondary)] mb-1.5">Property Type</label>
                      <select
                        value={formData.details.propertyType}
                        onChange={(e) => handleDetailChange('propertyType', e.target.value)}
                        className="w-full bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-xl px-3 py-2.5 text-xs text-[var(--text-primary)]"
                      >
                        {['Apartment', 'Independent House', 'Villa', 'Plot / Land', 'Commercial Space', 'Office'].map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs uppercase font-bold text-[var(--text-secondary)] mb-1.5">Bedrooms (BHK)</label>
                      <select
                        value={formData.details.bhk}
                        onChange={(e) => handleDetailChange('bhk', e.target.value)}
                        className="w-full bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-xl px-3 py-2.5 text-xs text-[var(--text-primary)]"
                      >
                        {['1 BHK', '2 BHK', '3 BHK', '4 BHK', '5+ BHK', 'Studio'].map(b => <option key={b} value={b}>{b}</option>)}
                      </select>
                    </div>

                    <div className="xs:col-span-2 sm:col-span-1">
                      <label className="block text-xs uppercase font-bold text-[var(--text-secondary)] mb-1.5">Carpet Area (sq.ft)</label>
                      <input
                        type="number"
                        placeholder="e.g. 1450"
                        value={formData.details.carpetArea}
                        onChange={(e) => handleDetailChange('carpetArea', e.target.value)}
                        className="w-full bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-xl px-3 py-2.5 text-xs text-[var(--text-primary)]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Price / Currency Block */}
              {formData.categorySlug !== 'free' ? (
                <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-3 sm:space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    {/* Worldwide Currency Selector */}
                    <div>
                      <label className="block text-[11px] sm:text-xs uppercase font-bold text-[var(--text-secondary)] tracking-wider mb-1.5">
                        Listing Currency *
                      </label>
                      <CurrencySelector
                        selectedCurrency={formData.currency}
                        onSelectCurrency={(cur) => {
                          setFormData(prev => ({
                            ...prev,
                            currency: cur.code,
                            currencySymbol: cur.symbol
                          }));
                        }}
                        defaultCountry={formData.country || selectedLocation?.country || 'India'}
                      />
                      <p className="text-[10px] text-[var(--text-muted)] mt-1">
                        Worldwide currency for pricing your listing.
                      </p>
                    </div>

                    {/* Price / Amount Input */}
                    <div>
                      <label className="block text-[11px] sm:text-xs uppercase font-bold text-[var(--text-secondary)] tracking-wider mb-1.5">
                        {formData.categorySlug === 'jobs' 
                          ? `Salary / CTC (${formData.currencySymbol || '₹'}) *` 
                          : formData.categorySlug === 'services' 
                            ? `Starting Rate / Fee (${formData.currencySymbol || '₹'}) *`
                            : formData.categorySlug === 'rentals'
                              ? `Monthly Rent (${formData.currencySymbol || '₹'}) *`
                              : `Price Amount (${formData.currencySymbol || '₹'}) *`}
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-2.5 text-[var(--text-muted)] font-bold text-sm">
                          {formData.currencySymbol || getCurrencyByCode(formData.currency)?.symbol || '₹'}
                        </span>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          placeholder={formData.currency === 'USD' ? 'e.g. 50000' : formData.currency === 'EUR' ? 'e.g. 45000' : 'e.g. 450000'}
                          value={formData.price}
                          onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                          className="w-full bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-xl pl-9 pr-3.5 py-2.5 text-[var(--text-primary)] text-xs sm:text-sm font-bold min-h-[42px]"
                        />
                      </div>
                      {formData.price && Number(formData.price) > 0 ? (
                        <div className="mt-2 px-2.5 py-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-primary)] text-[11px] flex items-center justify-between">
                          <span className="text-[var(--text-muted)] font-medium">Display Preview:</span>
                          <span className="font-bold text-[var(--color-primary)]">
                            {formatListingPrice(formData.price, formData.currency)}
                          </span>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-500 font-bold">
                  🎁 Free Community Donation (Price is 0 - 100% Free)
                </div>
              )}

            </div>
          )}

          {/* ============================================================ */}
          {/* STEP 3: Category Amenities & Highlights                      */}
          {/* ============================================================ */}
          {step === 3 && (
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-[11px] sm:text-xs uppercase font-bold text-[var(--text-secondary)] tracking-wider">
                Select Key Features & Amenities
              </h3>
              
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5">
                {(formData.categorySlug === 'vehicles' ? [
                  'Touchscreen Infotainment', 'ABS & EBD', 'Reverse Camera', 'Alloy Wheels', 'Power Windows', 'Sunroof', 'Leather Seats', 'Cruise Control', 'Airbags', 'Single Owner'
                ] : formData.categorySlug === 'products' ? [
                  'Original Box Included', 'Original Fast Charger', 'Original Invoice / Bill Available', 'Brand Warranty', 'Zero Scratches', 'Tempered Glass Applied', 'All Sensors Working'
                ] : formData.categorySlug === 'jobs' ? [
                  'Health Insurance', 'Annual Performance Bonus', 'Flexible Working Hours', 'Paid Time Off', 'PF & ESIC Provided', 'Work From Home Option', 'Free Cab / Transport'
                ] : formData.categorySlug === 'services' ? [
                  'Verified Background Checked Pros', '30-Day Service Guarantee', 'Transparent Pricing', 'Doorstep Service', '24/7 Emergency Support', 'Genuine Parts'
                ] : [
                  'Car Parking', 'High Speed Lift', '24/7 Security & CCTV', '100% Power Backup', 'Swimming Pool', 'Gymnasium', 'Landscaped Garden', 'Club House'
                ]).map(amenity => {
                  const isSelected = (formData.details.amenities || []).includes(amenity);
                  return (
                    <button
                      key={amenity}
                      type="button"
                      onClick={() => toggleAmenity(amenity)}
                      className={cn(
                        'p-2.5 xs:p-3 rounded-xl sm:rounded-2xl border text-left text-xs font-bold transition-all flex items-center justify-between gap-2 cursor-pointer min-h-[42px]',
                        isSelected
                          ? 'bg-[var(--button-primary)] text-[var(--button-primary-text)] border-[var(--button-primary)] shadow-xs'
                          : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-[var(--border-primary)] hover:border-[var(--button-primary)]'
                      )}
                    >
                      <span className="truncate">{amenity}</span>
                      <span className="shrink-0">{isSelected ? '✓' : '+'}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* STEP 4: Location & Map Pin                                   */}
          {/* ============================================================ */}
          {step === 4 && (
            <div className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                <div>
                  <label className="block text-xs uppercase font-bold text-[var(--text-secondary)] mb-1.5">City *</label>
                  <input
                    type="text"
                    placeholder="e.g. Bengaluru, Mumbai, Delhi"
                    value={formData.city}
                    onChange={(e) => {
                      const val = e.target.value;
                      const preset = CITY_COORDS[val];
                      setFormData(prev => ({
                        ...prev,
                        city: val,
                        ...(preset ? { latitude: preset.lat, longitude: preset.lng } : {})
                      }));
                    }}
                    className="w-full bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--text-primary)] font-bold min-h-[42px]"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase font-bold text-[var(--text-secondary)] mb-1.5">Neighborhood / Local Area</label>
                  <input
                    type="text"
                    placeholder="e.g. Indiranagar, HSR Layout"
                    value={formData.localArea}
                    onChange={(e) => setFormData(prev => ({ ...prev, localArea: e.target.value }))}
                    className="w-full bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-xl px-3.5 py-2.5 text-xs text-[var(--text-primary)] min-h-[42px]"
                  />
                </div>
              </div>

              {/* Map Preview */}
              <div className="pt-1 sm:pt-2">
                <RealMapLocation
                  location={{
                    country: formData.country,
                    region: formData.region,
                    city: formData.city,
                    localArea: formData.localArea,
                    landmark: formData.landmark,
                    address: formData.address,
                    latitude: formData.latitude,
                    longitude: formData.longitude
                  }}
                  title={formData.title || 'Listing Location'}
                  height="210px"
                  showDirections={false}
                />
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* STEP 5: Cloudinary Photos Upload & Moderation Submission     */}
          {/* ============================================================ */}
          {step === 5 && (
            <div className="space-y-4 sm:space-y-6">
              {formData.categorySlug === 'services' ? (
                <div className="space-y-5">
                  <div className="p-4 sm:p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3.5 text-xs text-[var(--text-secondary)]">
                    <span className="text-2xl shrink-0">🛡️</span>
                    <div>
                      <strong className="text-emerald-500 dark:text-emerald-400 text-sm block mb-1 font-black">
                        Standardized Verified Service Uniform Applied
                      </strong>
                      <p className="leading-relaxed">
                        To maintain standard professional quality and prevent fake/misleading photos across all Local Services, custom image uploads are disabled. All service listings automatically feature the official Velvorax certified technician mockup photo.
                      </p>
                    </div>
                  </div>

                  {/* Standard Mockup Image Preview Card */}
                  <div className="bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row items-center gap-6">
                    <div className="relative w-full md:w-64 aspect-[4/3] rounded-2xl overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-secondary)] shrink-0 shadow-xs">
                      <img
                        src="/service-technician-standard.jpg"
                        alt="Velvorax Verified Technician Uniform"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-emerald-500 text-white font-black text-[10px] tracking-wider uppercase shadow-sm">
                        ✓ Verified Uniform
                      </div>
                    </div>

                    <div className="space-y-2.5 text-left flex-1">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] text-xs font-bold border border-[var(--accent)]/20">
                        <span>⭐</span>
                        <span>Official Service Partner Badge</span>
                      </div>
                      <h4 className="text-base sm:text-lg font-black text-[var(--text-primary)]">
                        Official Velvorax Service Professional Image
                      </h4>
                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                        Your service listing will appear with this certified, brand-aligned professional mockup image across all marketplace feeds, category catalogs, and search results.
                      </p>
                      <div className="pt-2 flex flex-wrap items-center gap-2 text-[11px] text-[var(--text-muted)] font-semibold">
                        <span className="bg-[var(--bg-secondary)] px-2.5 py-1 rounded-md border border-[var(--border-primary)]">🔒 Protected Quality</span>
                        <span className="bg-[var(--bg-secondary)] px-2.5 py-1 rounded-md border border-[var(--border-primary)]">⚡ 100% Verified Look</span>
                        <span className="bg-[var(--bg-secondary)] px-2.5 py-1 rounded-md border border-[var(--border-primary)]">🤝 Customer Trust Assured</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-amber-500/10 border border-amber-500/20 text-[11px] sm:text-xs text-amber-500 font-bold flex items-center gap-2">
                    <span className="shrink-0">🛡️</span>
                    <span>All merchant listings undergo quality moderation (PENDING_REVIEW) before becoming visible to buyers.</span>
                  </div>
                </div>
              ) : (
                <>
                  <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-start gap-2.5 sm:gap-3 text-[11px] sm:text-xs text-[var(--text-secondary)]">
                    <span className="text-lg sm:text-xl shrink-0">☁️</span>
                    <div>
                      <strong className="text-[var(--text-primary)] block mb-0.5">
                        Cloudinary CDN Media Storage (Up to 3 Photos, Max 1 MB Each)
                      </strong>
                      Upload up to 3 genuine photos of your {activeSector.name.toLowerCase()} listing (JPG, JPEG, PNG, WEBP, maximum 1 MB per photo). Photos will be securely delivered via Cloudinary CDN. The first photo is set as the primary cover photo.
                    </div>
                  </div>

                  {/* Interactive ListingImageUploader */}
                  <ListingImageUploader
                    media={mediaList}
                    onChange={setMediaList}
                    minImages={1}
                    maxImages={3}
                    disabled={loading}
                    folder="velvorax-marketplace/listings"
                  />

                  <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-amber-500/10 border border-amber-500/20 text-[11px] sm:text-xs text-amber-500 font-bold flex items-center gap-2">
                    <span className="shrink-0">🛡️</span>
                    <span>All merchant listings undergo quality moderation (PENDING_REVIEW) before becoming visible to buyers.</span>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Footer Navigation */}
          <div className="mt-6 sm:mt-8 pt-4 sm:pt-5 border-t border-[var(--border-subtle)] flex justify-between items-center gap-2.5">
            <button
              type="button"
              onClick={handlePrev}
              disabled={step === 1}
              className={cn(
                'px-3.5 sm:px-5 py-2.5 h-[40px] xs:h-[44px] rounded-xl border border-[var(--border-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs sm:text-sm font-bold transition-colors cursor-pointer shrink-0',
                step === 1 && 'opacity-0 pointer-events-none'
              )}
            >
              &larr; Back
            </button>

            {step < totalSteps ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-4.5 xs:px-6 py-2.5 h-[40px] xs:h-[44px] bg-[var(--button-primary)] text-[var(--button-primary-text)] font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md cursor-pointer shrink-0"
              >
                Continue &rarr;
              </button>
            ) : (
              <button
                type="button"
                disabled={loading}
                onClick={handleSubmit}
                className="px-4.5 xs:px-6 sm:px-7 py-2.5 h-[40px] xs:h-[44px] bg-[var(--button-primary)] text-[var(--button-primary-text)] font-black text-xs sm:text-sm rounded-xl transition-all shadow-md disabled:opacity-50 cursor-pointer shrink-0"
              >
                {loading ? (editId ? 'Updating...' : 'Publishing...') : (editId ? '💾 Save Changes' : '🚀 Publish Listing')}
              </button>
            )}
          </div>

        </div>
      </Container>
    </div>
  );
}

export default PostListing;
