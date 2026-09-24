import express from 'express';
import { searchStations, createStation } from '../controllers/stationController.js';
import { protect, authorize } from '../middleware/auth.js';
import { searchDailyLimiter } from '../middleware/searchRateLimiter.js';

const router = express.Router();

// Public routes
router.get('/', searchDailyLimiter, searchStations);
router.get('/search', searchDailyLimiter, searchStations);

// Admin Protected routes
router.post('/', protect, authorize('admin', 'super_admin'), createStation);

export default router;
