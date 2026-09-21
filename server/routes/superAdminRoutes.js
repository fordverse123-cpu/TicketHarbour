import express from 'express';
import {
  getSuperAdminStats,
  getAdmins,
  createAdmin,
  updateAdminStatus,
  updateAdminPermissions,
  resetAdminPassword,
  updateAdmin,
  deleteAdmin,
} from '../controllers/superAdminController.js';
import {
  getGlobalRevenueSummary,
  getAdminWiseRevenueBreakdown,
} from '../controllers/superAdminRevenueController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Enforce authentication & superadmin role authorization for ALL routes in this router
router.use(protect, authorize('superadmin', 'SUPER_ADMIN'));

router.get('/stats', getSuperAdminStats);
router.get('/revenue/summary', getGlobalRevenueSummary);
router.get('/revenue/breakdown', getAdminWiseRevenueBreakdown);
router.get('/admins', getAdmins);
router.post('/admins', createAdmin);
router.put('/admins/:id/status', updateAdminStatus);
router.patch('/admins/:id/permissions', updateAdminPermissions);
router.put('/admins/:id/permissions', updateAdminPermissions);
router.put('/admins/:id/reset-password', resetAdminPassword);
router.put('/admins/:id', updateAdmin);
router.delete('/admins/:id', deleteAdmin);

export default router;
