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
router.post('/', protect, authorize('admin'), createListing);
router.put('/:id', protect, authorize('admin'), updateListing);
router.delete('/:id', protect, authorize('admin'), deleteListing);

export default router;
