import express from 'express';
import {
  getSchedules,
  getScheduleById,
  createSchedule,
} from '../controllers/scheduleController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getSchedules);
router.get('/:id', getScheduleById);
router.post('/', protect, authorize('admin'), createSchedule);

export default router;
