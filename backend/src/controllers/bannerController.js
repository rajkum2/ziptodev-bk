const Banner = require('../models/Banner');
const ApiResponse = require('../utils/response');

/**
 * Get active banners
 */
exports.getBanners = async (req, res, next) => {
  try {
    const now = new Date();

    const banners = await Banner.find({
      isActive: true,
      $or: [
        { startDate: { $lte: now }, $or: [{ endDate: { $gte: now } }, { endDate: null }] },
        { startDate: null }
      ]
    })
      .sort({ priority: -1 })
      .select('-__v')
      .lean();

    return ApiResponse.success(res, banners);
  } catch (error) {
    next(error);
  }
};

