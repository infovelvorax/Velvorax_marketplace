import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Badge } from '../../components';
import { ROUTES } from '../../constants';
import { COMPANY } from '../../constants/company';

export function TermsOfService() {
  const lastUpdated = 'September 8, 2026';

  const sections = [
    {
      title: '1. Acceptance of Terms',
      content:
        'By creating an account, accessing, or using Velvorax Marketplace (the "Platform"), you acknowledge that you have read, understood, and agreed to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.',
    },
    {
      title: '2. Eligibility and User Accounts',
      content:
        'You must be at least 18 years of age or have legal parental/guardian consent to register an account. You are responsible for safeguarding your login credentials and for all activities conducted under your account. You agree to provide true, accurate, and up-to-date information during registration.',
    },
    {
      title: '3. Marketplace Nature & Role of Velvorax',
      content:
        'Velvorax functions as a neutral classifieds and direct trade discovery platform enabling independent sellers, real estate agents, vehicle dealerships, service professionals, and individuals to list goods, services, and properties. Unless explicitly stated, Velvorax is not a party to any contract, negotiation, warranty, or transaction entered into between buyers and sellers.',
    },
    {
      title: '4. User Content & Listing Guidelines',
      content:
        'When publishing listings, images, prices, descriptions, and job postings, you warrant that you hold all necessary ownership rights and legal authorizations. You agree not to post false, misleading, counterfeit, prohibited, or copyrighted materials. We reserve the right to remove or modify any listing without prior notice if it violates our platform policies.',
    },
    {
      title: '5. Prohibited Items and Unlawful Conduct',
      content:
        'The listing of illicit substances, unlicensed firearms, stolen property, fraudulent financial schemes, counterfeit documents, adult services, and endangered wildlife products is strictly prohibited. Engaging in spam, harassment, automated scraping, or payment fraud will result in immediate termination of account access and referral to law enforcement.',
    },
    {
      title: '6. Fees, Commissions, and Payments',
      content:
        'Standard browsing, searching, and standard basic listings are free of charge. Any optional premium featured listing fees, merchant subscription tiers, or verified badge upgrades will be clearly communicated before purchase. All fee payments are final and non-refundable unless required by applicable law.',
    },
    {
      title: '7. Limitation of Liability',
      content:
        'To the maximum extent permitted by applicable law, Velvorax, its founders, affiliates, and employees shall not be liable for any indirect, incidental, punitive, or consequential damages resulting from user conduct, item defects, unfulfilled agreements, financial losses, or platform downtime.',
    },
    {
      title: '8. Dispute Resolution and Governing Jurisdiction',
      content:
        'Any disputes arising from or in connection with these Terms shall be governed by and construed in accordance with the laws of Telangana, India. The courts of Hyderabad, Telangana shall have exclusive jurisdiction over any legal proceedings.',
    },
  ];

  return (
    <div className="py-10 lg:py-16 min-h-screen bg-[var(--bg-primary)]">
      <Container size="4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-3">
            Legal & Governance
          </Badge>
          <h1 className="text-3xl lg:text-5xl font-black text-[var(--text-primary)] tracking-tight">
            Terms of Service
          </h1>
          <p className="mt-3 text-sm text-[var(--text-muted)] font-medium">
            Last Updated: {lastUpdated} • Effective for all global users
          </p>
        </div>

        {/* Introduction Card */}
        <div className="p-6 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] mb-10 text-[var(--text-secondary)] text-sm lg:text-base leading-relaxed">
          Welcome to <strong className="text-[var(--text-primary)]">{COMPANY.name}</strong>. Please review these terms carefully as they govern your relationship with our services, mobile applications, and APIs. For questions concerning these terms, contact us at{' '}
          <a href={`mailto:${COMPANY.contact.email}`} className="text-[var(--accent)] font-semibold hover:underline">
            {COMPANY.contact.email}
          </a>.
        </div>

        {/* Terms Sections */}
        <div className="space-y-8 mb-12">
          {sections.map((section, idx) => (
            <div
              key={idx}
              className="p-6 lg:p-8 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-primary)]"
            >
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">
                {section.title}
              </h2>
              <p className="text-sm lg:text-[15px] text-[var(--text-secondary)] leading-relaxed">
                {section.content}
              </p>
            </div>
          ))}
        </div>

        {/* Contact info block */}
        <div className="p-8 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-primary)] text-center">
          <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">
            Questions Regarding Our Terms?
          </h3>
          <p className="text-sm text-[var(--text-secondary)] mb-4">
            Contact our legal compliance team at {COMPANY.contact.address} or reach out online.
          </p>
          <div className="flex justify-center gap-4 text-sm font-semibold">
            <Link
              to={ROUTES.CONTACT}
              className="px-5 py-2.5 rounded-lg bg-[var(--accent)] text-white hover:opacity-90 transition-opacity"
            >
              Contact Support
            </Link>
            <Link
              to={ROUTES.PRIVACY}
              className="px-5 py-2.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-primary)] hover:border-[var(--accent)] transition-colors"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}

export default TermsOfService;
