import './Register.css';
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Input, Button } from '../../components';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { ROUTES } from '../../constants';
import { DEFAULT_WORLDWIDE_LOCATIONS } from '../../context/LocationContext';
import { validatePhoneNumber } from '../../utils/phoneValidator';
import { MARKETPLACE_CATEGORIES, DEFAULT_MARKETPLACE_CATEGORY, normalizeCategoryId } from '../../constants/categories';

export const SELLER_CATEGORIES = MARKETPLACE_CATEGORIES;

export const Register = () => {
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Read URL query params: ?role=SELLER&category=properties
  const urlRole = (searchParams.get('role') || '').toUpperCase();
  const urlCategory = (searchParams.get('category') || '').toLowerCase();

  const [role, setRole] = useState(urlRole === 'SELLER' ? 'SELLER' : 'BUYER');
  const [selectedCategory, setSelectedCategory] = useState(
    urlCategory && MARKETPLACE_CATEGORIES.some(c => c.id === urlCategory) ? urlCategory : DEFAULT_MARKETPLACE_CATEGORY
  );

  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    phone: '',
    companyName: '',
    aadhaarNumber: '',
    panNumber: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  });

  const [locationData, setLocationData] = useState({
    country: 'India',
    countryCode: 'IN',
    state: 'Karnataka',
    city: 'Bengaluru',
    localArea: 'Koramangala'
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state if URL query params change
  useEffect(() => {
    if (urlRole === 'SELLER' || urlRole === 'BUYER') {
      setRole(urlRole);
    }
    if (urlCategory && SELLER_CATEGORIES.some(c => c.id === urlCategory)) {
      setSelectedCategory(urlCategory);
    }
  }, [urlRole, urlCategory]);

  const activeCategoryMeta = SELLER_CATEGORIES.find(c => c.id === selectedCategory) || SELLER_CATEGORIES[0];

  // Dependent location arrays
  const selectedCountryObj = DEFAULT_WORLDWIDE_LOCATIONS.find(c => c.countryName === locationData.country) || DEFAULT_WORLDWIDE_LOCATIONS[0];
  const availableRegions = selectedCountryObj?.regions || [];
  const selectedRegionObj = availableRegions.find(r => r.name === locationData.state) || availableRegions[0];
  const availableCities = selectedRegionObj?.cities || [];
  const selectedCityObj = availableCities.find(c => c.name === locationData.city) || availableCities[0];
  const availableLocalAreas = selectedCityObj?.localAreas || [];

  const handleCountryChange = (countryName) => {
    const cObj = DEFAULT_WORLDWIDE_LOCATIONS.find(c => c.countryName === countryName) || DEFAULT_WORLDWIDE_LOCATIONS[0];
    const firstRegion = cObj?.regions?.[0];
    const firstCity = firstRegion?.cities?.[0];
    const firstArea = firstCity?.localAreas?.[0]?.name || '';

    setLocationData({
      country: cObj.countryName,
      countryCode: cObj.countryCode,
      state: firstRegion?.name || '',
      city: firstCity?.name || '',
      localArea: firstArea
    });
    setErrors(prev => ({ ...prev, country: '', state: '', city: '', localArea: '' }));
  };

  const handleStateChange = (stateName) => {
    const rObj = availableRegions.find(r => r.name === stateName);
    const firstCity = rObj?.cities?.[0];
    const firstArea = firstCity?.localAreas?.[0]?.name || '';

    setLocationData(prev => ({
      ...prev,
      state: stateName,
      city: firstCity?.name || '',
      localArea: firstArea
    }));
    setErrors(prev => ({ ...prev, state: '', city: '', localArea: '' }));
  };

  const handleCityChange = (cityName) => {
    const cObj = availableCities.find(c => c.name === cityName);
    const firstArea = cObj?.localAreas?.[0]?.name || '';

    setLocationData(prev => ({
      ...prev,
      city: cityName,
      localArea: firstArea
    }));
    setErrors(prev => ({ ...prev, city: '', localArea: '' }));
  };

  const handleLocalAreaChange = (areaName) => {
    setLocationData(prev => ({
      ...prev,
      localArea: areaName
    }));
    setErrors(prev => ({ ...prev, localArea: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Full contact name is required';
    if (!formData.email.trim()) newErrors.email = 'Email address is required';
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Valid email address is required';
    
    const phoneVal = validatePhoneNumber(formData.phone, true);
    if (!phoneVal.isValid) {
      newErrors.phone = phoneVal.error;
    }

    if (!locationData.country) newErrors.country = 'Country is required';
    if (!locationData.state) newErrors.state = 'State / Region is required';
    if (!locationData.city) newErrors.city = 'City / District is required';

    if (role === 'SELLER') {
      if (!formData.companyName.trim()) {
        newErrors.companyName = `${activeCategoryMeta.businessLabel} is required`;
      }

      // Aadhaar Validation
      const rawAadhaar = formData.aadhaarNumber.replace(/\s+/g, '');
      if (!rawAadhaar) {
        newErrors.aadhaarNumber = 'Aadhaar Card Number is required for seller verification.';
      } else if (!/^\d{12}$/.test(rawAadhaar)) {
        newErrors.aadhaarNumber = 'Aadhaar must be exactly 12 digits (numbers only).';
      }

      // PAN Validation
      const rawPan = formData.panNumber.trim().toUpperCase();
      if (!rawPan) {
        newErrors.panNumber = 'PAN Card Number is required for seller verification.';
      } else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(rawPan)) {
        newErrors.panNumber = 'Invalid PAN format. Must be 5 letters, 4 digits, 1 letter (e.g. ABCDE1234F).';
      }
    }

    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    else if (formData.password.length > 128) newErrors.password = 'Password cannot exceed 128 characters';
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.agreeTerms) {
      newErrors.agreeTerms = 'You must agree to the Terms and Privacy Policy';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let finalVal = type === 'checkbox' ? checked : value;
    if (name === 'panNumber' && typeof finalVal === 'string') {
      finalVal = finalVal.toUpperCase();
    }
    setFormData(prev => ({ 
      ...prev, 
      [name]: finalVal 
    }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const cleanAadhaar = role === 'SELLER' ? formData.aadhaarNumber.replace(/\s+/g, '') : undefined;
      const cleanPan = role === 'SELLER' ? formData.panNumber.trim().toUpperCase() : undefined;

      await register({ 
        name: formData.name.trim(), 
        email: formData.email.trim(), 
        phone: formData.phone.trim(),
        password: formData.password,
        role,
        sellerCategory: role === 'SELLER' ? selectedCategory : 'general',
        companyName: role === 'SELLER' ? formData.companyName.trim() : '',
        businessType: role === 'SELLER' ? activeCategoryMeta.name : '',
        aadhaarNumber: cleanAadhaar,
        panNumber: cleanPan,
        location: {
          country: locationData.country,
          countryCode: locationData.countryCode,
          state: locationData.state,
          region: locationData.state,
          city: locationData.city,
          localArea: locationData.localArea
        }
      });

      if (role === 'SELLER') {
        showToast(
          'success', 
          'Seller account created successfully. Your account is pending admin approval. You can create/manage your information, but listings cannot be published until your account is approved.'
        );
        navigate('/seller/dashboard', { replace: true });
      } else {
        showToast('success', `Welcome to Velvorax, ${formData.name}! Your account is ready.`);
        navigate('/', { replace: true });
      }
    } catch (error) {
      showToast('error', error.response?.data?.message || error.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-[var(--bg-surface)] p-6 sm:p-9 rounded-3xl border border-[var(--border-primary)] shadow-xl animate-scale-in text-[var(--text-primary)]">
      
      {/* Header */}
      <div className="text-center mb-6 space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
          Create an Account
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
          Join Velvorax Marketplace to browse, buy, or sell across 9 sectors.
        </p>
      </div>

      {/* Clean Role Toggle Pills */}
      <div className="mb-5">
        <div className="grid grid-cols-2 p-1 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-subtle)]">
          <button
            type="button"
            onClick={() => setRole('BUYER')}
            className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
              role === 'BUYER'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <span>🛍️</span>
            <span>Buyer</span>
          </button>

          <button
            type="button"
            onClick={() => setRole('SELLER')}
            className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
              role === 'SELLER'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <span>📦</span>
            <span>Seller / Provider</span>
          </button>
        </div>
      </div>

      {/* Clean Category Selector Dropdown (When Seller is selected) */}
      {role === 'SELLER' && (
        <div className="mb-5 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
              Select Your Sector / Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-primary)] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              {SELLER_CATEGORIES.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>

          <Input
            label={activeCategoryMeta.businessLabel}
            name="companyName"
            type="text"
            value={formData.companyName}
            onChange={handleChange}
            error={errors.companyName}
            placeholder={activeCategoryMeta.businessPlaceholder}
            leftIcon={<span className="text-sm">{activeCategoryMeta.icon}</span>}
          />

          {/* Identity Verification (Aadhaar & PAN) */}
          <div className="pt-3 border-t border-emerald-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <span>🛡️</span>
                <span>Seller Identity Verification (KYC)</span>
              </span>
              <span className="text-[10px] text-emerald-400/80 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                Required for Sellers
              </span>
            </div>

            <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
              Required for seller verification. Your verification information is private and will not be displayed publicly.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Aadhaar Card Number"
                name="aadhaarNumber"
                type="text"
                value={formData.aadhaarNumber}
                onChange={handleChange}
                error={errors.aadhaarNumber}
                placeholder="12-digit number (e.g. 123456789012)"
                maxLength={14}
                leftIcon={<span className="text-sm">🆔</span>}
              />

              <Input
                label="PAN Card Number"
                name="panNumber"
                type="text"
                value={formData.panNumber}
                onChange={handleChange}
                error={errors.panNumber}
                placeholder="10-digit PAN (e.g. ABCDE1234F)"
                maxLength={10}
                leftIcon={<span className="text-sm">💳</span>}
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Registration Form Inputs */}
      <form className="space-y-4" onSubmit={handleSubmit} autoComplete="off">
        
        {/* Full Name */}
        <Input
          label={role === 'SELLER' ? 'Contact Person Name' : 'Full Name'}
          name="name"
          type="text"
          autoComplete="name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          placeholder={role === 'SELLER' ? 'e.g. Ramesh Chandra' : 'e.g. Priya Sharma'}
          leftIcon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          }
        />

        {/* Email & Phone Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Email Address"
            name="email"
            type="email"
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            placeholder="name@example.com"
            leftIcon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
              </svg>
            }
          />

          <Input
            label="Phone Number"
            name="phone"
            type="tel"
            autoComplete="tel"
            value={formData.phone}
            onChange={handleChange}
            error={errors.phone}
            placeholder="+91 98765 43210"
            leftIcon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            }
          />
        </div>

        {/* Dependent Location Selection Section */}
        <div className="p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
              <span>📍</span>
              <span>Account Registration Location <span className="text-[var(--error)]">*</span></span>
            </span>
            <span className="text-[11px] text-[var(--text-muted)] font-medium">Mandatory</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Country */}
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                Country
              </label>
              <select
                value={locationData.country}
                onChange={(e) => handleCountryChange(e.target.value)}
                className="w-full bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-primary)] rounded-xl px-3 py-2 text-xs sm:text-sm font-medium focus:outline-none focus:ring-1 focus:ring-[var(--button-primary)] cursor-pointer"
              >
                {DEFAULT_WORLDWIDE_LOCATIONS.map(c => (
                  <option key={c.countryCode} value={c.countryName}>
                    {c.countryName} ({c.currency})
                  </option>
                ))}
              </select>
              {errors.country && <p className="text-[11px] text-[var(--error)] mt-0.5">{errors.country}</p>}
            </div>

            {/* State / Province */}
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                State / Province
              </label>
              <select
                value={locationData.state}
                onChange={(e) => handleStateChange(e.target.value)}
                className="w-full bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-primary)] rounded-xl px-3 py-2 text-xs sm:text-sm font-medium focus:outline-none focus:ring-1 focus:ring-[var(--button-primary)] cursor-pointer"
              >
                {availableRegions.map(r => (
                  <option key={r.slug || r.name} value={r.name}>
                    {r.name}
                  </option>
                ))}
              </select>
              {errors.state && <p className="text-[11px] text-[var(--error)] mt-0.5">{errors.state}</p>}
            </div>

            {/* City / District */}
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                City / District
              </label>
              <select
                value={locationData.city}
                onChange={(e) => handleCityChange(e.target.value)}
                className="w-full bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-primary)] rounded-xl px-3 py-2 text-xs sm:text-sm font-medium focus:outline-none focus:ring-1 focus:ring-[var(--button-primary)] cursor-pointer"
              >
                {availableCities.map(ct => (
                  <option key={ct.slug || ct.name} value={ct.name}>
                    {ct.name}
                  </option>
                ))}
              </select>
              {errors.city && <p className="text-[11px] text-[var(--error)] mt-0.5">{errors.city}</p>}
            </div>

            {/* Local Area / Neighborhood */}
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                Local Area / Neighborhood
              </label>
              {availableLocalAreas && availableLocalAreas.length > 0 ? (
                <select
                  value={locationData.localArea}
                  onChange={(e) => handleLocalAreaChange(e.target.value)}
                  className="w-full bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-primary)] rounded-xl px-3 py-2 text-xs sm:text-sm font-medium focus:outline-none focus:ring-1 focus:ring-[var(--button-primary)] cursor-pointer"
                >
                  {availableLocalAreas.map(la => (
                    <option key={la.slug || la.name} value={la.name}>
                      {la.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  placeholder="e.g. Central Area"
                  value={locationData.localArea}
                  onChange={(e) => handleLocalAreaChange(e.target.value)}
                  className="w-full bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-primary)] rounded-xl px-3 py-2 text-xs sm:text-sm font-medium focus:outline-none focus:ring-1 focus:ring-[var(--button-primary)]"
                />
              )}
            </div>
          </div>
        </div>

        {/* Passwords Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative">
            <Input
              label="Password (min 8 chars)"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              maxLength={128}
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              placeholder="••••••••••••"
              leftIcon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              }
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[42px] text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>

          <Input
            label="Confirm Password"
            name="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            maxLength={128}
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            placeholder="••••••••••••"
            leftIcon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            }
          />
        </div>

        {/* Agree Terms */}
        <div className="pt-1">
          <label className="flex items-start gap-2.5 text-xs text-[var(--text-secondary)] cursor-pointer select-none">
            <input
              name="agreeTerms"
              type="checkbox"
              checked={formData.agreeTerms}
              onChange={handleChange}
              className="mt-0.5 h-4 w-4 rounded border-[var(--border-primary)] text-[var(--button-primary)] focus:ring-[var(--button-primary)] accent-[var(--button-primary)]"
            />
            <span>
              I agree to the <Link to={ROUTES.HOME} className="text-[var(--text-primary)] font-bold hover:underline">Terms of Service</Link> and <Link to={ROUTES.HOME} className="text-[var(--text-primary)] font-bold hover:underline">Privacy Policy</Link>.
            </span>
          </label>
          {errors.agreeTerms && (
            <p className="text-xs text-[var(--error)] font-semibold mt-1">{errors.agreeTerms}</p>
          )}
        </div>

        {/* Submit Button */}
        <Button 
          type="submit" 
          variant="primary"
          size="lg"
          className="w-full text-sm sm:text-base font-bold rounded-xl shadow-md py-3.5 mt-1" 
          disabled={isSubmitting}
        >
          {isSubmitting 
            ? 'Creating Account...' 
            : role === 'SELLER'
              ? `Register as ${activeCategoryMeta.shortName}`
              : 'Register as Buyer'}
        </Button>

        {/* Bottom Switch to Sign In */}
        <div className="pt-3 text-center text-xs sm:text-sm text-[var(--text-secondary)] border-t border-[var(--border-subtle)]">
          Already have an account?{' '}
          <Link 
            to={`${ROUTES.AUTH.LOGIN}?role=${role}${role === 'SELLER' ? `&category=${selectedCategory}` : ''}`} 
            className="font-bold text-[var(--accent)] hover:underline"
          >
            Sign In &rarr;
          </Link>
        </div>
      </form>
    </div>
  );
};

export default Register;
