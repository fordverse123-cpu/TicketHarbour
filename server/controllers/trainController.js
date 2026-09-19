import Train from '../models/Train.js';
import { searchTrains as searchTrainsService } from '../services/trainSearchService.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

/**
 * @desc    Search trains between stations on a specific date
 * @route   GET /api/trains/search or GET /api/v1/trains/search
 * @access  Public
 */
export const searchTrains = async (req, res, next) => {
  try {
    const { from, to, date, class: reqClass, quota } = req.query;

    if (!from || !to) {
      return errorResponse(res, 400, 'Please provide both "from" and "to" station parameters.');
    }

    const result = await searchTrainsService({
      from,
      to,
      date,
      class: reqClass,
      quota,
    });

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single train schedule by train number
 * @route   GET /api/trains/:trainNumber or GET /api/v1/trains/:trainNumber
 * @access  Public
 */
export const getTrainByNumber = async (req, res, next) => {
  try {
    const { trainNumber } = req.params;
    const train = await Train.findOne({ trainNumber: trainNumber.trim(), active: true }).lean();

    if (!train) {
      return errorResponse(res, 404, `Train #${trainNumber} not found.`);
    }

    return successResponse(res, 200, 'Train schedule fetched successfully', { train });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin: Create new train schedule
 * @route   POST /api/admin/trains or POST /api/v1/admin/trains
 * @access  Private (Admin)
 */
export const createTrain = async (req, res, next) => {
  try {
    const { trainNumber, trainName, trainType, source, destination, runningDays, classes, route } = req.body;

    if (!trainNumber || !trainName || !source || !destination || !route || route.length < 2) {
      return errorResponse(res, 400, 'Please provide trainNumber, trainName, source, destination, and valid route array.');
    }

    const existingTrain = await Train.findOne({ trainNumber: trainNumber.trim() });
    if (existingTrain) {
      return errorResponse(res, 400, `Train #${trainNumber} already exists.`);
    }

    const train = await Train.create(req.body);
    return successResponse(res, 201, 'Train created successfully', { train });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin: Update train schedule
 * @route   PUT /api/admin/trains/:id or PUT /api/v1/admin/trains/:id
 * @access  Private (Admin)
 */
export const updateTrain = async (req, res, next) => {
  try {
    const { id } = req.params;

    const train = await Train.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!train) {
      return errorResponse(res, 404, 'Train record not found.');
    }

    return successResponse(res, 200, 'Train updated successfully', { train });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin: Delete train schedule
 * @route   DELETE /api/admin/trains/:id or DELETE /api/v1/admin/trains/:id
 * @access  Private (Admin)
 */
export const deleteTrain = async (req, res, next) => {
  try {
    const { id } = req.params;

    const train = await Train.findByIdAndDelete(id);

    if (!train) {
      return errorResponse(res, 404, 'Train record not found.');
    }

    return successResponse(res, 200, 'Train deleted successfully', { id });
  } catch (error) {
    next(error);
  }
};
