import express from 'express';
import {
  logSearchEndpoint,
  getRecentSearches,
  getPopularSearchRoutes,
  getAdminSearchAnalytics,
} from '../controllers/searchLogController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes (with optional user context if token provided)
router.post('/log', logSearchEndpoint);
router.get('/recent', getRecentSearches);
router.get('/popular', getPopularSearchRoutes);

// Protected Admin route
router.get('/analytics', protect, authorize('admin', 'super_admin', 'superadmin'), getAdminSearchAnalytics);

export default router;
