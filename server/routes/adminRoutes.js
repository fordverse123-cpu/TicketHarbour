import express from 'express';
import { getAdminStats, getAllAdminBookings } from '../controllers/adminController.js';
import { createTrain, updateTrain, deleteTrain } from '../controllers/trainController.js';
import { createStation } from '../controllers/stationController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect, authorize('admin', 'super_admin', 'superadmin'));

router.get('/stats', getAdminStats);
router.get('/bookings', getAllAdminBookings);

// Admin Train Management APIs
router.post('/trains', createTrain);
router.put('/trains/:id', updateTrain);
router.delete('/trains/:id', deleteTrain);

// Admin Station Management API
router.post('/stations', createStation);

export default router;
