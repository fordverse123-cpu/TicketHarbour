import express from 'express';
import { getAdminStats, getAllAdminBookings } from '../controllers/adminController.js';
import { createTrain, updateTrain, deleteTrain } from '../controllers/trainController.js';
import { createStation } from '../controllers/stationController.js';
import { protect, authorize } from '../middleware/auth.js';
import { requirePermission } from '../middleware/permissionMiddleware.js';

const router = express.Router();

router.use(protect, authorize('admin', 'ADMIN', 'super_admin', 'superadmin', 'SUPER_ADMIN'));

router.get('/stats', getAdminStats);
router.get('/bookings', getAllAdminBookings);

// Category Permission Protected Admin Endpoints
router.post('/trains', requirePermission('TRAIN'), createTrain);
router.put('/trains/:id', requirePermission('TRAIN'), updateTrain);
router.delete('/trains/:id', requirePermission('TRAIN'), deleteTrain);
router.post('/stations', requirePermission('TRAIN'), createStation);

export default router;
