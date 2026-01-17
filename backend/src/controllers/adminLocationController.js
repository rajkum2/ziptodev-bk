const ServiceableLocation = require('../models/ServiceableLocation');
const ApiResponse = require('../utils/response');
const { getPagination, buildPaginationResponse } = require('../utils/helpers');
const logger = require('../utils/logger');

/**
 * Get all locations (admin)
 */
exports.getAllLocations = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, city, isServiceable } = req.query;
    const { skip, limit: limitNum } = getPagination(page, limit);

    const query = {};
    if (city) {
      query.city = new RegExp(city, 'i');
    }
    if (isServiceable !== undefined) {
      query.isServiceable = isServiceable === 'true';
    }

    const [locations, total] = await Promise.all([
      ServiceableLocation.find(query)
        .sort({ city: 1, area: 1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      ServiceableLocation.countDocuments(query)
    ]);

    const pagination = buildPaginationResponse(page, limitNum, total);

    return ApiResponse.paginated(res, locations, pagination);
  } catch (error) {
    next(error);
  }
};

/**
 * Get single location
 */
exports.getLocation = async (req, res, next) => {
  try {
    const { id } = req.params;

    const location = await ServiceableLocation.findById(id);

    if (!location) {
      return ApiResponse.notFound(res, 'Location');
    }

    return ApiResponse.success(res, location);
  } catch (error) {
    next(error);
  }
};

/**
 * Create location
 */
exports.createLocation = async (req, res, next) => {
  try {
    const location = await ServiceableLocation.create(req.body);

    logger.info(`Location created: ${location.pincode} - ${location.area} by ${req.admin.username}`);

    return ApiResponse.success(res, location, 'Location created successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Update location
 */
exports.updateLocation = async (req, res, next) => {
  try {
    const { id } = req.params;

    const location = await ServiceableLocation.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    });

    if (!location) {
      return ApiResponse.notFound(res, 'Location');
    }

    logger.info(`Location updated: ${location.pincode} by ${req.admin.username}`);

    return ApiResponse.success(res, location, 'Location updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Delete location
 */
exports.deleteLocation = async (req, res, next) => {
  try {
    const { id } = req.params;

    const location = await ServiceableLocation.findByIdAndDelete(id);

    if (!location) {
      return ApiResponse.notFound(res, 'Location');
    }

    logger.info(`Location deleted: ${location.pincode} by ${req.admin.username}`);

    return ApiResponse.success(res, null, 'Location deleted successfully');
  } catch (error) {
    next(error);
  }
};

