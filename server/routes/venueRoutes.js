import express from 'express';
import { getVenues, createVenue } from '../controllers/venueController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getVenues);
router.post('/', protect, authorize('admin'), createVenue);

export default router;
