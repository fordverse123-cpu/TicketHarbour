import express from 'express';
import {
  getListings,
  getListingByIdentifier,
  createListing,
  updateListing,
  deleteListing,
} from '../controllers/listingController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getListings);
router.get('/:identifier', getListingByIdentifier);
router.post('/', protect, authorize('ADMIN', 'SUPER_ADMIN'), createListing);
router.put('/:id', protect, authorize('ADMIN', 'SUPER_ADMIN'), updateListing);
router.delete('/:id', protect, authorize('ADMIN', 'SUPER_ADMIN'), deleteListing);

export default router;
