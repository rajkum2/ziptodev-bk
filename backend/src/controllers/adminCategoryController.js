const Category = require('../models/Category');
const Product = require('../models/Product');
const ApiResponse = require('../utils/response');
const { generateSlug } = require('../utils/helpers');
const AuditLogger = require('../utils/auditLog');
const logger = require('../utils/logger');

/**
 * Get all categories (admin)
 */
exports.getAllCategories = async (req, res, next) => {
  try {
    const { isActive } = req.query;

    const query = {};
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const categories = await Category.find(query)
      .sort({ priority: -1, name: 1 })
      .lean();

    // Add product count for each category
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const productCount = await Product.countDocuments({
          categoryId: category._id,
          isActive: true
        });
        return { ...category, productCount };
      })
    );

    return ApiResponse.success(res, categoriesWithCount);
  } catch (error) {
    next(error);
  }
};

/**
 * Get single category
 */
exports.getCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);

    if (!category) {
      return ApiResponse.notFound(res, 'Category');
    }

    return ApiResponse.success(res, category);
  } catch (error) {
    next(error);
  }
};

/**
 * Create category
 */
exports.createCategory = async (req, res, next) => {
  try {
    const {
      name,
      slug: customSlug,
      icon,
      image,
      color,
      priority = 0,
      isActive = true,
      description
    } = req.body;

    // Generate slug if not provided
    const slug = customSlug || generateSlug(name);

    // Check if slug already exists
    const existingCategory = await Category.findOne({ slug });
    if (existingCategory) {
      return ApiResponse.error(
        res,
        'Category with this slug already exists',
        'DUPLICATE_SLUG',
        409
      );
    }

    const category = await Category.create({
      name,
      slug,
      icon,
      image,
      color,
      priority,
      isActive,
      description
    });

    logger.info(`Category created: ${category.name} by ${req.admin.username}`);

    return ApiResponse.success(
      res,
      category,
      'Category created successfully',
      201
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Update category
 */
exports.updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const category = await Category.findById(id);

    if (!category) {
      return ApiResponse.notFound(res, 'Category');
    }

    // If updating slug, check for duplicates
    if (updates.slug && updates.slug !== category.slug) {
      const existingCategory = await Category.findOne({ slug: updates.slug });
      if (existingCategory) {
        return ApiResponse.error(
          res,
          'Category with this slug already exists',
          'DUPLICATE_SLUG',
          409
        );
      }
    }

    Object.assign(category, updates);
    await category.save();

    logger.info(`Category updated: ${category.name} by ${req.admin.username}`);

    return ApiResponse.success(res, category, 'Category updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Delete category
 */
exports.deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);

    if (!category) {
      return ApiResponse.notFound(res, 'Category');
    }

    // Check if category has products
    const productCount = await Product.countDocuments({ categoryId: id });

    if (productCount > 0) {
      return ApiResponse.error(
        res,
        `Cannot delete category with ${productCount} products`,
        'CATEGORY_HAS_PRODUCTS',
        400
      );
    }

    await category.deleteOne();

    logger.info(`Category deleted: ${category.name} by ${req.admin.username}`);

    return ApiResponse.success(res, null, 'Category deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Reorder categories
 */
exports.reorderCategories = async (req, res, next) => {
  try {
    const { categories } = req.body; // Array of { id, priority }

    if (!Array.isArray(categories)) {
      return ApiResponse.error(res, 'Invalid data format', 'INVALID_DATA', 400);
    }

    // Update priorities
    await Promise.all(
      categories.map(({ id, priority }) =>
        Category.findByIdAndUpdate(id, { priority })
      )
    );

    logger.info(`Categories reordered by ${req.admin.username}`);

    return ApiResponse.success(res, null, 'Categories reordered successfully');
  } catch (error) {
    next(error);
  }
};

