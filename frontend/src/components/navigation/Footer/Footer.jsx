import './Footer.css';
import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../../utils';
import { Container } from '../..';
import { BrandLogo } from '../../common/BrandLogo';
import { ROUTES } from '../../../constants';
import { COMPANY } from '../../../constants/company';

export function Footer({
  brandName = COMPANY.name,
  description = COMPANY.description,
  sections = [
    {
      title: 'Marketplace Sectors',
      links: [
        { label: 'Properties & Rentals', href: ROUTES.PROPERTIES },
        { label: 'Cars & Vehicles', href: ROUTES.VEHICLES },
        { label: 'Mobiles & Electronics', href: ROUTES.PRODUCTS },
        { label: 'Jobs & Careers', href: ROUTES.JOBS },
        { label: 'Local Services', href: ROUTES.SERVICES },
        { label: 'Agriculture & Farmland', href: ROUTES.FARM },
        { label: 'Business Directory', href: ROUTES.BUSINESSES },
        { label: '100% Free Giveaways', href: `${ROUTES.SEARCH}?listingType=free` },
      ],
    },
    {
      title: 'My Account',
      links: [
        { label: 'Dashboard Overview', href: ROUTES.DASHBOARD.ROOT },
        { label: 'My Active Listings', href: '/dashboard/my-listings' },
        { label: 'Saved Wishlist', href: ROUTES.DASHBOARD.FAVORITES },
        { label: 'Direct Messages', href: ROUTES.DASHBOARD.MESSAGES },
        { label: 'Activity Notifications', href: ROUTES.DASHBOARD.NOTIFICATIONS },
      ],
    },
    {
      title: 'Buying & Selling',
      links: [
        { label: 'Post a Listing', href: ROUTES.POST_LISTING },
        { label: 'Commercial Businesses', href: ROUTES.BUSINESSES },
        { label: 'Global Marketplace Search', href: ROUTES.SEARCH },
        { label: 'Browse by Purpose', href: ROUTES.CATEGORIES },
      ],
    },
    {
      title: 'Trust & Security',
      links: [
        { label: 'Safety Guidelines', href: ROUTES.HOME },
        { label: 'Help & Contact Support', href: ROUTES.HOME },
        { label: 'Terms of Service', href: ROUTES.HOME },
        { label: 'Privacy Policy', href: ROUTES.HOME },
      ],
    },
  ],
  copyright,
  className,
}) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={cn('bg-[var(--bg-secondary)] text-[var(--text-primary)] border-t border-[var(--border-primary)] mt-auto transition-colors duration-200', className)}>
      <Container size="7xl">
        <div className="py-14 lg:py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 lg:gap-12">
            {/* Brand Column */}
            <div className="lg:col-span-2 flex flex-col gap-5">
              <Link to={ROUTES.HOME} className="flex items-center gap-3 font-extrabold tracking-tight group select-none">
                <BrandLogo height={44} className="h-[44px] transition-transform group-hover:scale-105" />
                <div className="flex flex-col justify-center">
                  <span className="text-[var(--text-primary)] font-black uppercase tracking-wide text-[20px] leading-none">
                    VELVORAX
                  </span>
                  <span className="text-[var(--text-muted)] uppercase text-[10px] font-bold tracking-widest mt-1 leading-none">
                    MARKETPLACE
                  </span>
                </div>
              </Link>

              <p className="text-[15px] text-[var(--text-secondary)] max-w-sm mt-1 leading-relaxed">
                {description || 'The premier global marketplace for buying, selling, renting, and discovering local opportunities across all categories.'}
              </p>
              
              <div className="pt-2 flex items-center gap-3 text-xs text-[var(--text-muted)]">
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--bg-surface)] text-[var(--text-primary)] font-bold border border-[var(--border-primary)] shadow-2xs">
                  <span>🛡️</span> Verified & Secure Global Trade
                </span>
              </div>
            </div>

            {/* Link Sections */}
            {sections.map((section, idx) => (
              <div key={idx} className="flex flex-col gap-4">
                <h4 className="text-[13px] font-bold uppercase tracking-wider text-[var(--text-primary)]">
                  {section.title}
                </h4>
                <ul className="space-y-3">
                  {section.links.map((link, lIdx) => (
                    <li key={lIdx}>
                      <Link
                        to={link.href}
                        className="text-[14px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom Bar */}
          <div className="mt-14 pt-8 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--text-muted)]">
            <p>
              {copyright || `© ${currentYear} ${brandName}. All rights reserved.`}
            </p>
            <div className="flex items-center space-x-6">
              <Link to={ROUTES.HOME} className="hover:text-[var(--text-primary)] transition-colors">
                Privacy Policy
              </Link>
              <Link to={ROUTES.HOME} className="hover:text-[var(--text-primary)] transition-colors">
                Terms of Service
              </Link>
              <Link to={ROUTES.HOME} className="hover:text-[var(--text-primary)] transition-colors">
                Cookie Preferences
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
}

export default Footer;
