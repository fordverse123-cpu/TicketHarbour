import Listing from '../models/Listing.js';
import Category from '../models/Category.js';
import Schedule from '../models/Schedule.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

// @desc    Get all listings with search, filter, sort, pagination
// @route   GET /api/v1/listings
// @access  Public
export const getListings = async (req, res, next) => {
  try {
    const {
      search,
      category,
      categoryType,
      city,
      source,
      destination,
      minPrice,
      maxPrice,
      rating,
      featured,
      sort = '-createdAt',
      page = 1,
      limit = 12,
    } = req.query;

    const query = { isActive: true };

    // Search keyword
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'location.city': { $regex: search, $options: 'i' } },
        { 'transitInfo.source': { $regex: search, $options: 'i' } },
        { 'transitInfo.destination': { $regex: search, $options: 'i' } },
      ];
    }

    // Category filter
    if (category) {
      const catObj = await Category.findOne({
        $or: [{ _id: category.match(/^[0-9a-fA-F]{24}$/) ? category : null }, { type: category }, { slug: category }],
      });
      if (catObj) {
        query.category = catObj._id;
      }
    }

    if (categoryType) {
      query.categoryType = categoryType;
    }

    // City filter
    if (city) {
      query['location.city'] = { $regex: city, $options: 'i' };
    }

    // Transit source and destination filter (Bus, Train, Flights)
    if (source) {
      query['transitInfo.source'] = { $regex: source, $options: 'i' };
    }
    if (destination) {
      query['transitInfo.destination'] = { $regex: destination, $options: 'i' };
    }

    // Rating filter
    if (rating) {
      query.rating = { $gte: Number(rating) };
    }

    // Featured filter
    if (featured === 'true') {
      query.isFeatured = true;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query['pricingTiers.price'] = {};
      if (minPrice) query['pricingTiers.price'].$gte = Number(minPrice);
      if (maxPrice) query['pricingTiers.price'].$lte = Number(maxPrice);
    }

    // Sorting options
    let sortOptions = {};
    if (sort === 'price-asc') {
      sortOptions = { 'pricingTiers.price': 1 };
    } else if (sort === 'price-desc') {
      sortOptions = { 'pricingTiers.price': -1 };
    } else if (sort === 'rating') {
      sortOptions = { rating: -1 };
    } else {
      sortOptions = { createdAt: -1 };
    }

    // Pagination
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Listing.countDocuments(query);
    const listings = await Listing.find(query)
      .populate('category', 'name type icon')
      .populate('venue', 'name city state address')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    return successResponse(
      res,
      200,
      'Listings retrieved',
      { listings },
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

// @desc    Get single listing details by ID or slug
// @route   GET /api/v1/listings/:identifier
// @access  Public
export const getListingByIdentifier = async (req, res, next) => {
  try {
    const { identifier } = req.params;
    const isId = identifier.match(/^[0-9a-fA-F]{24}$/);
    const query = isId ? { _id: identifier } : { slug: identifier };

    const listing = await Listing.findOne(query)
      .populate('category', 'name type icon')
      .populate('venue', 'name city state address seatConfig capacity');

    if (!listing) {
      return errorResponse(res, 404, 'Listing not found');
    }

    return successResponse(res, 200, 'Listing details', { listing });
  } catch (error) {
    next(error);
  }
};

// @desc    Get admin's owned listings (Normal Admin = owned only, Super Admin = all or filtered by admin)
// @route   GET /api/v1/listings/admin
// @access  Private/Admin
export const getAdminListings = async (req, res, next) => {
  try {
    const isSuperAdmin = req.user.role?.toUpperCase() === 'SUPER_ADMIN' || req.user.role === 'superadmin';
    const { categoryType, search, createdBy } = req.query;

    const query = {};

    if (!isSuperAdmin) {
      // Normal admins are strictly restricted to their own created listings
      query.createdBy = req.user._id;
    } else if (createdBy) {
      // Super Admin can filter by specific creator admin ID if requested
      query.createdBy = createdBy;
    }

    if (categoryType) {
      query.categoryType = categoryType;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'location.city': { $regex: search, $options: 'i' } },
      ];
    }

    const listings = await Listing.find(query)
      .populate('category', 'name type icon')
      .populate('venue', 'name city state address')
      .populate('createdBy', 'name email role')
      .sort('-createdAt');

    return successResponse(res, 200, 'Admin listings retrieved', { listings });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new listing (Admin)
// @route   POST /api/v1/listings
// @access  Private/Admin
export const createListing = async (req, res, next) => {
  try {
    const { scheduleDate, startTime, endTime, ...listingData } = req.body;

    // Never accept createdBy from body; assign directly from authenticated user
    delete listingData.createdBy;

    const listing = await Listing.create({
      ...listingData,
      createdBy: req.user._id,
    });

    // If initial schedule parameters are provided, automatically create schedule
    if (scheduleDate && startTime) {
      await Schedule.create({
        listing: listing._id,
        venue: listing.venue || null,
        date: new Date(scheduleDate),
        startTime,
        endTime: endTime || '',
        pricing: listing.pricingTiers?.map((t) => ({
          tierName: t.tierName,
          price: t.price,
          classType: t.classType || t.tierName,
          availableSeats: t.totalCapacity || 50,
        })) || [],
        seatMap: {
          bookedSeats: [],
          lockedSeats: [],
        },
      });
    }

    return successResponse(res, 201, 'Listing created successfully', { listing });
  } catch (error) {
    next(error);
  }
};

// @desc    Update listing (Admin)
// @route   PUT /api/v1/listings/:id
// @access  Private/Admin
export const updateListing = async (req, res, next) => {
  try {
    const existingListing = req.targetListing || (await Listing.findById(req.params.id));
    if (!existingListing) {
      return errorResponse(res, 404, 'Listing not found');
    }

    const isSuperAdmin = req.user.role?.toUpperCase() === 'SUPER_ADMIN' || req.user.role === 'superadmin';
    if (
      existingListing.createdBy &&
      existingListing.createdBy.toString() !== req.user._id.toString() &&
      !isSuperAdmin
    ) {
      return errorResponse(res, 403, 'You are not authorized to modify this listing');
    }

    // Strip createdBy from update payload to prevent ownership transfer tampering
    const updateData = { ...req.body };
    delete updateData.createdBy;

    const listing = await Listing.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).populate('createdBy', 'name email role');

    return successResponse(res, 200, 'Listing updated successfully', { listing });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete listing (Admin)
// @route   DELETE /api/v1/listings/:id
// @access  Private/Admin
export const deleteListing = async (req, res, next) => {
  try {
    const existingListing = req.targetListing || (await Listing.findById(req.params.id));
    if (!existingListing) {
      return errorResponse(res, 404, 'Listing not found');
    }

    const isSuperAdmin = req.user.role?.toUpperCase() === 'SUPER_ADMIN' || req.user.role === 'superadmin';
    if (
      existingListing.createdBy &&
      existingListing.createdBy.toString() !== req.user._id.toString() &&
      !isSuperAdmin
    ) {
      return errorResponse(res, 403, 'You are not authorized to delete this listing');
    }

    await Listing.findByIdAndDelete(req.params.id);

    return successResponse(res, 200, 'Listing deleted successfully');
  } catch (error) {
    next(error);
  }
};
