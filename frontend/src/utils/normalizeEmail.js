/**
 * Centralized email normalization utility for Velvorax Marketplace (Frontend)
 *
 * @param {string} rawEmail - The raw input email string.
 * @returns {string} The normalized email address.
 */
export const normalizeEmail = (rawEmail) => {
  if (!rawEmail || typeof rawEmail !== 'string') return '';
  const trimmed = rawEmail.trim().toLowerCase();
  const parts = trimmed.split('@');
  if (parts.length !== 2) return trimmed;

  let [localPart, domain] = parts;
  domain = domain.trim();

  if (domain === 'gmail.com' || domain === 'googlemail.com') {
    domain = 'gmail.com';
    localPart = localPart.split('+')[0];
    localPart = localPart.replace(/\./g, '');
  }

  return `${localPart}@${domain}`;
};

export default normalizeEmail;
