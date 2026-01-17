const ServiceableLocation = require('../models/ServiceableLocation');
const ApiResponse = require('../utils/response');

/**
 * Check if location is serviceable
 */
exports.checkServiceability = async (req, res, next) => {
  try {
    const { pincode } = req.body;

    const location = await ServiceableLocation.findOne({
      pincode,
      isServiceable: true
    }).lean();

    if (!location) {
      return ApiResponse.success(
        res,
        { isServiceable: false },
        'Delivery not available at this location'
      );
    }

    return ApiResponse.success(
      res,
      {
        isServiceable: true,
        area: location.area,
        city: location.city,
        deliverySlots: location.deliverySlots,
        estimatedDeliveryTime: location.estimatedDeliveryTime,
        deliveryFee: location.deliveryFee
      },
      'Delivery available'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get all serviceable locations
 */
exports.getServiceableLocations = async (req, res, next) => {
  try {
    const { city } = req.query;

    const query = { isServiceable: true };
    if (city) {
      query.city = new RegExp(city, 'i');
    }

    const locations = await ServiceableLocation.find(query)
      .select('pincode area city state estimatedDeliveryTime')
      .sort({ city: 1, area: 1 })
      .lean();

    return ApiResponse.success(res, locations);
  } catch (error) {
    next(error);
  }
};

