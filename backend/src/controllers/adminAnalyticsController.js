const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const Category = require('../models/Category');
const AnalyticsEvent = require('../models/AnalyticsEvent');
const DeliveryPartner = require('../models/DeliveryPartner');
const ApiResponse = require('../utils/response');
const logger = require('../utils/logger');

/**
 * Get dashboard overview
 */
exports.getOverview = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalOrdersToday,
      revenueToday,
      activeUsers,
      availablePartners
    ] = await Promise.all([
      Order.countDocuments({ createdAt: { $gte: today } }),
      Order.aggregate([
        { $match: { createdAt: { $gte: today }, status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$pricing.grandTotal' } } }
      ]),
      User.countDocuments({ status: 'active' }),
      DeliveryPartner.countDocuments({ status: 'available', isActive: true })
    ]);

    // Order status breakdown
    const statusBreakdown = await Order.aggregate([
      { $match: { createdAt: { $gte: today } } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Recent orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('userId', 'phone name')
      .select('orderId status pricing.grandTotal createdAt')
      .lean();

    // Top products
    const topProducts = await Product.find({ isActive: true })
      .sort({ sales: -1 })
      .limit(5)
      .select('name slug sales images')
      .lean();

    return ApiResponse.success(res, {
      stats: {
        totalOrdersToday,
        revenueToday: revenueToday[0]?.total || 0,
        activeUsers,
        availablePartners
      },
      statusBreakdown,
      recentOrders,
      topProducts
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get sales analytics
 */
exports.getSalesAnalytics = async (req, res, next) => {
  try {
    const { period = 'daily', startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    let groupBy;
    switch (period) {
      case 'hourly':
        groupBy = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' },
          hour: { $hour: '$createdAt' }
        };
        break;
      case 'daily':
        groupBy = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        };
        break;
      case 'monthly':
        groupBy = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        };
        break;
      default:
        groupBy = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        };
    }

    const salesData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
          status: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: groupBy,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$pricing.grandTotal' },
          avgOrderValue: { $avg: '$pricing.grandTotal' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.hour': 1 } }
    ]);

    return ApiResponse.success(res, salesData);
  } catch (error) {
    next(error);
  }
};

/**
 * Get product analytics
 */
exports.getProductAnalytics = async (req, res, next) => {
  try {
    const { limit = 20 } = req.query;

    const topProducts = await Product.find({ isActive: true })
      .sort({ sales: -1, views: -1 })
      .limit(parseInt(limit))
      .populate('categoryId', 'name slug')
      .select('name slug brand sales views images categoryId')
      .lean();

    const lowStockProducts = await Product.find({
      isActive: true,
      'variants.stock': { $lt: 10, $gt: 0 }
    })
      .limit(20)
      .select('name slug variants')
      .lean();

    return ApiResponse.success(res, {
      topProducts,
      lowStockProducts
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get category analytics
 */
exports.getCategoryAnalytics = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true }).lean();

    const categoryStats = await Promise.all(
      categories.map(async (category) => {
        const [productCount, totalSales, totalViews] = await Promise.all([
          Product.countDocuments({ categoryId: category._id, isActive: true }),
          Product.aggregate([
            { $match: { categoryId: category._id } },
            { $group: { _id: null, total: { $sum: '$sales' } } }
          ]),
          Product.aggregate([
            { $match: { categoryId: category._id } },
            { $group: { _id: null, total: { $sum: '$views' } } }
          ])
        ]);

        return {
          ...category,
          productCount,
          totalSales: totalSales[0]?.total || 0,
          totalViews: totalViews[0]?.total || 0
        };
      })
    );

    return ApiResponse.success(res, categoryStats);
  } catch (error) {
    next(error);
  }
};

/**
 * Get user analytics
 */
exports.getUserAnalytics = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ status: 'active' });
    const blockedUsers = await User.countDocuments({ status: 'blocked' });

    const topCustomers = await User.find({ status: 'active' })
      .sort({ totalSpent: -1 })
      .limit(10)
      .select('phone name totalOrders totalSpent')
      .lean();

    // New user registration trend
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const newUsersData = await User.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    return ApiResponse.success(res, {
      totalUsers,
      activeUsers,
      blockedUsers,
      topCustomers,
      newUsersData
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Export reports (stub)
 */
exports.exportReports = async (req, res, next) => {
  try {
    const { type, format = 'csv', startDate, endDate } = req.query;

    // TODO: Implement CSV/PDF export

    logger.info(`Report export requested: ${type} (${format}) by ${req.admin.username}`);

    return ApiResponse.success(
      res,
      { message: 'Report export feature coming soon' },
      'Export request recorded'
    );
  } catch (error) {
    next(error);
  }
};

