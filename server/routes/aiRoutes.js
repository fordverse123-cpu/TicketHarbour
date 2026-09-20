import express from 'express';
import rateLimit from 'express-rate-limit';
import {
  handleAIChat,
  handleAISearch,
  handleAISupport,
  handleAIBookingAssistant,
  handleAIRecommendations,
  handleAIAdminInsights,
} from '../controllers/aiController.js';
import { protect, authorize } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

// Dedicated rate limiting for AI endpoints: 60 requests per 15 minutes per IP
const aiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  message: {
    success: false,
    message: 'TicketHarbour AI rate limit exceeded. Please wait a few minutes before trying again.',
  },
});

router.use(aiRateLimiter);

// Optional auth helper middleware for public AI routes
const optionalAuth = async (req, res, next) => {
  try {
    let token = req.cookies?.accessToken;
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (token) {
      const jwt = (await import('jsonwebtoken')).default;
      const decoded = jwt.verify(
        token,
        process.env.JWT_ACCESS_SECRET || 'ticketharbor_access_secret_key_32bytes_min_secure'
      );
      const user = await User.findById(decoded.id).select('-password');
      if (user) req.user = user;
    }
  } catch (err) {
    // Ignore invalid optional auth token
  }
  next();
};

// Endpoints
router.post('/chat', optionalAuth, handleAIChat);
router.post('/search', optionalAuth, handleAISearch);
router.post('/support', handleAISupport);

// Private User Auth Required
router.post('/booking-assistant', protect, handleAIBookingAssistant);

// Public / Optional Auth
router.get('/recommendations', optionalAuth, handleAIRecommendations);

// Private Admin / Super Admin Authorization Required
router.post('/admin-insights', protect, authorize('admin', 'ADMIN', 'super_admin', 'superadmin', 'SUPER_ADMIN'), handleAIAdminInsights);

export default router;
