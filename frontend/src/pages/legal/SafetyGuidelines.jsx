import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Card, Badge, Button } from '../../components';
import { ROUTES } from '../../constants';
import { COMPANY } from '../../constants/company';

export function SafetyGuidelines() {
  const safetyTips = [
    {
      icon: '🤝',
      title: 'Meet in Public, Safe Locations',
      description: 'When buying or selling in-person, always choose well-lit, public areas such as shopping malls, coffee shops, or metro stations during daylight hours.',
    },
    {
      icon: '🔍',
      title: 'Inspect Items Before Payment',
      description: 'Never send advance wire transfers or upfront deposits before personally inspecting the item, testing functionality, and verifying ownership documents.',
    },
    {
      icon: '🛡️',
      title: 'Protect Your Personal Info',
      description: 'Never share OTPs, banking passwords, debit/credit card CVVs, or sensitive government credentials with anyone claiming to represent Velvorax.',
    },
    {
      icon: '🚗',
      title: 'Vehicle & Property Verification',
      description: 'For vehicles, check the RC, chassis number, and insurance validity. For properties, inspect title deeds, RERA registrations, and encumbrance certificates in person.',
    },
    {
      icon: '💬',
      title: 'Use In-App Messaging',
      description: 'Keep your early communications within our secure marketplace chat system to maintain a verifiable record of transactions and inquiries.',
    },
    {
      icon: '🚫',
      title: 'Beware of Unrealistic Deals',
      description: 'If a high-value car, property, or iPhone is listed significantly below standard market rates with urgent sob stories, it is likely a scam. Exercise caution.',
    },
  ];

  const faqs = [
    {
      q: 'Does Velvorax offer an escrow or direct payment holding service?',
      a: 'Velvorax operates as an open global marketplace connecting verified buyers and sellers directly. We do not hold physical items or direct escrow payments for offline classifieds. Always inspect before transferring funds.',
    },
    {
      q: 'How do I report a suspicious or fraudulent listing?',
      a: 'You can report any listing directly using the "Report Listing" button on any product/property page, or reach out immediately to our trust & safety team at support@velvorax.tech.',
    },
    {
      q: 'What should I do if a buyer asks to scan a QR code to receive money?',
      a: 'NEVER scan a QR code or enter your UPI PIN to receive money. Scanning a QR code or typing your PIN will DEDUCT money from your account, never deposit.',
    },
  ];

  return (
    <div className="py-10 lg:py-16 min-h-screen bg-[var(--bg-primary)]">
      <Container size="5xl">
        {/* Header Hero */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <Badge variant="primary" className="mb-3">
            🛡️ Trust & Safety Center
          </Badge>
          <h1 className="text-3xl lg:text-5xl font-black text-[var(--text-primary)] tracking-tight">
            Velvorax Safety & Security Guidelines
          </h1>
          <p className="mt-4 text-base lg:text-lg text-[var(--text-secondary)] leading-relaxed">
            Your safety and confidence are our highest priorities. Learn how to trade securely, avoid scams, and protect your transactions on Velvorax Marketplace.
          </p>
        </div>

        {/* Core Principles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-14">
          {safetyTips.map((tip, idx) => (
            <Card key={idx} className="p-6 flex flex-col justify-between hover:shadow-lg transition-all duration-200 border-[var(--border-primary)]">
              <div>
                <span className="text-4xl block mb-4">{tip.icon}</span>
                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">
                  {tip.title}
                </h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  {tip.description}
                </p>
              </div>
            </Card>
          ))}
        </div>

        {/* Safety Protocol Banner */}
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl p-8 lg:p-10 mb-14">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-3">
                Spotting Red Flags & Fraudulent Tactics
              </h2>
              <ul className="space-y-2 text-sm text-[var(--text-secondary)] list-disc pl-5">
                <li>Requests for advance courier/delivery charges before viewing the item</li>
                <li>Fake payment receipts or SMS spoofing claiming money has been credited</li>
                <li>Refusal to talk over the phone or meet in safe public locations</li>
                <li>Over-seas sellers claiming they cannot meet due to emergency military deployment</li>
              </ul>
            </div>
            <div className="shrink-0 flex flex-col gap-3">
              <a href={`mailto:${COMPANY.contact.email}`}>
                <Button variant="primary" className="w-full">
                  Report Suspicious User
                </Button>
              </a>
              <Link to={ROUTES.CONTACT}>
                <Button variant="outline" className="w-full">
                  Contact Trust Team
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* FAQs */}
        <div className="mb-14">
          <h2 className="text-2xl font-bold text-[var(--text-primary)] text-center mb-8">
            Frequently Asked Safety Questions
          </h2>
          <div className="space-y-4 max-w-3xl mx-auto">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="p-5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)]"
              >
                <h4 className="font-bold text-base text-[var(--text-primary)] mb-2">
                  {faq.q}
                </h4>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Official Contact Footer Box */}
        <div className="text-center p-8 bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-2xl">
          <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">
            Need Immediate Assistance or Security Support?
          </h3>
          <p className="text-sm text-[var(--text-secondary)] mb-4">
            Our 24/7 moderation and trust desk is here to help you resolve any issues.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm font-semibold">
            <a
              href={`mailto:${COMPANY.contact.email}`}
              className="px-4 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-primary)] hover:border-[var(--accent)] text-[var(--text-primary)] transition-colors"
            >
              ✉️ {COMPANY.contact.email}
            </a>
            <a
              href={`tel:${COMPANY.contact.phone.replace(/\s+/g, '')}`}
              className="px-4 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-primary)] hover:border-[var(--accent)] text-[var(--text-primary)] transition-colors"
            >
              📞 {COMPANY.contact.phone}
            </a>
          </div>
        </div>
      </Container>
    </div>
  );
}

export default SafetyGuidelines;
