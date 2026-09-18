import Coupon from '../models/Coupon.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

// @desc    Validate coupon code
// @route   POST /api/v1/coupons/validate
// @access  Private
export const validateCoupon = async (req, res, next) => {
  try {
    const { code, bookingAmount = 0 } = req.body;

    if (!code) {
      return errorResponse(res, 400, 'Please enter a coupon code');
    }

    const coupon = await Coupon.findOne({
      code: code.toUpperCase().trim(),
      isActive: true,
      validTill: { $gt: new Date() },
    });

    if (!coupon) {
      return errorResponse(res, 404, 'Invalid or expired coupon code');
    }

    if (bookingAmount < coupon.minBookingAmount) {
      return errorResponse(
        res,
        400,
        `Minimum booking amount of ₹${coupon.minBookingAmount} required for coupon '${coupon.code}'`
      );
    }

    const calculatedDiscount = (bookingAmount * coupon.discountPercent) / 100;
    const discountAmount = Math.min(calculatedDiscount, coupon.maxDiscount);

    return successResponse(res, 200, 'Coupon applied successfully!', {
      code: coupon.code,
      discountPercent: coupon.discountPercent,
      discountAmount,
      maxDiscount: coupon.maxDiscount,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all coupons (Admin)
// @route   GET /api/v1/coupons
// @access  Private/Admin
export const getCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find().sort('-createdAt');
    return successResponse(res, 200, 'Coupons list', { coupons });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new coupon (Admin)
// @route   POST /api/v1/coupons
// @access  Private/Admin
export const createCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.create(req.body);
    return successResponse(res, 201, 'Coupon created successfully', { coupon });
  } catch (error) {
    next(error);
  }
};
