/**
 * High-performance in-memory sliding-window rate limiter for Velvorax Marketplace
 */

class SlidingWindowLimiter {
  constructor(windowMs = 60 * 1000, maxRequests = 30, message = 'Too many requests. Please try again later.') {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    this.message = message;
    this.requests = new Map(); // key -> [timestamp, timestamp]

    // Periodic garbage collection every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  isRateLimited(key) {
    const now = Date.now();
    const timestamps = this.requests.get(key) || [];

    // Filter timestamps within the sliding window
    const validTimestamps = timestamps.filter((t) => now - t < this.windowMs);

    if (validTimestamps.length >= this.maxRequests) {
      return true;
    }

    validTimestamps.push(now);
    this.requests.set(key, validTimestamps);
    return false;
  }

  cleanup() {
    const now = Date.now();
    for (const [key, timestamps] of this.requests.entries()) {
      const valid = timestamps.filter((t) => now - t < this.windowMs);
      if (valid.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, valid);
      }
    }
  }

  createMiddleware(customKeyExtractor = null) {
    return (req, res, next) => {
      let identifier;
      if (customKeyExtractor) {
        identifier = customKeyExtractor(req);
      } else {
        identifier = req.user?._id?.toString() || req.ip || req.headers['x-forwarded-for'] || 'guest';
      }

      if (this.isRateLimited(identifier)) {
        return res.status(429).json({
          success: false,
          error: 'RATE_LIMIT_EXCEEDED',
          message: this.message
        });
      }
      next();
    };
  }
}

// 1. Authentication Limiter (10 attempts per 15 minutes per IP/email)
export const authLimiter = new SlidingWindowLimiter(
  15 * 60 * 1000,
  10,
  'Too many login attempts. For security reasons, please wait 15 minutes before trying again.'
);
export const rateLimitAuth = authLimiter.createMiddleware(
  req => (typeof req.body?.email === 'string' ? `auth_${req.body.email.toLowerCase().trim()}_${req.ip}` : `auth_ip_${req.ip}`)
);

// 2. Admin Authentication Limiter (5 attempts per 15 minutes)
export const adminAuthLimiter = new SlidingWindowLimiter(
  15 * 60 * 1000,
  5,
  'Too many administrative authentication attempts. Access temporarily restricted for 15 minutes.'
);
export const rateLimitAdminAuth = adminAuthLimiter.createMiddleware(
  req => `admin_auth_${req.ip}`
);

// 3. Password Reset / OTP Limiter (5 requests per 15 minutes)
export const otpLimiter = new SlidingWindowLimiter(
  15 * 60 * 1000,
  5,
  'Too many verification code requests. Please wait 15 minutes before requesting again.'
);
export const rateLimitOtp = otpLimiter.createMiddleware(
  req => (typeof req.body?.email === 'string' ? `otp_${req.body.email.toLowerCase().trim()}` : `otp_ip_${req.ip}`)
);

// 4. Chat Messaging Limiter (60 messages per minute)
export const messageLimiter = new SlidingWindowLimiter(
  60 * 1000,
  60,
  'You are sending messages too quickly. Please pause for a moment.'
);
export const rateLimitMessages = messageLimiter.createMiddleware();

// 5. Listing Creation Limiter (20 listings per 15 minutes)
export const listingLimiter = new SlidingWindowLimiter(
  15 * 60 * 1000,
  20,
  'Listing creation rate limit reached. Please wait a while before creating more listings.'
);
export const rateLimitListings = listingLimiter.createMiddleware();

// 6. File Upload Limiter (20 uploads per 15 minutes)
export const uploadLimiter = new SlidingWindowLimiter(
  15 * 60 * 1000,
  20,
  'Upload limit reached. Please wait before uploading additional files.'
);
export const rateLimitUploads = uploadLimiter.createMiddleware();

// 7. AI Chat Limiters
const buyerLimiter = new SlidingWindowLimiter(
  60 * 1000,
  30,
  'You are sending AI requests too quickly. Please wait a moment and try again.'
);
export const rateLimitBuyerAI = buyerLimiter.createMiddleware();

const sellerLimiter = new SlidingWindowLimiter(
  60 * 1000,
  40,
  'Seller AI rate limit reached. Please wait a moment and try again.'
);
export const rateLimitSellerAI = sellerLimiter.createMiddleware();

const adminLimiter = new SlidingWindowLimiter(
  60 * 1000,
  60,
  'Admin AI rate limit reached. Please wait a moment.'
);
export const rateLimitAdminAI = adminLimiter.createMiddleware();

// 8. General API Fallback Limiter (300 requests per 15 minutes)
export const generalApiLimiter = new SlidingWindowLimiter(
  15 * 60 * 1000,
  300,
  'Too many requests from this IP address. Please slow down.'
);
export const rateLimitApi = generalApiLimiter.createMiddleware();

export default {
  rateLimitAuth,
  rateLimitAdminAuth,
  rateLimitOtp,
  rateLimitMessages,
  rateLimitListings,
  rateLimitUploads,
  rateLimitBuyerAI,
  rateLimitSellerAI,
  rateLimitAdminAI,
  rateLimitApi
};
