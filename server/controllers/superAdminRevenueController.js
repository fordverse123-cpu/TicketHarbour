import Transaction from '../models/Transaction.js';
import User from '../models/User.js';
import Listing from '../models/Listing.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { getPlatformFeePercentage } from '../services/revenueService.js';

// @desc    Get Super Admin Global Platform Revenue Overview
// @route   GET /api/v1/super-admin/revenue/summary
// @access  Private/SuperAdmin
export const getGlobalRevenueSummary = async (req, res, next) => {
  try {
    const paidAgg = await Transaction.aggregate([
      { $match: { status: 'paid' } },
      {
        $group: {
          _id: null,
          totalGrossRevenue: { $sum: '$grossRevenue' },
          totalPlatformFees: { $sum: '$platformFee' },
          totalAdminRevenue: { $sum: '$adminRevenue' },
          totalTicketsSold: { $sum: '$quantity' },
          totalPaidTransactions: { $sum: 1 },
        },
      },
    ]);

    const metrics = paidAgg[0] || {
      totalGrossRevenue: 0,
      totalPlatformFees: 0,
      totalAdminRevenue: 0,
      totalTicketsSold: 0,
      totalPaidTransactions: 0,
    };

    const totalAdminsCount = await User.countDocuments({ role: { $in: ['ADMIN', 'admin'] } });
    const totalActiveListings = await Listing.countDocuments({ isActive: true });
    const totalTransactions = await Transaction.countDocuments();

    return successResponse(res, 200, 'Global revenue summary retrieved', {
      global: {
        totalGrossRevenue: metrics.totalGrossRevenue,
        totalPlatformFees: metrics.totalPlatformFees,
        totalAdminRevenue: metrics.totalAdminRevenue,
        totalTicketsSold: metrics.totalTicketsSold,
        totalPaidTransactions: metrics.totalPaidTransactions,
        totalTransactions,
        totalAdminsCount,
        totalActiveListings,
        configuredPlatformFeePercent: getPlatformFeePercentage(),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Per-Admin Revenue Breakdown Table (Super Admin)
// @route   GET /api/v1/super-admin/revenue/breakdown
// @access  Private/SuperAdmin
export const getAdminWiseRevenueBreakdown = async (req, res, next) => {
  try {
    // Get all admin users
    const admins = await User.find({ role: { $in: ['ADMIN', 'admin', 'SUPER_ADMIN', 'superadmin'] } })
      .select('name email role status phone createdAt')
      .sort('-createdAt')
      .lean();

    const adminIds = admins.map((a) => a._id);

    // Aggregate paid transaction stats grouped by adminId
    const adminStats = await Transaction.aggregate([
      { $match: { adminId: { $in: adminIds }, status: 'paid' } },
      {
        $group: {
          _id: '$adminId',
          ticketsSold: { $sum: '$quantity' },
          grossRevenue: { $sum: '$grossRevenue' },
          platformFees: { $sum: '$platformFee' },
          adminRevenue: { $sum: '$adminRevenue' },
          ordersCount: { $sum: 1 },
        },
      },
    ]);

    // Count listings per admin
    const listingCounts = await Listing.aggregate([
      { $match: { createdBy: { $in: adminIds } } },
      { $group: { _id: '$createdBy', count: { $sum: 1 } } },
    ]);

    const statsMap = {};
    adminStats.forEach((s) => {
      statsMap[s._id.toString()] = s;
    });

    const listingMap = {};
    listingCounts.forEach((l) => {
      listingMap[l._id.toString()] = l.count;
    });

    const breakdown = admins.map((admin) => {
      const stats = statsMap[admin._id.toString()] || {};
      const itemsCount = listingMap[admin._id.toString()] || 0;

      return {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        status: admin.status,
        itemsCount,
        ticketsSold: stats.ticketsSold || 0,
        grossRevenue: stats.grossRevenue || 0,
        platformFees: stats.platformFees || 0,
        adminRevenue: stats.adminRevenue || 0,
        ordersCount: stats.ordersCount || 0,
      };
    });

    return successResponse(res, 200, 'Per-admin revenue breakdown retrieved', {
      breakdown,
    });
  } catch (error) {
    next(error);
  }
};
