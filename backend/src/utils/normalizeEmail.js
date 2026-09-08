/**
 * Centralized email normalization utility for Velvorax Marketplace
 *
 * Normalizes email addresses with provider-specific rules:
 * - Lowercases and trims all email strings.
 * - For Gmail (gmail.com, googlemail.com):
 *   1. Removes dots (.) from the local username part (s.reethar170 -> sreethar170).
 *   2. Removes plus (+) alias extensions (user+tag -> user).
 *   3. Normalizes domain to 'gmail.com'.
 * - For other email providers (yahoo.com, outlook.com, custom domains):
 *   1. Preserves dots in the local part.
 *   2. Lowercases the entire email address.
 *   3. Trims whitespace.
 *
 * @param {string} rawEmail - The raw input email string.
 * @returns {string} The normalized email address, or empty string if invalid.
 */
export const normalizeEmail = (rawEmail) => {
  if (!rawEmail || typeof rawEmail !== 'string') return '';
  const trimmed = rawEmail.trim().toLowerCase();
  const parts = trimmed.split('@');
  if (parts.length !== 2) return trimmed;

  let [localPart, domain] = parts;
  domain = domain.trim();

  // Normalize standard Google mail domains
  if (domain === 'gmail.com' || domain === 'googlemail.com') {
    domain = 'gmail.com';
    // Remove plus aliases (e.g. user+news -> user)
    localPart = localPart.split('+')[0];
    // Remove all dots from local-part for Gmail
    localPart = localPart.replace(/\./g, '');
  }

  return `${localPart}@${domain}`;
};

export default normalizeEmail;
