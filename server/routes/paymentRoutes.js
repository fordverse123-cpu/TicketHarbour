import express from 'express';
import { createPaymentIntent, stripeWebhook } from '../controllers/paymentController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/create-intent', protect, createPaymentIntent);
router.post('/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

export default router;
