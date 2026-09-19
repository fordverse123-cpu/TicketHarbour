import SearchLog from '../models/SearchLog.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

/**
 * Internal helper to record a search log entry asynchronously
 */
export const recordSearchLog = async ({
  userId = null,
  categoryType = 'train',
  from,
  to,
  fromCode = '',
  toCode = '',
  travelDate = '',
  searchParams = {},
  resultsCount = 0,
  ipAddress = '',
  userAgent = '',
}) => {
  try {
    if (!from || !to) return;
    await SearchLog.create({
      user: userId,
      categoryType,
      from: from.trim(),
      to: to.trim(),
      fromCode: fromCode ? fromCode.trim().toUpperCase() : '',
      toCode: toCode ? toCode.trim().toUpperCase() : '',
      travelDate,
      searchParams,
      resultsCount,
      ipAddress,
      userAgent,
    });
  } catch (err) {
    console.warn('[SearchLog] Failed to record search log entry:', err.message);
  }
};

/**
 * @desc    API Endpoint to explicitly log a user search
 * @route   POST /api/v1/searches/log or POST /api/searches/log
 * @access  Public (Optional Auth)
 */
export const logSearchEndpoint = async (req, res, next) => {
  try {
    const { categoryType = 'train', from, to, fromCode, toCode, travelDate, searchParams, resultsCount } = req.body;

    if (!from || !to) {
      return errorResponse(res, 400, 'Please provide both "from" and "to" parameters.');
    }

    const userId = req.user ? req.user._id : null;
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || '';
    const userAgent = req.headers['user-agent'] || '';

    await recordSearchLog({
      userId,
      categoryType,
      from,
      to,
      fromCode,
      toCode,
      travelDate,
      searchParams,
      resultsCount: resultsCount || 0,
      ipAddress,
      userAgent,
    });

    return successResponse(res, 201, 'Search logged successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get recent searches for the authenticated user or current IP
 * @route   GET /api/v1/searches/recent or GET /api/searches/recent
 * @access  Public (Optional Auth)
 */
export const getRecentSearches = async (req, res, next) => {
  try {
    const { categoryType } = req.query;
    const userId = req.user ? req.user._id : null;
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || '';

    const filter = {};
    if (categoryType) filter.categoryType = categoryType;

    if (userId) {
      filter.user = userId;
    } else if (ipAddress) {
      filter.ipAddress = ipAddress;
    } else {
      // Return global recent searches if guest
      filter.categoryType = categoryType || 'train';
    }

    const searches = await SearchLog.find(filter)
      .sort({ createdAt: -1 })
      .limit(6)
      .lean();

    // Deduplicate by route (from + to)
    const uniqueMap = new Map();
    const uniqueSearches = [];

    for (const item of searches) {
      const key = `${item.from.toLowerCase()}->${item.to.toLowerCase()}`;
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, true);
        uniqueSearches.push({
          _id: item._id,
          categoryType: item.categoryType,
          from: item.from,
          to: item.to,
          fromCode: item.fromCode,
          toCode: item.toCode,
          travelDate: item.travelDate,
          createdAt: item.createdAt,
        });
      }
    }

    return successResponse(res, 200, 'Recent searches fetched successfully', {
      count: uniqueSearches.length,
      searches: uniqueSearches,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get top popular searched routes per category
 * @route   GET /api/v1/searches/popular or GET /api/searches/popular
 * @access  Public
 */
export const getPopularSearchRoutes = async (req, res, next) => {
  try {
    const { categoryType = 'train', limit = 5 } = req.query;

    const popular = await SearchLog.aggregate([
      { $match: { categoryType } },
      {
        $group: {
          _id: { from: '$from', to: '$to', fromCode: '$fromCode', toCode: '$toCode' },
          searchCount: { $sum: 1 },
          lastSearchedAt: { $max: '$createdAt' },
        },
      },
      { $sort: { searchCount: -1, lastSearchedAt: -1 } },
      { $limit: parseInt(limit, 10) },
      {
        $project: {
          _id: 0,
          from: '$_id.from',
          to: '$_id.to',
          fromCode: '$_id.fromCode',
          toCode: '$_id.toCode',
          searchCount: 1,
        },
      },
    ]);

    return successResponse(res, 200, 'Popular search routes fetched successfully', {
      categoryType,
      routes: popular,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin Analytics: Get search volume & top analytics
 * @route   GET /api/v1/admin/searches/analytics or GET /api/admin/searches/analytics
 * @access  Private (Admin)
 */
export const getAdminSearchAnalytics = async (req, res, next) => {
  try {
    const totalSearches = await SearchLog.countDocuments();

    const searchesByCategory = await SearchLog.aggregate([
      {
        $group: {
          _id: '$categoryType',
          count: { $sum: 1 },
        },
      },
    ]);

    const topRoutesAll = await SearchLog.aggregate([
      {
        $group: {
          _id: { category: '$categoryType', from: '$from', to: '$to' },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $project: {
          _id: 0,
          category: '$_id.category',
          from: '$_id.from',
          to: '$_id.to',
          count: 1,
        },
      },
    ]);

    return successResponse(res, 200, 'Search analytics fetched successfully', {
      totalSearches,
      searchesByCategory,
      topRoutes: topRoutesAll,
    });
  } catch (error) {
    next(error);
  }
};
