import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import { authService } from '../../services/api/auth.service';
import { useToast } from '../../hooks/useToast';
import { Link } from 'react-router-dom';

export function Settings() {
  const { user, updateUser } = useAuth();
  const { theme, toggleTheme, setTheme } = useTheme();
  const { showToast } = useToast();

  const userRole = (user?.role || 'BUYER').toUpperCase();

  // Active Tab: 'security' | 'notifications' | 'preferences' | 'privacy'
  const [activeTab, setActiveTab] = useState('security');

  // Security - Change Password State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Preferences & Notifications State
  const [preferences, setPreferences] = useState({
    theme: 'dark',
    currency: 'INR',
    language: 'en',
    emailNotifications: true,
    orderUpdates: true,
    chatAlerts: true,
    marketingEmails: false,
    profileVisibility: 'PUBLIC',
    showOnlineStatus: true,
    twoFactorAuth: false
  });
  const [savingPreferences, setSavingPreferences] = useState(false);

  useEffect(() => {
    if (user?.preferences) {
      setPreferences(prev => ({
        ...prev,
        ...user.preferences
      }));
    }
  }, [user]);

  // Handle Password Change
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      showToast('error', 'Please fill in all password fields.');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      showToast('error', 'New password must be at least 8 characters long.');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast('error', 'New passwords do not match.');
      return;
    }

    setPasswordLoading(true);
    try {
      await authService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });

      showToast('success', 'Password updated successfully! Keep it safe.');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      showToast('error', err.message || 'Failed to update password');
    } finally {
      setPasswordLoading(false);
    }
  };

  // Handle Preferences Save
  const handleSavePreferences = async () => {
    setSavingPreferences(true);
    try {
      const response = await authService.updateProfile({ preferences });
      const updatedData = response?.data || response || { ...user, preferences };

      if (updateUser) {
        updateUser(updatedData);
      }

      showToast('success', 'Account preferences updated successfully!');
    } catch (err) {
      showToast('error', err.message || 'Failed to save preferences');
    } finally {
      setSavingPreferences(false);
    }
  };

  const handleToggle = (key) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
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
            <span className="text-xs font-bold text-indigo-400">Account Settings</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
            Account Preferences & Security
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Configure password security, notification channels, theme settings, and privacy controls.
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'security'
              ? 'bg-[var(--button-primary)] text-[var(--button-primary-text)] shadow-xs'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
          }`}
        >
          🔒 Security & Password
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'notifications'
              ? 'bg-[var(--button-primary)] text-[var(--button-primary-text)] shadow-xs'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
          }`}
        >
          🔔 Notifications
        </button>

        <button
          onClick={() => setActiveTab('preferences')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'preferences'
              ? 'bg-[var(--button-primary)] text-[var(--button-primary-text)] shadow-xs'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
          }`}
        >
          🎨 Display & Preferences
        </button>

        <button
          onClick={() => setActiveTab('privacy')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'privacy'
              ? 'bg-[var(--button-primary)] text-[var(--button-primary-text)] shadow-xs'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
          }`}
        >
          🛡️ Privacy & Visibility
        </button>
      </div>

      {/* TAB 1: SECURITY & PASSWORD */}
      {activeTab === 'security' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Change Password Card */}
          <div className="bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="pb-4 border-b border-[var(--border-subtle)]">
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                Change Account Password
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Ensure your account is protected with a strong, distinct password.
              </p>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-xl">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-secondary)] block">
                  Current Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm(p => ({ ...p, currentPassword: e.target.value }))}
                  className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl text-sm font-medium text-[var(--text-primary)] focus:outline-none focus:border-[var(--button-primary)] transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-secondary)] block">
                  New Password (Minimum 8 characters)
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm(p => ({ ...p, newPassword: e.target.value }))}
                  className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl text-sm font-medium text-[var(--text-primary)] focus:outline-none focus:border-[var(--button-primary)] transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-secondary)] block">
                  Confirm New Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm(p => ({ ...p, confirmPassword: e.target.value }))}
                  className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl text-sm font-medium text-[var(--text-primary)] focus:outline-none focus:border-[var(--button-primary)] transition-colors"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="toggle-password"
                  checked={showPassword}
                  onChange={() => setShowPassword(!showPassword)}
                  className="rounded text-[var(--accent)] cursor-pointer"
                />
                <label htmlFor="toggle-password" className="text-xs font-bold text-[var(--text-secondary)] cursor-pointer">
                  Show passwords
                </label>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="px-6 py-3 bg-[var(--button-primary)] text-[var(--button-primary-text)] hover:bg-[var(--button-primary-hover)] font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-60 border border-[var(--button-primary)]"
                >
                  {passwordLoading ? 'Updating Password...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>

          {/* 2FA & Session Security Card */}
          <div className="bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="pb-4 border-b border-[var(--border-subtle)]">
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                Authentication & Sessions
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Multi-factor protection and active login information.
              </p>
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <h4 className="text-sm font-bold text-[var(--text-primary)]">Two-Factor Authentication (2FA)</h4>
                <p className="text-xs text-[var(--text-secondary)]">Require an email OTP whenever logging in from a new device.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  handleToggle('twoFactorAuth');
                  showToast('info', 'Two-Factor Authentication setting toggled.');
                }}
                className={`${preferences.twoFactorAuth ? 'bg-emerald-600' : 'bg-[var(--border-primary)]'} relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out`}
              >
                <span className={`${preferences.twoFactorAuth ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-xs transition duration-200`} />
              </button>
            </div>

            <div className="pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-secondary)]">
              <span>Active Session: Current Browser (JWT Verified)</span>
              <span className="font-mono text-emerald-400 font-bold">● Active</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: NOTIFICATIONS */}
      {activeTab === 'notifications' && (
        <div className="bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6 animate-fadeIn">
          <div className="pb-4 border-b border-[var(--border-subtle)]">
            <h3 className="text-base font-bold text-[var(--text-primary)]">
              Notification Preferences
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Control what marketplace activities send you email or in-app alerts.
            </p>
          </div>

          <div className="space-y-6 divide-y divide-[var(--border-subtle)]">
            <div className="flex items-center justify-between pt-2">
              <div>
                <h4 className="text-sm font-bold text-[var(--text-primary)]">Order & Purchase Updates</h4>
                <p className="text-xs text-[var(--text-secondary)]">Instant alerts when an order is placed, shipped, or delivered.</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('orderUpdates')}
                className={`${preferences.orderUpdates ? 'bg-emerald-600' : 'bg-[var(--border-primary)]'} relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200`}
              >
                <span className={`${preferences.orderUpdates ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-xs transition duration-200`} />
              </button>
            </div>

            <div className="flex items-center justify-between pt-4">
              <div>
                <h4 className="text-sm font-bold text-[var(--text-primary)]">Chat & Inquiry Messages</h4>
                <p className="text-xs text-[var(--text-secondary)]">Receive notifications when a buyer or seller sends you a direct message.</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('chatAlerts')}
                className={`${preferences.chatAlerts ? 'bg-emerald-600' : 'bg-[var(--border-primary)]'} relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200`}
              >
                <span className={`${preferences.chatAlerts ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-xs transition duration-200`} />
              </button>
            </div>

            <div className="flex items-center justify-between pt-4">
              <div>
                <h4 className="text-sm font-bold text-[var(--text-primary)]">Email Activity Digest</h4>
                <p className="text-xs text-[var(--text-secondary)]">Weekly summary of saved properties, price drops, and inquiries.</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('emailNotifications')}
                className={`${preferences.emailNotifications ? 'bg-emerald-600' : 'bg-[var(--border-primary)]'} relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200`}
              >
                <span className={`${preferences.emailNotifications ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-xs transition duration-200`} />
              </button>
            </div>

            <div className="flex items-center justify-between pt-4">
              <div>
                <h4 className="text-sm font-bold text-[var(--text-primary)]">Marketplace News & Deals</h4>
                <p className="text-xs text-[var(--text-secondary)]">Promotional announcements, feature launches, and exclusive offers.</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('marketingEmails')}
                className={`${preferences.marketingEmails ? 'bg-emerald-600' : 'bg-[var(--border-primary)]'} relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200`}
              >
                <span className={`${preferences.marketingEmails ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-xs transition duration-200`} />
              </button>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="button"
              onClick={handleSavePreferences}
              disabled={savingPreferences}
              className="px-6 py-3 bg-[var(--button-primary)] text-[var(--button-primary-text)] hover:bg-[var(--button-primary-hover)] font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-60 border border-[var(--button-primary)]"
            >
              {savingPreferences ? 'Saving...' : 'Save Notification Settings'}
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: DISPLAY & PREFERENCES */}
      {activeTab === 'preferences' && (
        <div className="bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6 animate-fadeIn">
          <div className="pb-4 border-b border-[var(--border-subtle)]">
            <h3 className="text-base font-bold text-[var(--text-primary)]">
              Display & Regional Preferences
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Customize appearance themes, currency formatting, and platform language.
            </p>
          </div>

          <div className="space-y-5 max-w-xl">
            {/* Theme Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[var(--text-secondary)] block">
                Color Theme
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (setTheme) setTheme('dark');
                    else if (theme === 'light') toggleTheme();
                  }}
                  className={`p-4 rounded-2xl border text-center font-bold text-xs transition-all cursor-pointer ${
                    theme === 'dark'
                      ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400 shadow-xs'
                      : 'border-[var(--border-primary)] bg-[var(--bg-secondary)] text-[var(--text-secondary)]'
                  }`}
                >
                  <span className="text-lg block mb-1">🌙</span>
                  <span>Dark Theme</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (setTheme) setTheme('light');
                    else if (theme === 'dark') toggleTheme();
                  }}
                  className={`p-4 rounded-2xl border text-center font-bold text-xs transition-all cursor-pointer ${
                    theme === 'light'
                      ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400 shadow-xs'
                      : 'border-[var(--border-primary)] bg-[var(--bg-secondary)] text-[var(--text-secondary)]'
                  }`}
                >
                  <span className="text-lg block mb-1">☀️</span>
                  <span>Light Theme</span>
                </button>
              </div>
            </div>

            {/* Currency Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--text-secondary)] block">
                Preferred Currency
              </label>
              <select
                value={preferences.currency}
                onChange={(e) => setPreferences(p => ({ ...p, currency: e.target.value }))}
                className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl text-sm font-medium text-[var(--text-primary)] focus:outline-none focus:border-[var(--button-primary)] transition-colors cursor-pointer"
              >
                <option value="INR">INR (₹) - Indian Rupee</option>
                <option value="USD">USD ($) - US Dollar</option>
                <option value="EUR">EUR (€) - Euro</option>
                <option value="AED">AED (AED) - UAE Dirham</option>
                <option value="GBP">GBP (£) - British Pound</option>
              </select>
            </div>

            {/* Language Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--text-secondary)] block">
                Platform Language
              </label>
              <select
                value={preferences.language}
                onChange={(e) => setPreferences(p => ({ ...p, language: e.target.value }))}
                className="w-full px-4 py-3 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl text-sm font-medium text-[var(--text-primary)] focus:outline-none focus:border-[var(--button-primary)] transition-colors cursor-pointer"
              >
                <option value="en">English (Official)</option>
                <option value="hi">हिन्दी (Hindi)</option>
                <option value="ta">தமிழ் (Tamil)</option>
                <option value="te">తెలుగు (Telugu)</option>
                <option value="kn">ಕನ್ನಡ (Kannada)</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="button"
              onClick={handleSavePreferences}
              disabled={savingPreferences}
              className="px-6 py-3 bg-[var(--button-primary)] text-[var(--button-primary-text)] hover:bg-[var(--button-primary-hover)] font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-60 border border-[var(--button-primary)]"
            >
              {savingPreferences ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: PRIVACY & DATA */}
      {activeTab === 'privacy' && (
        <div className="bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6 animate-fadeIn">
          <div className="pb-4 border-b border-[var(--border-subtle)]">
            <h3 className="text-base font-bold text-[var(--text-primary)]">
              Privacy & Marketplace Controls
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Control your visibility to other buyers, sellers, and search engines.
            </p>
          </div>

          <div className="space-y-6 divide-y divide-[var(--border-subtle)]">
            <div className="flex items-center justify-between pt-2">
              <div>
                <h4 className="text-sm font-bold text-[var(--text-primary)]">Profile Visibility</h4>
                <p className="text-xs text-[var(--text-secondary)]">Allow your verified public profile to appear in merchant directories.</p>
              </div>
              <select
                value={preferences.profileVisibility}
                onChange={(e) => setPreferences(p => ({ ...p, profileVisibility: e.target.value }))}
                className="px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl text-xs font-bold text-[var(--text-primary)] focus:outline-none cursor-pointer"
              >
                <option value="PUBLIC">Public</option>
                <option value="MEMBERS_ONLY">Registered Members Only</option>
                <option value="PRIVATE">Private</option>
              </select>
            </div>

            <div className="flex items-center justify-between pt-4">
              <div>
                <h4 className="text-sm font-bold text-[var(--text-primary)]">Online Presence Status</h4>
                <p className="text-xs text-[var(--text-secondary)]">Show a green indicator when you are active to speed up inquiries.</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('showOnlineStatus')}
                className={`${preferences.showOnlineStatus ? 'bg-emerald-600' : 'bg-[var(--border-primary)]'} relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200`}
              >
                <span className={`${preferences.showOnlineStatus ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-xs transition duration-200`} />
              </button>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="button"
              onClick={handleSavePreferences}
              disabled={savingPreferences}
              className="px-6 py-3 bg-[var(--button-primary)] text-[var(--button-primary-text)] hover:bg-[var(--button-primary-hover)] font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-60 border border-[var(--button-primary)]"
            >
              {savingPreferences ? 'Saving...' : 'Save Privacy Settings'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Settings;
