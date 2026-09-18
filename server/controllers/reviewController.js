import Review from '../models/Review.js';
import Listing from '../models/Listing.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

// @desc    Get reviews for a listing
// @route   GET /api/v1/reviews/listing/:listingId
// @access  Public
export const getListingReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ listing: req.params.listingId })
      .populate('user', 'name')
      .sort('-createdAt');
    return successResponse(res, 200, 'Listing reviews retrieved', { reviews });
  } catch (error) {
    next(error);
  }
};

// @desc    Add review for a listing
// @route   POST /api/v1/reviews
// @access  Private
export const addReview = async (req, res, next) => {
  try {
    const { listingId, rating, comment, bookingId } = req.body;

    if (!listingId || !rating || !comment) {
      return errorResponse(res, 400, 'Please provide listingId, rating and comment');
    }

    const review = await Review.create({
      listing: listingId,
      user: req.user.id,
      booking: bookingId || null,
      rating: Number(rating),
      comment,
    });

    // Update listing rating average
    const allReviews = await Review.find({ listing: listingId });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await Listing.findByIdAndUpdate(listingId, {
      rating: Math.round(avgRating * 10) / 10,
      numReviews: allReviews.length,
    });

    return successResponse(res, 201, 'Review added successfully', { review });
  } catch (error) {
    if (error.code === 11000) {
      return errorResponse(res, 400, 'You have already reviewed this item.');
    }
    next(error);
  }
};
