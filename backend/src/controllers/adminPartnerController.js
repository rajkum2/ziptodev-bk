const DeliveryPartner = require('../models/DeliveryPartner');
const ApiResponse = require('../utils/response');
const { getPagination, buildPaginationResponse } = require('../utils/helpers');
const logger = require('../utils/logger');

/**
 * Get all delivery partners
 */
exports.getAllPartners = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, isActive } = req.query;
    const { skip, limit: limitNum } = getPagination(page, limit);

    const query = {};
    if (status) {
      query.status = status;
    }
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const [partners, total] = await Promise.all([
      DeliveryPartner.find(query)
        .populate('activeOrderId', 'orderId status')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      DeliveryPartner.countDocuments(query)
    ]);

    const pagination = buildPaginationResponse(page, limitNum, total);

    return ApiResponse.paginated(res, partners, pagination);
  } catch (error) {
    next(error);
  }
};

/**
 * Get single partner
 */
exports.getPartner = async (req, res, next) => {
  try {
    const { id } = req.params;

    const partner = await DeliveryPartner.findById(id)
      .populate('activeOrderId', 'orderId status deliveryAddress');

    if (!partner) {
      return ApiResponse.notFound(res, 'Delivery Partner');
    }

    return ApiResponse.success(res, partner);
  } catch (error) {
    next(error);
  }
};

/**
 * Create partner
 */
exports.createPartner = async (req, res, next) => {
  try {
    const partner = await DeliveryPartner.create(req.body);

    logger.info(`Partner created: ${partner.name} by ${req.admin.username}`);

    return ApiResponse.success(res, partner, 'Partner created successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Update partner
 */
exports.updatePartner = async (req, res, next) => {
  try {
    const { id } = req.params;

    const partner = await DeliveryPartner.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    });

    if (!partner) {
      return ApiResponse.notFound(res, 'Delivery Partner');
    }

    logger.info(`Partner updated: ${partner.name} by ${req.admin.username}`);

    return ApiResponse.success(res, partner, 'Partner updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Delete partner
 */
exports.deletePartner = async (req, res, next) => {
  try {
    const { id } = req.params;

    const partner = await DeliveryPartner.findById(id);

    if (!partner) {
      return ApiResponse.notFound(res, 'Delivery Partner');
    }

    if (partner.activeOrderId) {
      return ApiResponse.error(
        res,
        'Cannot delete partner with active order',
        'PARTNER_HAS_ACTIVE_ORDER',
        400
      );
    }

    await partner.deleteOne();

    logger.info(`Partner deleted: ${partner.name} by ${req.admin.username}`);

    return ApiResponse.success(res, null, 'Partner deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Update partner status
 */
exports.updatePartnerStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const partner = await DeliveryPartner.findById(id);

    if (!partner) {
      return ApiResponse.notFound(res, 'Delivery Partner');
    }

    partner.status = status;
    await partner.save();

    logger.info(`Partner ${partner.name} status changed to ${status} by ${req.admin.username}`);

    return ApiResponse.success(res, partner, 'Status updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Update partner location (for dev/simulation)
 */
exports.updatePartnerLocation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { longitude, latitude } = req.body;

    const partner = await DeliveryPartner.findById(id);

    if (!partner) {
      return ApiResponse.notFound(res, 'Delivery Partner');
    }

    await partner.updateLocation(longitude, latitude);

    logger.debug(`Partner ${partner.name} location updated`);

    // TODO: Emit socket event for location update

    return ApiResponse.success(res, partner, 'Location updated successfully');
  } catch (error) {
    next(error);
  }
};

