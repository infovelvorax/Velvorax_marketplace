/**
 * Phone number validation and normalization utility for Velvorax Marketplace (Frontend)
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

  if (/[a-zA-Z]/.test(trimmed)) {
    return { isValid: false, normalized: '', error: 'Phone number must not contain letters.' };
  }

  if (!/^\+?[0-9\s\-()]+$/.test(trimmed)) {
    return { isValid: false, normalized: '', error: 'Phone number contains invalid characters.' };
  }

  const hasPlus = trimmed.startsWith('+');
  const digitsOnly = trimmed.replace(/\D/g, '');

  if (digitsOnly.length < 7) {
    return { isValid: false, normalized: '', error: 'Enter a valid phone number with area/country code (at least 7 digits).' };
  }

  if (digitsOnly.length > 15) {
    return { isValid: false, normalized: '', error: 'Phone number must not exceed 15 digits.' };
  }

  const normalized = hasPlus ? `+${digitsOnly}` : digitsOnly;
  return { isValid: true, normalized };
};

export const isValidPhoneNumber = (phone, required = false) => validatePhoneNumber(phone, required).isValid;

export default validatePhoneNumber;
