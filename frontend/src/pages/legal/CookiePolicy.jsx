import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Badge, Button, Card } from '../../components';
import { ROUTES } from '../../constants';
import { COMPANY } from '../../constants/company';

export function CookiePolicy() {
  const [preferences, setPreferences] = useState({
    essential: true, // always required
    analytics: true,
    marketing: false,
    preferences: true,
  });
  const [savedToast, setSavedToast] = useState(false);

  const togglePreference = (key) => {
    if (key === 'essential') return;
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  return (
    <div className="py-10 lg:py-16 min-h-screen bg-[var(--bg-primary)]">
      <Container size="4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-3">
            🍪 Cookie Settings & Information
          </Badge>
          <h1 className="text-3xl lg:text-5xl font-black text-[var(--text-primary)] tracking-tight">
            Cookie Policy & Preferences
          </h1>
          <p className="mt-3 text-sm text-[var(--text-muted)] font-medium">
            Learn how we use cookies and manage your consent choices on Velvorax.
          </p>
        </div>

        {/* Info Card */}
        <div className="p-6 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] mb-10 text-[var(--text-secondary)] text-sm lg:text-base leading-relaxed">
          Cookies are small text files stored on your browser when you visit websites. Velvorax Marketplace uses essential cookies to keep you signed in, remember your dark/light theme, and ensure smooth navigation.
        </div>

        {/* Interactive Preferences Panel */}
        <div className="mb-12">
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">
            Manage Your Cookie Preferences
          </h2>
          <div className="space-y-4">
            {/* Essential */}
            <Card className="p-5 flex items-center justify-between border-[var(--border-primary)]">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-base text-[var(--text-primary)]">
                    Strictly Necessary Cookies
                  </h3>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-[var(--bg-surface)] text-[var(--text-muted)] border border-[var(--border-primary)]">
                    Required
                  </span>
                </div>
                <p className="text-xs lg:text-sm text-[var(--text-secondary)]">
                  Required for core platform features such as user authentication, session security, and cart/inquiry saving.
                </p>
              </div>
              <div className="shrink-0 ml-4">
                <input
                  type="checkbox"
                  checked={preferences.essential}
                  disabled
                  className="w-5 h-5 accent-[var(--accent)] cursor-not-allowed opacity-80"
                />
              </div>
            </Card>

            {/* Preferences */}
            <Card className="p-5 flex items-center justify-between border-[var(--border-primary)]">
              <div>
                <h3 className="font-bold text-base text-[var(--text-primary)] mb-1">
                  Personalization & Preferences
                </h3>
                <p className="text-xs lg:text-sm text-[var(--text-secondary)]">
                  Remembers your location filtering, currency display, language choices, and theme preference.
                </p>
              </div>
              <div className="shrink-0 ml-4">
                <input
                  type="checkbox"
                  checked={preferences.preferences}
                  onChange={() => togglePreference('preferences')}
                  className="w-5 h-5 accent-[var(--accent)] cursor-pointer"
                />
              </div>
            </Card>

            {/* Analytics */}
            <Card className="p-5 flex items-center justify-between border-[var(--border-primary)]">
              <div>
                <h3 className="font-bold text-base text-[var(--text-primary)] mb-1">
                  Performance & Analytics Cookies
                </h3>
                <p className="text-xs lg:text-sm text-[var(--text-secondary)]">
                  Helps us understand page response speeds, user traffic volumes, and error monitoring to improve features.
                </p>
              </div>
              <div className="shrink-0 ml-4">
                <input
                  type="checkbox"
                  checked={preferences.analytics}
                  onChange={() => togglePreference('analytics')}
                  className="w-5 h-5 accent-[var(--accent)] cursor-pointer"
                />
              </div>
            </Card>

            {/* Marketing */}
            <Card className="p-5 flex items-center justify-between border-[var(--border-primary)]">
              <div>
                <h3 className="font-bold text-base text-[var(--text-primary)] mb-1">
                  Marketing & Targeted Promotions
                </h3>
                <p className="text-xs lg:text-sm text-[var(--text-secondary)]">
                  Allows relevant sector listings and promoted deals to appear based on your marketplace interests.
                </p>
              </div>
              <div className="shrink-0 ml-4">
                <input
                  type="checkbox"
                  checked={preferences.marketing}
                  onChange={() => togglePreference('marketing')}
                  className="w-5 h-5 accent-[var(--accent)] cursor-pointer"
                />
              </div>
            </Card>
          </div>

          <div className="mt-6 flex items-center justify-between flex-wrap gap-4">
            <Button variant="primary" onClick={handleSave}>
              Save Cookie Preferences
            </Button>
            {savedToast && (
              <span className="text-sm font-semibold text-emerald-500 animate-fade-in flex items-center gap-1.5">
                <span>✓</span> Preferences updated successfully!
              </span>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="p-8 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-primary)] text-center">
          <p className="text-sm text-[var(--text-secondary)] mb-4">
            For more details on data security, read our{' '}
            <Link to={ROUTES.PRIVACY} className="text-[var(--accent)] font-semibold hover:underline">
              Privacy Policy
            </Link>{' '}
            or write to{' '}
            <a href={`mailto:${COMPANY.contact.email}`} className="text-[var(--accent)] font-semibold hover:underline">
              {COMPANY.contact.email}
            </a>.
          </p>
        </div>
      </Container>
    </div>
  );
}

export default CookiePolicy;
