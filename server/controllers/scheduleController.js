import Schedule from '../models/Schedule.js';
import Listing from '../models/Listing.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

// @desc    Get schedules for a listing
// @route   GET /api/v1/schedules
// @access  Public
export const getSchedules = async (req, res, next) => {
  try {
    const { listing, date } = req.query;

    const query = { status: { $ne: 'cancelled' } };

    if (listing) {
      query.listing = listing;
    }

    if (date) {
      const searchDate = new Date(date);
      const nextDate = new Date(searchDate);
      nextDate.setDate(nextDate.getDate() + 1);
      query.date = { $gte: searchDate, $lt: nextDate };
    }

    const schedules = await Schedule.find(query)
      .populate('listing', 'title categoryType pricingTiers transitInfo')
      .populate('venue', 'name city seatConfig')
      .sort('date startTime');

    // Clean expired locks for each schedule before sending
    schedules.forEach((sch) => sch.cleanExpiredLocks());

    return successResponse(res, 200, 'Schedules retrieved', { schedules });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single schedule details with live seat availability
// @route   GET /api/v1/schedules/:id
// @access  Public
export const getScheduleById = async (req, res, next) => {
  try {
    const schedule = await Schedule.findById(req.params.id)
      .populate('listing')
      .populate('venue');

    if (!schedule) {
      return errorResponse(res, 404, 'Schedule not found');
    }

    schedule.cleanExpiredLocks();
    await schedule.save();

    return successResponse(res, 200, 'Schedule details', { schedule });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new schedule (Admin)
// @route   POST /api/v1/schedules
// @access  Private/Admin
export const createSchedule = async (req, res, next) => {
  try {
    const { listing, venue, date, startTime, endTime, pricing } = req.body;

    const listingDoc = await Listing.findById(listing);
    if (!listingDoc) {
      return errorResponse(res, 404, 'Listing not found');
    }

    const schedule = await Schedule.create({
      listing,
      venue: venue || listingDoc.venue,
      date: new Date(date),
      startTime,
      endTime: endTime || '',
      pricing: pricing || listingDoc.pricingTiers,
      seatMap: {
        bookedSeats: [],
        lockedSeats: [],
      },
    });

    return successResponse(res, 201, 'Schedule created successfully', { schedule });
  } catch (error) {
    next(error);
  }
};
