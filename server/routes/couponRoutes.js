import express from 'express';
import { validateCoupon, getCoupons, createCoupon } from '../controllers/couponController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/validate', protect, validateCoupon);
router.get('/', protect, authorize('admin'), getCoupons);
router.post('/', protect, authorize('admin'), createCoupon);

export default router;
