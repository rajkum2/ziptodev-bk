const Category = require('../models/Category');
const ApiResponse = require('../utils/response');

/**
 * Get all active categories
 */
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true })
      .sort({ priority: -1 })
      .select('-__v')
      .lean();

    return ApiResponse.success(res, categories);
  } catch (error) {
    next(error);
  }
};

/**
 * Get category by slug
 */
exports.getCategoryBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const category = await Category.findOne({ slug, isActive: true });

    if (!category) {
      return ApiResponse.notFound(res, 'Category');
    }

    return ApiResponse.success(res, category);
  } catch (error) {
    next(error);
  }
};

