import express from 'express';
import {
  getCategories,
  getCategoryByIdentifier,
  createCategory,
} from '../controllers/categoryController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getCategories);
router.get('/:identifier', getCategoryByIdentifier);
router.post('/', protect, authorize('admin'), createCategory);

export default router;
