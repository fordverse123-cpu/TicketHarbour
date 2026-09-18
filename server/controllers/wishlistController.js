import Wishlist from '../models/Wishlist.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

// @desc    Get user wishlist
// @route   GET /api/v1/wishlist
// @access  Private
export const getWishlist = async (req, res, next) => {
  try {
    const items = await Wishlist.find({ user: req.user.id })
      .populate('listing')
      .sort('-createdAt');
    return successResponse(res, 200, 'Wishlist items retrieved', { wishlist: items });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle item in wishlist (add/remove)
// @route   POST /api/v1/wishlist/toggle
// @access  Private
export const toggleWishlist = async (req, res, next) => {
  try {
    const { listingId } = req.body;
    if (!listingId) {
      return errorResponse(res, 400, 'Please provide listingId');
    }

    const existing = await Wishlist.findOne({ user: req.user.id, listing: listingId });

    if (existing) {
      await Wishlist.findByIdAndDelete(existing._id);
      return successResponse(res, 200, 'Removed from favorites', { isFavorite: false });
    } else {
      await Wishlist.create({ user: req.user.id, listing: listingId });
      return successResponse(res, 201, 'Added to favorites!', { isFavorite: true });
    }
  } catch (error) {
    next(error);
  }
};
