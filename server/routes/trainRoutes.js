import express from 'express';
import {
  searchTrains,
  getTrainByNumber,
  createTrain,
  updateTrain,
  deleteTrain,
} from '../controllers/trainController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/search', searchTrains);
router.get('/:trainNumber', getTrainByNumber);

// Admin Protected routes
router.post('/', protect, authorize('admin', 'super_admin'), createTrain);
router.put('/:id', protect, authorize('admin', 'super_admin'), updateTrain);
router.delete('/:id', protect, authorize('admin', 'super_admin'), deleteTrain);

export default router;
