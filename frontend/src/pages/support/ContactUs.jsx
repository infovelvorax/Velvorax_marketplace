import React, { useState } from 'react';
import { Container, Card, Badge, Button, Input, Textarea } from '../../components';
import { COMPANY } from '../../constants/company';

export function ContactUs() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Inquiry',
    message: '',
  });
  const [status, setStatus] = useState({ submitted: false, loading: false });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setStatus({ submitted: false, loading: true });
    
    // Simulate support ticket submission
    setTimeout(() => {
      setStatus({ submitted: true, loading: false });
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: 'General Inquiry',
        message: '',
      });
    }, 800);
  };

  return (
    <div className="py-10 lg:py-16 min-h-screen bg-[var(--bg-primary)]">
      <Container size="6xl">
        {/* Hero Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <Badge variant="primary" className="mb-3">
            💬 24/7 Support & Inquiries
          </Badge>
          <h1 className="text-3xl lg:text-5xl font-black text-[var(--text-primary)] tracking-tight">
            Help & Contact Support
          </h1>
          <p className="mt-4 text-base lg:text-lg text-[var(--text-secondary)] leading-relaxed">
            Have questions about buying, selling, posting a listing, or safety on Velvorax? Our team is always ready to assist you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column: Direct Contact Details & Operations Info (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="p-6 lg:p-8 border-[var(--border-primary)] space-y-6">
              <h2 className="text-xl font-bold text-[var(--text-primary)] pb-2 border-b border-[var(--border-primary)]">
                Direct Contact Channels
              </h2>

              {/* Email */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)] flex items-center justify-center text-[var(--text-primary)] shrink-0 text-lg shadow-2xs">
                  ✉️
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    Official Support Email
                  </h3>
                  <a
                    href={`mailto:${COMPANY.contact.email}`}
                    className="text-base font-semibold text-[var(--accent)] hover:underline break-all mt-0.5 block"
                  >
                    {COMPANY.contact.email}
                  </a>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                    Guaranteed response within 2-4 hours
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)] flex items-center justify-center text-[var(--text-primary)] shrink-0 text-lg shadow-2xs">
                  📞
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    Direct Helpline / WhatsApp
                  </h3>
                  <a
                    href={`tel:${COMPANY.contact.phone.replace(/\s+/g, '')}`}
                    className="text-base font-semibold text-[var(--text-primary)] hover:underline mt-0.5 block"
                  >
                    {COMPANY.contact.phone}
                  </a>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                    Mon - Sat: 9:00 AM – 7:00 PM IST
                  </p>
                </div>
              </div>

              {/* Physical Address & Maps */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)] flex items-center justify-center text-[var(--text-primary)] shrink-0 text-lg shadow-2xs">
                  📍
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                    Registered Headquarters
                  </h3>
                  <p className="text-sm font-medium text-[var(--text-primary)] mt-1 leading-relaxed">
                    {COMPANY.contact.address}
                  </p>
                  <a
                    href={COMPANY.contact.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--accent)] hover:underline mt-2.5"
                  >
                    <span>Open in Google Maps</span>
                    <span>↗</span>
                  </a>
                </div>
              </div>
            </Card>

            {/* Operating Hours Card */}
            <Card className="p-6 border-[var(--border-primary)] bg-[var(--bg-surface)]">
              <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider mb-2">
                ⏰ Support Desk Hours
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-3">
                Our operations & moderation desk operates actively throughout business hours. Urgent safety concerns are monitored 24/7.
              </p>
              <div className="text-xs font-semibold text-[var(--text-primary)] space-y-1">
                <div className="flex justify-between">
                  <span>Monday – Friday:</span>
                  <span>9:00 AM – 7:00 PM IST</span>
                </div>
                <div className="flex justify-between">
                  <span>Saturday:</span>
                  <span>10:00 AM – 5:00 PM IST</span>
                </div>
                <div className="flex justify-between text-[var(--text-muted)]">
                  <span>Sunday:</span>
                  <span>Emergency Safety Only</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column: Interactive Contact Form (7 Cols) */}
          <div className="lg:col-span-7">
            <Card className="p-6 lg:p-8 border-[var(--border-primary)]">
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">
                Send Us a Message
              </h2>
              <p className="text-sm text-[var(--text-secondary)] mb-6">
                Fill out the form below and our support coordinators will follow up promptly.
              </p>

              {status.submitted && (
                <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-sm font-medium flex items-center gap-3">
                  <span className="text-xl">✅</span>
                  <div>
                    <strong className="block font-bold">Message sent successfully!</strong>
                    Thank you for reaching out. We have logged your inquiry and will contact you shortly.
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-[var(--text-secondary)] mb-1">
                      Full Name *
                    </label>
                    <Input
                      name="name"
                      required
                      placeholder="e.g. John Doe"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-[var(--text-secondary)] mb-1">
                      Email Address *
                    </label>
                    <Input
                      name="email"
                      type="email"
                      required
                      placeholder="e.g. john@example.com"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-[var(--text-secondary)] mb-1">
                      Phone Number (Optional)
                    </label>
                    <Input
                      name="phone"
                      placeholder="e.g. +91 9876543210"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-[var(--text-secondary)] mb-1">
                      Topic / Department
                    </label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-primary)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent)]"
                    >
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Seller Merchant Verification">Seller Merchant Verification</option>
                      <option value="Listing Approval / Moderation">Listing Approval / Moderation</option>
                      <option value="Report Scam or Fraud">Report Scam or Fraud</option>
                      <option value="Technical Issue / Bug">Technical Issue / Bug</option>
                      <option value="Commercial Business Partnership">Commercial Business Partnership</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-[var(--text-secondary)] mb-1">
                    Your Message *
                  </label>
                  <Textarea
                    name="message"
                    required
                    rows={5}
                    placeholder="Describe how we can assist you..."
                    value={formData.message}
                    onChange={handleChange}
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full py-3 font-bold"
                  disabled={status.loading}
                >
                  {status.loading ? 'Sending Message...' : 'Send Message Now'}
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </Container>
    </div>
  );
}

export default ContactUs;
