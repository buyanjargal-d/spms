import rateLimit from 'express-rate-limit';

/**
 * Rate limiter for login endpoint
 * Allows 10 requests per 15 minutes per IP
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: {
    success: false,
    error: 'Too Many Requests',
    message: 'Too many login attempts from this IP. Please try again after 15 minutes.',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Skip successful requests (don't count them towards the limit)
  skipSuccessfulRequests: false,
  // Skip failed requests (don't count them towards the limit)
  skipFailedRequests: false,
});

/**
 * Strict rate limiter for sensitive endpoints
 * Allows 5 requests per 15 minutes per IP
 */
export const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    success: false,
    error: 'Too Many Requests',
    message: 'Too many requests from this IP. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * General API rate limiter
 * Allows 100 requests per 15 minutes per IP
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too Many Requests',
    message: 'Too many requests from this IP. Please slow down.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
