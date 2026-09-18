import express from 'express';
import {
  getProfile,
  updateProfile,
  changePassword,
  getAllUsers,
} from '../controllers/userController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/change-password', changePassword);

// Admin route
router.get('/', authorize('admin'), getAllUsers);

export default router;
