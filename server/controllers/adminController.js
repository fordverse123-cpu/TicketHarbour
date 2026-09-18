import Booking from '../models/Booking.js';
import User from '../models/User.js';
import Listing from '../models/Listing.js';
import Schedule from '../models/Schedule.js';
import Category from '../models/Category.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

// @desc    Get Admin Dashboard Stats & Chart Data
// @route   GET /api/v1/admin/stats
// @access  Private/Admin
export const getAdminStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalListings = await Listing.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const confirmedBookings = await Booking.countDocuments({ status: 'confirmed' });

    // Calculate Total Revenue
    const revenueResult = await Booking.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } },
    ]);
    const totalRevenue = revenueResult[0]?.totalRevenue || 0;

    // Category breakdown
    const categoryStats = await Booking.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: '$categoryType', count: { $sum: 1 }, revenue: { $sum: '$totalAmount' } } },
    ]);

    // Recent 10 Bookings
    const recentBookings = await Booking.find()
      .populate('user', 'name email')
      .populate('listing', 'title categoryType')
      .sort('-createdAt')
      .limit(10);

    return successResponse(res, 200, 'Admin Dashboard Stats', {
      stats: {
        totalUsers,
        totalListings,
        totalBookings,
        confirmedBookings,
        totalRevenue,
      },
      categoryStats,
      recentBookings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bookings (Admin)
// @route   GET /api/v1/admin/bookings
// @access  Private/Admin
export const getAllAdminBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find()
      .populate('user', 'name email phone')
      .populate('listing', 'title categoryType')
      .populate('schedule', 'date startTime')
      .sort('-createdAt');
    return successResponse(res, 200, 'All admin bookings', { bookings });
  } catch (error) {
    next(error);
  }
};
