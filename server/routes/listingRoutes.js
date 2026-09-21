import express from 'express';
import {
  getListings,
  getAdminListings,
  getListingByIdentifier,
  createListing,
  updateListing,
  deleteListing,
} from '../controllers/listingController.js';
import { protect, authorize } from '../middleware/auth.js';
import { verifyListingOwnership } from '../middleware/ownership.js';

const router = express.Router();

router.get('/', getListings);
router.get('/admin', protect, authorize('ADMIN', 'SUPER_ADMIN'), getAdminListings);
router.get('/:identifier', getListingByIdentifier);
router.post('/', protect, authorize('ADMIN', 'SUPER_ADMIN'), createListing);
router.put('/:id', protect, authorize('ADMIN', 'SUPER_ADMIN'), verifyListingOwnership, updateListing);
router.delete('/:id', protect, authorize('ADMIN', 'SUPER_ADMIN'), verifyListingOwnership, deleteListing);

export default router;
