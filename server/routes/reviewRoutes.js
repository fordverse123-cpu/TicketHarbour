import express from 'express';
import { getListingReviews, addReview } from '../controllers/reviewController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/listing/:listingId', getListingReviews);
router.post('/', protect, addReview);

export default router;
