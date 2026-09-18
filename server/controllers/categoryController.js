import Category from '../models/Category.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

// @desc    Get all categories
// @route   GET /api/v1/categories
// @access  Public
export const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true }).sort('name');
    return successResponse(res, 200, 'Categories retrieved', { categories });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single category by slug or ID
// @route   GET /api/v1/categories/:identifier
// @access  Public
export const getCategoryByIdentifier = async (req, res, next) => {
  try {
    const { identifier } = req.params;
    const isId = identifier.match(/^[0-9a-fA-F]{24}$/);
    const query = isId ? { _id: identifier } : { slug: identifier };

    const category = await Category.findOne(query);
    if (!category) {
      return errorResponse(res, 404, 'Category not found');
    }

    return successResponse(res, 200, 'Category details', { category });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new category (Admin)
// @route   POST /api/v1/categories
// @access  Private/Admin
export const createCategory = async (req, res, next) => {
  try {
    const { name, type, icon, description } = req.body;

    const existing = await Category.findOne({ type });
    if (existing) {
      return errorResponse(res, 400, `Category with type '${type}' already exists`);
    }

    const category = await Category.create({ name, type, icon, description });
    return successResponse(res, 201, 'Category created successfully', { category });
  } catch (error) {
    next(error);
  }
};
