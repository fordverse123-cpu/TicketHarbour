import rateLimit from 'express-rate-limit';
import SearchLog from '../models/SearchLog.js';

/**
 * Returns the configured daily search limit (default 42 searches per day)
 */
export const getDailySearchLimit = () => {
  const parsed = parseInt(process.env.SEARCH_DAILY_LIMIT, 10);
  return !isNaN(parsed) && parsed > 0 ? parsed : 42;
};

/**
 * Memory-backed rate limiter for 24-hour window
 */
export const searchMemoryLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 Hours
  max: () => getDailySearchLimit(),
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    if (req.user && req.user._id) {
      return `search_user_${req.user._id}`;
    }
    return `search_ip_${req.ip || req.headers['x-forwarded-for'] || 'anonymous'}`;
  },
  handler: (req, res) => {
    const limit = getDailySearchLimit();
    return res.status(429).json({
      success: false,
      message: `Daily search limit of ${limit} searches per day reached. Please try again tomorrow.`,
      limit,
      remaining: 0,
      retryAfter: '24 hours',
    });
  },
});

/**
 * DB-Persistent Daily Search Rate Limiter Middleware
 * Checks MongoDB SearchLog for searches performed in the last 24 hours
 * to guarantee search quota enforcement across server restarts.
 */
export const searchDailyLimiter = async (req, res, next) => {
  if (process.env.NODE_ENV === 'test' && process.env.DISABLE_RATE_LIMIT === 'true') {
    return next();
  }

  try {
    const limit = getDailySearchLimit();
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const filter = {
      createdAt: { $gte: twentyFourHoursAgo },
    };

    if (req.user && req.user._id) {
      filter.user = req.user._id;
    } else {
      const clientIp = req.ip || req.headers['x-forwarded-for'] || '';
      if (clientIp) {
        filter.ipAddress = clientIp;
      }
    }

    // Query SearchLog collection for exact count in last 24h window
    const searchCount = await SearchLog.countDocuments(filter);

    if (searchCount >= limit) {
      return res.status(429).json({
        success: false,
        message: `Daily search limit of ${limit} searches per day reached. Please try again tomorrow.`,
        limit,
        remaining: 0,
        searchesToday: searchCount,
        retryAfter: '24 hours',
      });
    }

    // Proceed to memory limiter for additional rapid-burst protection
    return searchMemoryLimiter(req, res, next);
  } catch (err) {
    console.warn('[SearchRateLimiter Warning] Fallback to memory limiter:', err.message);
    return searchMemoryLimiter(req, res, next);
  }
};
