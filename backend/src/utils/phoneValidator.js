/**
 * Phone number validation and normalization utility for Velvorax Marketplace
 *
 * Requirements:
 * - Reject any alphabetic characters (e.g. 'abc123', 'phone123', 'test@123').
 * - Support international numbers with optional leading '+'.
 * - Digits length must be between 7 and 15 digits (ITU-T E.164 international standard).
 *
 * @param {string} phone - The raw phone number input.
 * @param {boolean} required - Whether phone is required.
 * @returns {{ isValid: boolean, normalized: string, error?: string }}
 */
export const validatePhoneNumber = (phone, required = false) => {
  if (!phone || typeof phone !== 'string') {
    if (required) {
      return { isValid: false, normalized: '', error: 'Phone number is required.' };
    }
    return { isValid: true, normalized: '' };
  }

  const trimmed = phone.trim();
  if (!trimmed) {
    if (required) {
      return { isValid: false, normalized: '', error: 'Phone number is required.' };
    }
    return { isValid: true, normalized: '' };
  }

  // Reject alphabetic characters or invalid symbols
  if (/[a-zA-Z]/.test(trimmed)) {
    return { isValid: false, normalized: '', error: 'Phone number must not contain letters or alphabetic characters.' };
  }

  // Check valid international characters: optional leading +, digits, spaces, dashes, parentheses
  if (!/^\+?[0-9\s\-()]+$/.test(trimmed)) {
    return { isValid: false, normalized: '', error: 'Phone number contains invalid characters.' };
  }

  // Extract digits and check if leading plus is present
  const hasPlus = trimmed.startsWith('+');
  const digitsOnly = trimmed.replace(/\D/g, '');

  if (digitsOnly.length < 7) {
    return { isValid: false, normalized: '', error: 'Phone number is too short. Please provide a valid phone number (minimum 7 digits).' };
  }

  if (digitsOnly.length > 15) {
    return { isValid: false, normalized: '', error: 'Phone number must not exceed 15 digits.' };
  }

  const normalized = hasPlus ? `+${digitsOnly}` : digitsOnly;
  return { isValid: true, normalized };
};

export const isValidPhoneNumber = (phone, required = false) => validatePhoneNumber(phone, required).isValid;

export default validatePhoneNumber;
