const Banner = require('../models/Banner');
const ApiResponse = require('../utils/response');
const logger = require('../utils/logger');

/**
 * Get all banners (admin)
 */
exports.getAllBanners = async (req, res, next) => {
  try {
    const { isActive } = req.query;

    const query = {};
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const banners = await Banner.find(query)
      .sort({ priority: -1, createdAt: -1 })
      .lean();

    return ApiResponse.success(res, banners);
  } catch (error) {
    next(error);
  }
};

/**
 * Get single banner
 */
exports.getBanner = async (req, res, next) => {
  try {
    const { id } = req.params;

    const banner = await Banner.findById(id);

    if (!banner) {
      return ApiResponse.notFound(res, 'Banner');
    }

    return ApiResponse.success(res, banner);
  } catch (error) {
    next(error);
  }
};

/**
 * Create banner
 */
exports.createBanner = async (req, res, next) => {
  try {
    const banner = await Banner.create(req.body);

    logger.info(`Banner created: ${banner.title} by ${req.admin.username}`);

    return ApiResponse.success(res, banner, 'Banner created successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Update banner
 */
exports.updateBanner = async (req, res, next) => {
  try {
    const { id } = req.params;

    const banner = await Banner.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    });

    if (!banner) {
      return ApiResponse.notFound(res, 'Banner');
    }

    logger.info(`Banner updated: ${banner.title} by ${req.admin.username}`);

    return ApiResponse.success(res, banner, 'Banner updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Delete banner
 */
exports.deleteBanner = async (req, res, next) => {
  try {
    const { id } = req.params;

    const banner = await Banner.findByIdAndDelete(id);

    if (!banner) {
      return ApiResponse.notFound(res, 'Banner');
    }

    logger.info(`Banner deleted: ${banner.title} by ${req.admin.username}`);

    return ApiResponse.success(res, null, 'Banner deleted successfully');
  } catch (error) {
    next(error);
  }
};

