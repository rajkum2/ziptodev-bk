const Order = require('../models/Order');
const DeliveryPartner = require('../models/DeliveryPartner');
const ApiResponse = require('../utils/response');
const { getPagination, buildPaginationResponse } = require('../utils/helpers');
const AuditLogger = require('../utils/auditLog');
const logger = require('../utils/logger');

/**
 * Get all orders (admin) with advanced filters
 */
exports.getAllOrders = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      paymentMethod,
      paymentStatus,
      startDate,
      endDate,
      city,
      pincode,
      orderId,
      phone,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const { skip, limit: limitNum } = getPagination(page, limit);

    // Build query
    const query = {};

    if (status) {
      query.status = status;
    }

    if (paymentMethod) {
      query['payment.method'] = paymentMethod;
    }

    if (paymentStatus) {
      query['payment.status'] = paymentStatus;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    if (city) {
      query['deliveryAddress.city'] = new RegExp(city, 'i');
    }

    if (pincode) {
      query['deliveryAddress.pincode'] = pincode;
    }

    if (orderId) {
      query.orderId = new RegExp(orderId, 'i');
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query
    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('userId', 'phone name email')
        .populate('deliveryPartnerId', 'name phone vehicleType status')
        .sort(sort)
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
 * Get single order
 */
exports.getOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({ orderId })
      .populate('userId', 'phone name email addresses')
      .populate('deliveryPartnerId', 'name phone vehicleType status currentLocation rating')
      .populate('statusHistory.updatedBy', 'username');

    if (!order) {
      return ApiResponse.notFound(res, 'Order');
    }

    return ApiResponse.success(res, order);
  } catch (error) {
    next(error);
  }
};

/**
 * Update order status
 */
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { status, note } = req.body;

    const order = await Order.findOne({ orderId });

    if (!order) {
      return ApiResponse.notFound(res, 'Order');
    }

    const oldStatus = order.status;

    // Validate status transition
    const validTransitions = {
      placed: ['confirmed', 'cancelled'],
      confirmed: ['packing', 'cancelled'],
      packing: ['out_for_delivery', 'cancelled'],
      out_for_delivery: ['delivered', 'cancelled'],
      delivered: [],
      cancelled: []
    };

    if (!validTransitions[oldStatus].includes(status)) {
      return ApiResponse.error(
        res,
        `Cannot change status from ${oldStatus} to ${status}`,
        'INVALID_STATUS_TRANSITION',
        400
      );
    }

    order.status = status;
    
    order.statusHistory.push({
      status,
      timestamp: new Date(),
      note,
      updatedBy: req.adminId
    });

    // Set delivery time if delivered
    if (status === 'delivered') {
      order.actualDelivery = new Date();
      
      // Update partner stats
      if (order.deliveryPartnerId) {
        await DeliveryPartner.findByIdAndUpdate(order.deliveryPartnerId, {
          $inc: { totalDeliveries: 1, todayDeliveries: 1 },
          status: 'available',
          activeOrderId: null
        });
      }
    }

    if (status === 'cancelled') {
      order.cancelledAt = new Date();
      order.cancelledBy = req.adminId;
      order.cancelledByModel = 'Admin';
      order.cancelReason = note || 'Cancelled by admin';

      // Free up partner
      if (order.deliveryPartnerId) {
        await DeliveryPartner.findByIdAndUpdate(order.deliveryPartnerId, {
          status: 'available',
          activeOrderId: null
        });
      }
    }

    await order.save();

    // Audit log
    AuditLogger.logOrderStatusUpdate(
      req.admin,
      orderId,
      oldStatus,
      status,
      note
    );

    logger.info(`Order ${orderId} status changed from ${oldStatus} to ${status} by ${req.admin.username}`);

    // TODO: Emit socket event for status change

    return ApiResponse.success(res, order, 'Order status updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Assign delivery partner
 */
exports.assignPartner = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { partnerId } = req.body;

    const order = await Order.findOne({ orderId });

    if (!order) {
      return ApiResponse.notFound(res, 'Order');
    }

    const partner = await DeliveryPartner.findById(partnerId);

    if (!partner) {
      return ApiResponse.notFound(res, 'Delivery Partner');
    }

    if (!partner.isActive) {
      return ApiResponse.error(
        res,
        'Partner is not active',
        'PARTNER_INACTIVE',
        400
      );
    }

    if (partner.status === 'busy') {
      return ApiResponse.error(
        res,
        'Partner is currently busy',
        'PARTNER_BUSY',
        400
      );
    }

    // Unassign old partner if any
    if (order.deliveryPartnerId) {
      await DeliveryPartner.findByIdAndUpdate(order.deliveryPartnerId, {
        status: 'available',
        activeOrderId: null
      });
    }

    // Assign new partner
    order.deliveryPartnerId = partnerId;
    
    order.statusHistory.push({
      status: order.status,
      timestamp: new Date(),
      note: `Assigned to ${partner.name}`,
      updatedBy: req.adminId
    });

    await order.save();

    // Update partner status
    partner.status = 'busy';
    partner.activeOrderId = order._id;
    await partner.save();

    // Audit log
    AuditLogger.logPartnerAssignment(
      req.admin,
      orderId,
      partnerId,
      partner.name
    );

    logger.info(`Order ${orderId} assigned to partner ${partner.name} by ${req.admin.username}`);

    // TODO: Emit socket event for assignment

    return ApiResponse.success(res, order, 'Partner assigned successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Refund order (stub)
 */
exports.refundOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { amount, reason } = req.body;

    const order = await Order.findOne({ orderId });

    if (!order) {
      return ApiResponse.notFound(res, 'Order');
    }

    // TODO: Integrate with payment gateway for refund processing

    // Audit log
    AuditLogger.logRefund(req.admin, orderId, amount, reason);

    logger.info(`Refund initiated for order ${orderId} by ${req.admin.username}`);

    return ApiResponse.success(
      res,
      { message: 'Refund feature coming soon' },
      'Refund request recorded'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get order invoice (stub)
 */
exports.getInvoice = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({ orderId })
      .populate('userId', 'phone name email');

    if (!order) {
      return ApiResponse.notFound(res, 'Order');
    }

    // TODO: Generate PDF invoice

    return ApiResponse.success(
      res,
      { 
        message: 'Invoice generation coming soon',
        order 
      },
      'Invoice data retrieved'
    );
  } catch (error) {
    next(error);
  }
};

