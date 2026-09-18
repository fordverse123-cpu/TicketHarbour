import User from '../models/User.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

// @desc    Get user profile
// @route   GET /api/v1/users/profile
// @access  Private
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    return successResponse(res, 200, 'User profile retrieved', { user });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile details
// @route   PUT /api/v1/users/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;

    await user.save();

    return successResponse(res, 200, 'Profile updated successfully', { user });
  } catch (error) {
    next(error);
  }
};

// @desc    Change user password
// @route   PUT /api/v1/users/change-password
// @access  Private
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return errorResponse(res, 400, 'Please provide current and new password');
    }

    const user = await User.findById(req.user.id).select('+password');
    const isMatch = await user.matchPassword(currentPassword);

    if (!isMatch) {
      return errorResponse(res, 400, 'Current password is incorrect');
    }

    user.password = newPassword;
    await user.save();

    return successResponse(res, 200, 'Password changed successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users (Admin only)
// @route   GET /api/v1/users
// @access  Private/Admin
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort('-createdAt');
    return successResponse(res, 200, 'All users list', { users });
  } catch (error) {
    next(error);
  }
};
