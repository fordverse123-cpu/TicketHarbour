import Listing from '../models/Listing.js';
import { errorResponse } from '../utils/apiResponse.js';

/**
 * Reusable middleware to enforce strict admin ownership for listing operations.
 * Allows access ONLY if:
 * 1. The authenticated user is a SUPER_ADMIN.
 * 2. The listing's `createdBy` ID matches the authenticated user's ID (`req.user._id`).
 * Returns HTTP 403 Forbidden on unauthorized cross-admin manipulation attempts.
 */
export const verifyListingOwnership = async (req, res, next) => {
  try {
    const listingId = req.params.id || req.params.identifier;

    if (!listingId || !listingId.match(/^[0-9a-fA-F]{24}$/)) {
      return errorResponse(res, 400, 'Invalid listing ID format');
    }

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return errorResponse(res, 404, 'Listing not found');
    }

    const userRole = req.user?.role ? req.user.role.toUpperCase() : '';
    const isSuperAdmin = userRole === 'SUPER_ADMIN' || userRole === 'SUPERADMIN';
    const isOwner = listing.createdBy && listing.createdBy.toString() === req.user._id.toString();

    if (!isOwner && !isSuperAdmin) {
      return errorResponse(res, 403, 'You are not authorized to modify this listing');
    }

    req.targetListing = listing;
    next();
  } catch (error) {
    next(error);
  }
};
