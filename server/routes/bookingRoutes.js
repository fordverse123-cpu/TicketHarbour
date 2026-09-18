import express from 'express';
import {
  lockSeats,
  unlockSeats,
  createBooking,
  confirmBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  downloadPDFTicket,
  verifyQRTicket,
} from '../controllers/bookingController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/lock-seats', lockSeats);
router.post('/unlock-seats', unlockSeats);
router.post('/', createBooking);
router.post('/:id/confirm', confirmBooking);
router.get('/my-bookings', getMyBookings);
router.get('/:id', getBookingById);
router.post('/:id/cancel', cancelBooking);
router.get('/:id/ticket-pdf', downloadPDFTicket);

// Admin QR ticket verification
router.post('/verify-qr', authorize('admin'), verifyQRTicket);

export default router;
