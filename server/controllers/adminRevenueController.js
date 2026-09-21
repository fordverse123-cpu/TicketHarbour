import Transaction from '../models/Transaction.js';
import Listing from '../models/Listing.js';
import Booking from '../models/Booking.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { getPlatformFeePercentage } from '../services/revenueService.js';

/**
 * Utility to parse date filter parameter into a MongoDB Date range query
 */
const getDateRangeQuery = (timeframe, customStart, customEnd) => {
  const now = new Date();
  let startDate = null;
  let endDate = null;

  if (timeframe === 'today') {
    startDate = new Date(now.setHours(0, 0, 0, 0));
    endDate = new Date(now.setHours(23, 59, 59, 999));
  } else if (timeframe === 'week') {
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
    startDate = new Date(now.setDate(diff));
    startDate.setHours(0, 0, 0, 0);
  } else if (timeframe === 'month') {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  } else if (timeframe === 'custom' && customStart) {
    startDate = new Date(customStart);
    if (customEnd) {
      endDate = new Date(customEnd);
      endDate.setHours(23, 59, 59, 999);
    }
  }

  if (startDate || endDate) {
    const range = {};
    if (startDate) range.$gte = startDate;
    if (endDate) range.$lte = endDate;
    return range;
  }
  return null;
};

// @desc    Get Admin Revenue Summary (Scoped to authenticated admin)
// @route   GET /api/v1/admin/revenue/summary
// @access  Private/Admin
export const getAdminRevenueSummary = async (req, res, next) => {
  try {
    const isSuperAdmin = req.user.role?.toUpperCase() === 'SUPER_ADMIN';
    // Regular admins are strictly scoped to their own req.user._id
    const targetAdminId = isSuperAdmin && req.query.adminId ? req.query.adminId : req.user._id;

    const { timeframe, startDate, endDate } = req.query;
    const dateRange = getDateRangeQuery(timeframe, startDate, endDate);

    const baseMatch = { adminId: targetAdminId };
    if (dateRange) {
      baseMatch.createdAt = dateRange;
    }

    // Aggregate Completed (Paid) Revenue Metrics
    const paidMatch = { ...baseMatch, status: 'paid' };
    const revenueAgg = await Transaction.aggregate([
      { $match: paidMatch },
      {
        $group: {
          _id: null,
          totalGrossRevenue: { $sum: '$grossRevenue' },
          totalPlatformFees: { $sum: '$platformFee' },
          totalAdminRevenue: { $sum: '$adminRevenue' },
          totalTicketsSold: { $sum: '$quantity' },
          completedOrdersCount: { $sum: 1 },
        },
      },
    ]);

    const metrics = revenueAgg[0] || {
      totalGrossRevenue: 0,
      totalPlatformFees: 0,
      totalAdminRevenue: 0,
      totalTicketsSold: 0,
      completedOrdersCount: 0,
    };

    // Calculate Today's, Week's, Month's Net Admin Revenue
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [todayAgg, weekAgg, monthAgg, pendingAgg, refundedAgg, totalOwnedListings] = await Promise.all([
      Transaction.aggregate([
        { $match: { adminId: targetAdminId, status: 'paid', createdAt: { $gte: startOfToday } } },
        { $group: { _id: null, total: { $sum: '$adminRevenue' } } },
      ]),
      Transaction.aggregate([
        { $match: { adminId: targetAdminId, status: 'paid', createdAt: { $gte: startOfWeek } } },
        { $group: { _id: null, total: { $sum: '$adminRevenue' } } },
      ]),
      Transaction.aggregate([
        { $match: { adminId: targetAdminId, status: 'paid', createdAt: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: '$adminRevenue' } } },
      ]),
      Transaction.aggregate([
        { $match: { ...baseMatch, status: 'pending' } },
        { $group: { _id: null, totalGross: { $sum: '$grossRevenue' }, count: { $sum: 1 } } },
      ]),
      Transaction.aggregate([
        { $match: { ...baseMatch, status: 'refunded' } },
        { $group: { _id: null, totalRefunded: { $sum: '$adminRevenue' }, count: { $sum: 1 } } },
      ]),
      Listing.countDocuments({ createdBy: targetAdminId }),
    ]);

    return successResponse(res, 200, 'Admin revenue summary retrieved', {
      summary: {
        totalGrossRevenue: metrics.totalGrossRevenue,
        totalPlatformFees: metrics.totalPlatformFees,
        totalAdminRevenue: metrics.totalAdminRevenue,
        totalTicketsSold: metrics.totalTicketsSold,
        totalOrders: metrics.completedOrdersCount,
        todaysRevenue: todayAgg[0]?.total || 0,
        thisWeeksRevenue: weekAgg[0]?.total || 0,
        thisMonthsRevenue: monthAgg[0]?.total || 0,
        pendingPaymentsCount: pendingAgg[0]?.count || 0,
        pendingPaymentsAmount: pendingAgg[0]?.totalGross || 0,
        refundedCount: refundedAgg[0]?.count || 0,
        refundedAmount: refundedAgg[0]?.totalRefunded || 0,
        activeListingsCount: totalOwnedListings,
        configuredPlatformFeePercent: getPlatformFeePercentage(),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Revenue Breakdown by Item/Event
// @route   GET /api/v1/admin/revenue/items
// @access  Private/Admin
export const getAdminRevenueByItems = async (req, res, next) => {
  try {
    const isSuperAdmin = req.user.role?.toUpperCase() === 'SUPER_ADMIN';
    const targetAdminId = isSuperAdmin && req.query.adminId ? req.query.adminId : req.user._id;

    // Fetch all listings created by this admin
    const ownedListings = await Listing.find({ createdBy: targetAdminId })
      .select('title categoryType images bannerImage pricingTiers location isActive')
      .lean();

    const listingIds = ownedListings.map((l) => l._id);

    // Aggregate paid transaction stats per listing
    const transactionStats = await Transaction.aggregate([
      { $match: { listing: { $in: listingIds }, status: 'paid' } },
      {
        $group: {
          _id: '$listing',
          ticketsSold: { $sum: '$quantity' },
          grossRevenue: { $sum: '$grossRevenue' },
          platformFee: { $sum: '$platformFee' },
          adminRevenue: { $sum: '$adminRevenue' },
          ordersCount: { $sum: 1 },
        },
      },
    ]);

    const statsMap = {};
    transactionStats.forEach((s) => {
      statsMap[s._id.toString()] = s;
    });

    const itemBreakdown = ownedListings.map((item) => {
      const stats = statsMap[item._id.toString()] || {};
      return {
        _id: item._id,
        title: item.title,
        categoryType: item.categoryType,
        images: item.images,
        location: item.location,
        isActive: item.isActive,
        ticketsSold: stats.ticketsSold || 0,
        grossRevenue: stats.grossRevenue || 0,
        platformFee: stats.platformFee || 0,
        adminRevenue: stats.adminRevenue || 0,
        ordersCount: stats.ordersCount || 0,
      };
    });

    return successResponse(res, 200, 'Item revenue breakdown retrieved', {
      items: itemBreakdown,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Detailed Revenue & Transactions for Single Item
// @route   GET /api/v1/admin/revenue/items/:itemId
// @access  Private/Admin
export const getAdminRevenueItemDetails = async (req, res, next) => {
  try {
    const isSuperAdmin = req.user.role?.toUpperCase() === 'SUPER_ADMIN';
    const listing = await Listing.findById(req.params.itemId);

    if (!listing) {
      return errorResponse(res, 404, 'Item/Listing not found');
    }

    if (
      listing.createdBy &&
      listing.createdBy.toString() !== req.user._id.toString() &&
      !isSuperAdmin
    ) {
      return errorResponse(res, 403, 'Not authorized to view revenue details for this item');
    }

    const transactions = await Transaction.find({ listing: listing._id })
      .populate('user', 'name email phone')
      .sort('-createdAt');

    const paidTransactions = transactions.filter((t) => t.status === 'paid');
    const grossRevenue = paidTransactions.reduce((sum, t) => sum + t.grossRevenue, 0);
    const platformFee = paidTransactions.reduce((sum, t) => sum + t.platformFee, 0);
    const adminRevenue = paidTransactions.reduce((sum, t) => sum + t.adminRevenue, 0);
    const ticketsSold = paidTransactions.reduce((sum, t) => sum + t.quantity, 0);

    return successResponse(res, 200, 'Item detailed revenue retrieved', {
      item: {
        _id: listing._id,
        title: listing.title,
        categoryType: listing.categoryType,
        location: listing.location,
        createdAt: listing.createdAt,
      },
      metrics: {
        ticketsSold,
        grossRevenue,
        platformFee,
        adminRevenue,
        totalOrders: paidTransactions.length,
      },
      transactions,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Admin Transactions List (Paginated, Search, Filters)
// @route   GET /api/v1/admin/revenue/transactions
// @access  Private/Admin
export const getAdminTransactions = async (req, res, next) => {
  try {
    const isSuperAdmin = req.user.role?.toUpperCase() === 'SUPER_ADMIN';
    const targetAdminId = isSuperAdmin && req.query.adminId ? req.query.adminId : req.user._id;

    const {
      status,
      search,
      itemId,
      timeframe,
      startDate,
      endDate,
      page = 1,
      limit = 15,
    } = req.query;

    const query = { adminId: targetAdminId };

    if (status && status !== 'all') {
      query.status = status;
    }

    if (itemId) {
      query.listing = itemId;
    }

    const dateRange = getDateRangeQuery(timeframe, startDate, endDate);
    if (dateRange) {
      query.createdAt = dateRange;
    }

    if (search) {
      query.$or = [
        { bookingReference: { $regex: search, $options: 'i' } },
        { itemName: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Transaction.countDocuments(query);
    const transactions = await Transaction.find(query)
      .populate('user', 'name email phone')
      .populate('listing', 'title categoryType images')
      .sort('-createdAt')
      .skip(skip)
      .limit(limitNum);

    return successResponse(
      res,
      200,
      'Admin transactions retrieved',
      { transactions },
      {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      }
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Export Admin Transactions to CSV
// @route   GET /api/v1/admin/revenue/export
// @access  Private/Admin
export const exportAdminTransactionsCSV = async (req, res, next) => {
  try {
    const isSuperAdmin = req.user.role?.toUpperCase() === 'SUPER_ADMIN';
    const targetAdminId = isSuperAdmin && req.query.adminId ? req.query.adminId : req.user._id;

    const transactions = await Transaction.find({ adminId: targetAdminId })
      .populate('user', 'name email')
      .sort('-createdAt');

    let csvContent = 'Booking Reference,Item Name,Category,Quantity,Unit Price (INR),Gross Revenue (INR),Platform Fee (INR),Net Admin Revenue (INR),Status,Customer Name,Customer Email,Date\n';

    transactions.forEach((t) => {
      const row = [
        `"${t.bookingReference || ''}"`,
        `"${(t.itemName || '').replace(/"/g, '""')}"`,
        `"${t.categoryType || ''}"`,
        t.quantity || 1,
        t.unitPrice || 0,
        t.grossRevenue || 0,
        t.platformFee || 0,
        t.adminRevenue || 0,
        `"${t.status}"`,
        `"${(t.user?.name || '').replace(/"/g, '""')}"`,
        `"${t.user?.email || ''}"`,
        `"${new Date(t.createdAt).toISOString()}"`,
      ];
      csvContent += row.join(',') + '\n';
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=Admin_Revenue_Transactions_${Date.now()}.csv`);
    return res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};
