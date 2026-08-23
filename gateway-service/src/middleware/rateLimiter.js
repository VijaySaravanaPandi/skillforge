const rateLimit = require('express-rate-limit');

/**
 * authLimiter — tight rate limit for authentication endpoints
 * Prevents brute-force attacks on login/register
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests — please try again in 15 minutes' },
});

/**
 * apiLimiter — general rate limit for all proxied API calls
 */
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Rate limit exceeded — please slow down' },
});

module.exports = { authLimiter, apiLimiter };
