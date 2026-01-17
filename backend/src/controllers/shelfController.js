const Shelf = require('../models/Shelf');
const Product = require('../models/Product');
const ApiResponse = require('../utils/response');

/**
 * Get active shelves with products
 */
exports.getShelves = async (req, res, next) => {
  try {
    const shelves = await Shelf.find({ isActive: true })
      .sort({ priority: -1 })
      .populate({
        path: 'productIds',
        match: { isActive: true },
        select: 'name slug brand images variants categoryId',
        populate: { path: 'categoryId', select: 'name slug' }
      })
      .lean();

    return ApiResponse.success(res, shelves);
  } catch (error) {
    next(error);
  }
};

