import express from 'express';
import {
  getAdminRevenueSummary,
  getAdminRevenueByItems,
  getAdminRevenueItemDetails,
  getAdminTransactions,
  exportAdminTransactionsCSV,
} from '../controllers/adminRevenueController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Enforce authentication & admin authorization for all revenue routes
router.use(protect, authorize('ADMIN', 'SUPER_ADMIN'));

router.get('/summary', getAdminRevenueSummary);
router.get('/items', getAdminRevenueByItems);
router.get('/items/:itemId', getAdminRevenueItemDetails);
router.get('/transactions', getAdminTransactions);
router.get('/export', exportAdminTransactionsCSV);

export default router;
