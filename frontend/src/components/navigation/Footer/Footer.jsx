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
  contact = COMPANY.contact,
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
        { label: 'Safety Guidelines', href: ROUTES.SAFETY },
        { label: 'Help & Contact Support', href: ROUTES.CONTACT },
        { label: 'Terms of Service', href: ROUTES.TERMS },
        { label: 'Privacy Policy', href: ROUTES.PRIVACY },
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

              {/* Contact Information (footerContact) */}
              <div id="footerContact" className="footerContact flex flex-col gap-2.5 pt-1 text-sm text-[var(--text-secondary)]">
                <a
                  href={`mailto:${contact.email}`}
                  className="inline-flex items-center gap-2.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors group"
                >
                  <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-primary)] text-[var(--text-primary)] group-hover:border-[var(--accent)] group-hover:text-[var(--accent)] transition-colors shrink-0 shadow-2xs">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </span>
                  <span className="font-medium hover:underline break-all">{contact.email}</span>
                </a>

                <a
                  href={`tel:${contact.phone.replace(/\s+/g, '')}`}
                  className="inline-flex items-center gap-2.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors group"
                >
                  <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-primary)] text-[var(--text-primary)] group-hover:border-[var(--accent)] group-hover:text-[var(--accent)] transition-colors shrink-0 shadow-2xs">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </span>
                  <span className="font-medium hover:underline">{contact.phone}</span>
                </a>

                <a
                  href={contact.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-start gap-2.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors group leading-snug"
                >
                  <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-primary)] text-[var(--text-primary)] group-hover:border-[var(--accent)] group-hover:text-[var(--accent)] transition-colors shrink-0 mt-0.5 shadow-2xs">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </span>
                  <span className="font-medium hover:underline text-[13px]">{contact.address}</span>
                </a>
              </div>
              
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
              <Link to={ROUTES.PRIVACY} className="hover:text-[var(--text-primary)] transition-colors">
                Privacy Policy
              </Link>
              <Link to={ROUTES.TERMS} className="hover:text-[var(--text-primary)] transition-colors">
                Terms of Service
              </Link>
              <Link to={ROUTES.COOKIES} className="hover:text-[var(--text-primary)] transition-colors">
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
