import Station from '../models/Station.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

/**
 * @desc    Search stations by station code, name, city, or aliases
 * @route   GET /api/stations/search or GET /api/v1/stations/search
 * @access  Public
 */
export const searchStations = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q || !q.trim()) {
      const allStations = await Station.find({ active: true }).sort({ stationName: 1 }).limit(50).lean();
      return successResponse(res, 200, 'Stations fetched successfully', {
        count: allStations.length,
        stations: allStations,
      });
    }

    const searchRegex = new RegExp(q.trim(), 'i');

    const stations = await Station.find({
      active: true,
      $or: [
        { stationCode: searchRegex },
        { stationName: searchRegex },
        { city: searchRegex },
        { aliases: searchRegex },
      ],
    })
      .sort({ stationName: 1 })
      .limit(30)
      .lean();

    return successResponse(res, 200, 'Matching stations fetched successfully', {
      count: stations.length,
      stations,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin: Add a new station
 * @route   POST /api/admin/stations or POST /api/v1/admin/stations
 * @access  Private (Admin)
 */
export const createStation = async (req, res, next) => {
  try {
    const { stationCode, stationName, city, state, zone, latitude, longitude, aliases } = req.body;

    if (!stationCode || !stationName || !city) {
      return errorResponse(res, 400, 'Please provide stationCode, stationName, and city.');
    }

    const codeUpper = stationCode.trim().toUpperCase();
    const existing = await Station.findOne({ stationCode: codeUpper });

    if (existing) {
      return errorResponse(res, 400, `Station code ${codeUpper} already exists.`);
    }

    const station = await Station.create({
      ...req.body,
      stationCode: codeUpper,
    });

    return successResponse(res, 201, 'Station created successfully', { station });
  } catch (error) {
    next(error);
  }
};
