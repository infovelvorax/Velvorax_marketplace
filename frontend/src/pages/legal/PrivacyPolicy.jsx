import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Badge } from '../../components';
import { ROUTES } from '../../constants';
import { COMPANY } from '../../constants/company';

export function PrivacyPolicy() {
  const lastUpdated = 'September 8, 2026';

  const policySections = [
    {
      title: '1. Information We Collect',
      items: [
        'Personal Details: Name, email address, contact phone number, and physical business/delivery location.',
        'Account Credentials: Passwords, OTP authentication logs, and role permissions (Buyer, Seller, Admin).',
        'Marketplace Data: Listings posted, price inquiries, bookmarks, order history, and chat messages.',
        'Technical & Device Data: IP address, device model, operating system, browser type, and location coordinates when permitted.',
      ],
    },
    {
      title: '2. How We Use Your Information',
      items: [
        'To facilitate direct communication, order inquiries, and transaction fulfillment between buyers and sellers.',
        'To maintain trust, verify seller merchant credentials, and prevent platform fraud or spam.',
        'To customize search results, sector recommendations, and regional marketplace suggestions.',
        'To comply with legal obligations, enforce our Terms of Service, and resolve customer support inquiries.',
      ],
    },
    {
      title: '3. Data Sharing & Disclosure',
      items: [
        'Direct Merchant Contact: When you submit an inquiry on a listing or request seller details, your provided contact details are shared with the merchant.',
        'Service Providers: We use secure cloud hosting, transactional email delivery, and SMS verification infrastructure partners who adhere to strict confidentiality.',
        'No Unauthorized Resale: We NEVER sell, rent, or trade your personal contact records to third-party telemarketing companies.',
      ],
    },
    {
      title: '4. User Rights & Data Control',
      items: [
        'Access & Export: You can view and update your profile information anytime via your account settings.',
        'Account Deletion: You can request complete erasure of your listings and personal account by contacting privacy@velvorax.tech.',
        'Communication Preferences: You can opt-in or opt-out of promotional email notifications directly in your settings.',
      ],
    },
    {
      title: '5. Data Security & Storage',
      items: [
        'All communications and authentication tokens are encrypted using industry-standard TLS/SSL protocols.',
        'Sensitive account passwords are encrypted using salted one-way hashing algorithms (bcrypt).',
        'Regular vulnerability scans and access control audits are conducted to safeguard user data.',
      ],
    },
  ];

  return (
    <div className="py-10 lg:py-16 min-h-screen bg-[var(--bg-primary)]">
      <Container size="4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="primary" className="mb-3">
            Privacy & Data Protection
          </Badge>
          <h1 className="text-3xl lg:text-5xl font-black text-[var(--text-primary)] tracking-tight">
            Privacy Policy
          </h1>
          <p className="mt-3 text-sm text-[var(--text-muted)] font-medium">
            Last Updated: {lastUpdated} • Compliant with Indian DPDP Act & Global Privacy Standards
          </p>
        </div>

        {/* Introduction */}
        <div className="p-6 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] mb-10 text-[var(--text-secondary)] text-sm lg:text-base leading-relaxed">
          At <strong className="text-[var(--text-primary)]">{COMPANY.name}</strong>, we respect your right to privacy and are committed to ensuring transparency in how we collect, store, and utilize your personal data across all our marketplace channels.
        </div>

        {/* Policy Sections */}
        <div className="space-y-8 mb-12">
          {policySections.map((section, idx) => (
            <div
              key={idx}
              className="p-6 lg:p-8 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-primary)]"
            >
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">
                {section.title}
              </h2>
              <ul className="space-y-2.5 text-sm lg:text-[15px] text-[var(--text-secondary)] list-disc pl-5">
                {section.items.map((item, iIdx) => (
                  <li key={iIdx} className="leading-relaxed">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Data Protection Officer Contact */}
        <div className="p-8 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-primary)] text-center">
          <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">
            Contact Our Data Protection Officer
          </h3>
          <p className="text-sm text-[var(--text-secondary)] mb-4 max-w-xl mx-auto">
            If you have questions about your privacy rights or wish to exercise data subject rights, contact us at:
          </p>
          <div className="inline-flex flex-col items-center gap-1.5 p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-sm mb-6">
            <span className="font-bold text-[var(--text-primary)]">Velvorax Data Grievance Desk</span>
            <span className="text-[var(--text-secondary)]">{COMPANY.contact.address}</span>
            <a href={`mailto:${COMPANY.contact.email}`} className="text-[var(--accent)] font-bold hover:underline">
              {COMPANY.contact.email}
            </a>
          </div>
          <div className="flex justify-center gap-4 text-sm font-semibold">
            <Link
              to={ROUTES.TERMS}
              className="px-5 py-2.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-primary)] hover:border-[var(--accent)] transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              to={ROUTES.COOKIES}
              className="px-5 py-2.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-primary)] hover:border-[var(--accent)] transition-colors"
            >
              Cookie Policy
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}

export default PrivacyPolicy;
