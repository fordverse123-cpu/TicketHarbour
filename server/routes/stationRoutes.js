import express from 'express';
import { searchStations, createStation } from '../controllers/stationController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', searchStations);
router.get('/search', searchStations);

// Admin Protected routes
router.post('/', protect, authorize('admin', 'super_admin'), createStation);

export default router;
