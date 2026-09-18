import Venue from '../models/Venue.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

// @desc    Get all venues
// @route   GET /api/v1/venues
// @access  Public
export const getVenues = async (req, res, next) => {
  try {
    const venues = await Venue.find({ isActive: true }).sort('city name');
    return successResponse(res, 200, 'Venues retrieved', { venues });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new venue (Admin)
// @route   POST /api/v1/venues
// @access  Private/Admin
export const createVenue = async (req, res, next) => {
  try {
    const venue = await Venue.create(req.body);
    return successResponse(res, 201, 'Venue created successfully', { venue });
  } catch (error) {
    next(error);
  }
};
