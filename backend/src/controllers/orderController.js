const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const ServiceableLocation = require('../models/ServiceableLocation');
const ApiResponse = require('../utils/response');
const { getPagination, buildPaginationResponse, calculateOrderPricing, generateOrderId } = require('../utils/helpers');
const logger = require('../utils/logger');

/**
 * Create order
 */
exports.createOrder = async (req, res, next) => {
  try {
    const {
      items,
      deliveryAddress,
      payment,
      instructions,
      needBag = false,
      tip = 0
    } = req.body;

    // Validate items and fetch product details
    const orderItems = [];
    for (const item of items) {
      const product = await Product.findById(item.productId);
      
      if (!product || !product.isActive) {
        return ApiResponse.error(
          res,
          `Product ${item.productId} not available`,
          'PRODUCT_NOT_AVAILABLE',
          400
        );
      }

      const variant = product.variants.find(v => v.variantId === item.variantId);
      
      if (!variant) {
        return ApiResponse.error(
          res,
          `Variant not found for product ${product.name}`,
          'VARIANT_NOT_FOUND',
          400
        );
      }

      if (!variant.inStock) {
        return ApiResponse.error(
          res,
          `${product.name} - ${variant.name} is out of stock`,
          'OUT_OF_STOCK',
          400
        );
      }

      orderItems.push({
        productId: product._id,
        variantId: variant.variantId,
        name: product.name,
        variantLabel: variant.name,
        quantity: item.quantity,
        price: variant.price,
        mrp: variant.mrp,
        image: product.images[0]?.url
      });
    }

    // Check serviceability
    const location = await ServiceableLocation.findOne({
      pincode: deliveryAddress.pincode,
      isServiceable: true
    });

    if (!location) {
      return ApiResponse.error(
        res,
        'Delivery not available at this location',
        'LOCATION_NOT_SERVICEABLE',
        400
      );
    }

    // Calculate pricing
    const pricing = calculateOrderPricing(orderItems, tip);

    // Create order
    const order = await Order.create({
      orderId: generateOrderId(),
      userId: req.userId,
      items: orderItems,
      deliveryAddress,
      payment: {
        method: payment.method,
        status: payment.method === 'cod' ? 'pending' : 'pending'
      },
      pricing,
      status: 'placed',
      statusHistory: [{
        status: 'placed',
        timestamp: new Date(),
        note: 'Order placed successfully'
      }],
      instructions,
      needBag,
      estimatedDelivery: new Date(Date.now() + location.estimatedDeliveryTime * 60 * 1000)
    });

    await order.populate('userId', 'phone name');

    // Update user stats
    await User.findByIdAndUpdate(req.userId, {
      $inc: { totalOrders: 1, totalSpent: pricing.grandTotal }
    });

    // Update product sales
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { sales: item.quantity }
      });
    }

    logger.info(`Order created: ${order.orderId} by user ${req.userId}`);

    // TODO: Emit socket event for new order (will be implemented in socket module)

    return ApiResponse.success(
      res,
      order,
      'Order placed successfully',
      201
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get user orders
 */
exports.getOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const { skip, limit: limitNum } = getPagination(page, limit);

    const query = { userId: req.userId };
    if (status) {
      query.status = status;
    }

    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Order.countDocuments(query)
    ]);

    const pagination = buildPaginationResponse(page, limitNum, total);

    return ApiResponse.paginated(res, orders, pagination);
  } catch (error) {
    next(error);
  }
};

/**
 * Get order by ID
 */
exports.getOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({ orderId, userId: req.userId })
      .populate('deliveryPartnerId', 'name phone vehicleType currentLocation');

    if (!order) {
      return ApiResponse.notFound(res, 'Order');
    }

    return ApiResponse.success(res, order);
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel order
 */
exports.cancelOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;

    const order = await Order.findOne({ orderId, userId: req.userId });

    if (!order) {
      return ApiResponse.notFound(res, 'Order');
    }

    // Check if order can be cancelled
    if (['delivered', 'cancelled'].includes(order.status)) {
      return ApiResponse.error(
        res,
        'Order cannot be cancelled',
        'CANNOT_CANCEL',
        400
      );
    }

    order.status = 'cancelled';
    order.cancelReason = reason;
    order.cancelledAt = new Date();
    order.cancelledBy = req.userId;
    order.cancelledByModel = 'User';
    
    order.statusHistory.push({
      status: 'cancelled',
      timestamp: new Date(),
      note: `Cancelled by customer: ${reason}`
    });

    await order.save();

    logger.info(`Order cancelled: ${orderId} by user ${req.userId}`);

    return ApiResponse.success(res, order, 'Order cancelled successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Track order
 */
exports.trackOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({ orderId, userId: req.userId })
      .select('orderId status statusHistory deliveryPartnerId estimatedDelivery actualDelivery')
      .populate('deliveryPartnerId', 'name phone vehicleType currentLocation')
      .lean();

    if (!order) {
      return ApiResponse.notFound(res, 'Order');
    }

    return ApiResponse.success(res, order);
  } catch (error) {
    next(error);
  }
};

