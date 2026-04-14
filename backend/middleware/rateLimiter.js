// Simple in-memory rate limiter for timesheet submissions
const rateLimitStore = new Map();

// Rate limit configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute in milliseconds
const RATE_LIMIT_MAX_REQUESTS = 10; // Max 10 requests per minute per user

const rateLimiter = (maxRequests = RATE_LIMIT_MAX_REQUESTS, windowMs = RATE_LIMIT_WINDOW) => {
  return (req, res, next) => {
    const key = `${req.user?.id || req.ip}:${req.route.path}`;
    const now = Date.now();
    
    // Get existing requests for this user/IP
    const requests = rateLimitStore.get(key) || [];
    
    // Filter out old requests outside the window
    const validRequests = requests.filter(timestamp => now - timestamp < windowMs);
    
    // Check if user has exceeded the rate limit
    if (validRequests.length >= maxRequests) {
      const oldestRequest = Math.min(...validRequests);
      const resetTime = Math.ceil((oldestRequest + windowMs - now) / 1000);
      
      return res.status(429).json({
        success: false,
        message: 'Too many requests. Please try again later.',
        error: `Rate limit exceeded. Try again in ${resetTime} seconds.`,
        retryAfter: resetTime
      });
    }
    
    // Add current request timestamp
    validRequests.push(now);
    rateLimitStore.set(key, validRequests);
    
    // Clean up old entries periodically
    if (Math.random() < 0.01) { // 1% chance to clean up
      for (const [storeKey, timestamps] of rateLimitStore.entries()) {
        const valid = timestamps.filter(timestamp => now - timestamp < windowMs);
        if (valid.length === 0) {
          rateLimitStore.delete(storeKey);
        } else {
          rateLimitStore.set(storeKey, valid);
        }
      }
    }
    
    next();
  };
};

// Specific rate limiters for different endpoints
const timesheetSubmissionLimiter = rateLimiter(5, 60 * 1000); // 5 submissions per minute
const timesheetApprovalLimiter = rateLimiter(20, 60 * 1000); // 20 approvals per minute
const generalApiLimiter = rateLimiter(100, 60 * 1000); // 100 general requests per minute

export {
  rateLimiter,
  timesheetSubmissionLimiter,
  timesheetApprovalLimiter,
  generalApiLimiter
};
