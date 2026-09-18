import express from 'express';
import { getAdminStats, getAllAdminBookings } from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/stats', getAdminStats);
router.get('/bookings', getAllAdminBookings);

export default router;
