import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/api/auth.service';
import { useToast } from '../../hooks/useToast';
import { Link } from 'react-router-dom';

export function Profile() {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();

  const userRole = (user?.role || 'BUYER').toUpperCase();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    country: 'India',
    region: '',
    city: '',
    localArea: '',
    bio: '',
    profilePhoto: '',
    // Seller specific
    businessName: '',
    // Buyer specific shipping address
    shippingFullName: '',
    shippingPhone: '',
    shippingStreet: '',
    shippingCity: '',
    shippingRegion: '',
    shippingCountry: 'India',
    shippingPostalCode: ''
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        country: user.location?.country || 'India',
        region: user.location?.region || '',
        city: user.location?.city || '',
        localArea: user.location?.localArea || '',
        bio: user.bio || '',
        profilePhoto: user.profilePhoto || '',
        businessName: user.social?.website || '',
        shippingFullName: user.shippingAddress?.fullName || user.name || '',
        shippingPhone: user.shippingAddress?.phone || user.phone || '',
        shippingStreet: user.shippingAddress?.street || '',
        shippingCity: user.shippingAddress?.city || user.location?.city || '',
        shippingRegion: user.shippingAddress?.region || user.location?.region || '',
        shippingCountry: user.shippingAddress?.country || user.location?.country || 'India',
        shippingPostalCode: user.shippingAddress?.postalCode || ''
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        bio: formData.bio.trim(),
        profilePhoto: formData.profilePhoto.trim(),
        location: {
          country: formData.country.trim(),
          region: formData.region.trim(),
          city: formData.city.trim(),
          localArea: formData.localArea.trim()
        },
        social: {
          website: formData.businessName.trim()
        },
        shippingAddress: {
          fullName: formData.shippingFullName.trim(),
          phone: formData.shippingPhone.trim(),
          street: formData.shippingStreet.trim(),
          city: formData.shippingCity.trim(),
          region: formData.shippingRegion.trim(),
          country: formData.shippingCountry.trim(),
          postalCode: formData.shippingPostalCode.trim()
        }
      };

      const response = await authService.updateProfile(payload);
      const updatedData = response?.data || response || { ...user, ...payload };
      
      if (updateUser) {
        updateUser(updatedData);
      }

      showToast('success', 'Profile information updated successfully!');
    } catch (err) {
      showToast('error', err.message || 'Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  const getRoleBadge = () => {
    switch (userRole) {
      case 'ADMIN':
        return <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-full font-black text-xs uppercase tracking-wider">System Administrator</span>;
      case 'SELLER':
        return <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full font-black text-xs uppercase tracking-wider">Verified Merchant</span>;
      default:
        return <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full font-black text-xs uppercase tracking-wider">Marketplace Buyer</span>;
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-8 text-[var(--text-primary)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border-subtle)]">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link 
              to={userRole === 'ADMIN' ? '/admin/dashboard' : userRole === 'SELLER' ? '/seller/dashboard' : '/buyer/dashboard'} 
              className="text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              &larr; {userRole === 'ADMIN' ? 'Admin Hub' : userRole === 'SELLER' ? 'Seller Hub' : 'Buyer Hub'}
            </Link>
            <span className="text-xs text-[var(--text-muted)]">/</span>
            <span className="text-xs font-bold text-[var(--accent)]">Public Profile</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
            Account & Public Profile
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Personal identity, verified badges, contact info, and role-specific details.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {getRoleBadge()}
        </div>
      </div>

      {/* Main Profile Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Profile Card & Avatar */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <h3 className="text-base font-bold text-[var(--text-primary)] pb-3 border-b border-[var(--border-subtle)]">
            Identity & Avatar
          </h3>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="w-24 h-24 rounded-3xl bg-[var(--bg-secondary)] border-2 border-[var(--border-primary)] overflow-hidden flex items-center justify-center shrink-0 shadow-sm relative group">
              {formData.profilePhoto ? (
                <img src={formData.profilePhoto} alt={formData.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl font-black text-[var(--accent)] uppercase">{formData.name?.charAt(0) || 'U'}</span>
              )}
            </div>

            <div className="space-y-2 flex-1 text-center sm:text-left w-full">
              <label className="text-xs font-bold text-[var(--text-secondary)] block">
                Avatar Photo URL
              </label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/photo-..."
                value={formData.profilePhoto}
                onChange={(e) => setFormData(prev => ({ ...prev, profilePhoto: e.target.value }))}
                className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl text-sm font-medium text-[var(--text-primary)] focus:outline-none focus:border-[var(--button-primary)] transition-colors"
              />
              <p className="text-[11px] text-[var(--text-muted)]">
                Provide a direct HTTPS link to a portrait image for your marketplace presence.
              </p>
            </div>
          </div>
        </div>

        {/* Basic Personal Information */}
        <div className="bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <h3 className="text-base font-bold text-[var(--text-primary)] pb-3 border-b border-[var(--border-subtle)]">
            Personal & Contact Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--text-secondary)] block">
                Full Legal Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl text-sm font-medium text-[var(--text-primary)] focus:outline-none focus:border-[var(--button-primary)] transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[var(--text-secondary)] block">
                  Registered Email Address
                </label>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">Verified</span>
              </div>
              <input
                type="email"
                disabled
                value={formData.email}
                className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl text-sm font-medium text-[var(--text-muted)] opacity-70 cursor-not-allowed"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--text-secondary)] block">
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl text-sm font-medium text-[var(--text-primary)] focus:outline-none focus:border-[var(--button-primary)] transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--text-secondary)] block">
                Country
              </label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl text-sm font-medium text-[var(--text-primary)] focus:outline-none focus:border-[var(--button-primary)] transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--text-secondary)] block">
                State / Region
              </label>
              <input
                type="text"
                placeholder="Karnataka"
                value={formData.region}
                onChange={(e) => setFormData(prev => ({ ...prev, region: e.target.value }))}
                className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl text-sm font-medium text-[var(--text-primary)] focus:outline-none focus:border-[var(--button-primary)] transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--text-secondary)] block">
                City / Town
              </label>
              <input
                type="text"
                placeholder="Bengaluru"
                value={formData.city}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl text-sm font-medium text-[var(--text-primary)] focus:outline-none focus:border-[var(--button-primary)] transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[var(--text-secondary)] block">
              Bio / About You
            </label>
            <textarea
              rows="3"
              placeholder="Share a short introduction about yourself or your trading background..."
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl text-sm font-medium text-[var(--text-primary)] focus:outline-none focus:border-[var(--button-primary)] transition-colors"
            />
          </div>
        </div>

        {/* ROLE SPECIFIC SECTIONS */}
        {userRole === 'SELLER' && (
          <div className="bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <h3 className="text-base font-bold text-emerald-400 pb-3 border-b border-[var(--border-subtle)] flex items-center gap-2">
              <span>🏪</span> <span>Merchant & Business Details</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-secondary)] block">
                  Store / Agency Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Prestige Properties & Motors"
                  value={formData.businessName}
                  onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
                  className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl text-sm font-medium text-[var(--text-primary)] focus:outline-none focus:border-[var(--button-primary)] transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-secondary)] block">
                  Seller Verification Level
                </label>
                <div className="px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl flex items-center justify-between">
                  <span className="text-sm font-bold text-[var(--text-primary)]">
                    {user?.verificationStatus === 'VERIFIED' ? 'Verified Government Merchant' : 'Verification In Progress'}
                  </span>
                  <span className="text-xs font-black text-emerald-400">✓ Tier 1</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {userRole === 'BUYER' && (
          <div className="bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <h3 className="text-base font-bold text-blue-400 pb-3 border-b border-[var(--border-subtle)] flex items-center gap-2">
              <span>📦</span> <span>Default Shipping & Delivery Address</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-secondary)] block">
                  Recipient Name
                </label>
                <input
                  type="text"
                  value={formData.shippingFullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, shippingFullName: e.target.value }))}
                  className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl text-sm font-medium text-[var(--text-primary)] focus:outline-none focus:border-[var(--button-primary)] transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-secondary)] block">
                  Delivery Phone
                </label>
                <input
                  type="tel"
                  value={formData.shippingPhone}
                  onChange={(e) => setFormData(prev => ({ ...prev, shippingPhone: e.target.value }))}
                  className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl text-sm font-medium text-[var(--text-primary)] focus:outline-none focus:border-[var(--button-primary)] transition-colors"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-secondary)] block">
                  Street Address
                </label>
                <input
                  type="text"
                  placeholder="Apartment, building, street number"
                  value={formData.shippingStreet}
                  onChange={(e) => setFormData(prev => ({ ...prev, shippingStreet: e.target.value }))}
                  className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl text-sm font-medium text-[var(--text-primary)] focus:outline-none focus:border-[var(--button-primary)] transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-secondary)] block">
                  City
                </label>
                <input
                  type="text"
                  value={formData.shippingCity}
                  onChange={(e) => setFormData(prev => ({ ...prev, shippingCity: e.target.value }))}
                  className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl text-sm font-medium text-[var(--text-primary)] focus:outline-none focus:border-[var(--button-primary)] transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-secondary)] block">
                  Postal / ZIP Code
                </label>
                <input
                  type="text"
                  placeholder="560038"
                  value={formData.shippingPostalCode}
                  onChange={(e) => setFormData(prev => ({ ...prev, shippingPostalCode: e.target.value }))}
                  className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl text-sm font-medium text-[var(--text-primary)] focus:outline-none focus:border-[var(--button-primary)] transition-colors"
                />
              </div>
            </div>
          </div>
        )}

        {/* Submit Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[var(--border-subtle)]">
          <p className="text-xs text-[var(--text-secondary)]">
            Changes will be saved directly to your Velvorax account.
          </p>

          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto px-8 py-3.5 bg-[var(--button-primary)] text-[var(--button-primary-text)] hover:bg-[var(--button-primary-hover)] font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-60 border border-[var(--button-primary)]"
          >
            {submitting ? 'Saving Changes...' : 'Save Profile Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default Profile;
