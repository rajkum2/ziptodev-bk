const Shelf = require('../models/Shelf');
const Product = require('../models/Product');
const ApiResponse = require('../utils/response');
const logger = require('../utils/logger');

/**
 * Get all shelves (admin)
 */
exports.getAllShelves = async (req, res, next) => {
  try {
    const { isActive } = req.query;

    const query = {};
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const shelves = await Shelf.find(query)
      .sort({ priority: -1 })
      .populate('productIds', 'name slug brand images')
      .lean();

    return ApiResponse.success(res, shelves);
  } catch (error) {
    next(error);
  }
};

/**
 * Get single shelf
 */
exports.getShelf = async (req, res, next) => {
  try {
    const { id } = req.params;

    const shelf = await Shelf.findById(id)
      .populate('productIds', 'name slug brand images variants');

    if (!shelf) {
      return ApiResponse.notFound(res, 'Shelf');
    }

    return ApiResponse.success(res, shelf);
  } catch (error) {
    next(error);
  }
};

/**
 * Create shelf
 */
exports.createShelf = async (req, res, next) => {
  try {
    const shelf = await Shelf.create(req.body);

    logger.info(`Shelf created: ${shelf.title} by ${req.admin.username}`);

    return ApiResponse.success(res, shelf, 'Shelf created successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Update shelf
 */
exports.updateShelf = async (req, res, next) => {
  try {
    const { id } = req.params;

    const shelf = await Shelf.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    });

    if (!shelf) {
      return ApiResponse.notFound(res, 'Shelf');
    }

    logger.info(`Shelf updated: ${shelf.title} by ${req.admin.username}`);

    return ApiResponse.success(res, shelf, 'Shelf updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Delete shelf
 */
exports.deleteShelf = async (req, res, next) => {
  try {
    const { id } = req.params;

    const shelf = await Shelf.findByIdAndDelete(id);

    if (!shelf) {
      return ApiResponse.notFound(res, 'Shelf');
    }

    logger.info(`Shelf deleted: ${shelf.title} by ${req.admin.username}`);

    return ApiResponse.success(res, null, 'Shelf deleted successfully');
  } catch (error) {
    next(error);
  }
};

