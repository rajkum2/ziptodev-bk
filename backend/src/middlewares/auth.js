const { verifyToken, verifyAdminToken } = require('../utils/jwt');
const Admin = require('../models/Admin');
const User = require('../models/User');
const ApiResponse = require('../utils/response');
const logger = require('../utils/logger');

/**
 * Middleware to authenticate user (customer)
 */
const authenticateUser = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return ApiResponse.unauthorized(res, 'No token provided');
    }

    const token = authHeader.substring(7);

    // Verify token
    const decoded = verifyToken(token);

    // Get user from database
    const user = await User.findById(decoded.userId);

    if (!user) {
      return ApiResponse.unauthorized(res, 'User not found');
    }

    if (user.status === 'blocked') {
      return ApiResponse.forbidden(res, 'Account has been blocked');
    }

    // Attach user to request
    req.user = user;
    req.userId = user._id;

    next();
  } catch (error) {
    logger.error('User authentication error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return ApiResponse.unauthorized(res, 'Invalid token');
    }
    
    if (error.name === 'TokenExpiredError') {
      return ApiResponse.unauthorized(res, 'Token expired');
    }

    return ApiResponse.unauthorized(res, 'Authentication failed');
  }
};

/**
 * Middleware to authenticate admin
 */
const authenticateAdmin = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return ApiResponse.unauthorized(res, 'No token provided');
    }

    const token = authHeader.substring(7);

    // Verify admin token
    const decoded = verifyAdminToken(token);

    // Get admin from database
    const admin = await Admin.findById(decoded.adminId);

    if (!admin) {
      return ApiResponse.unauthorized(res, 'Admin not found');
    }

    if (!admin.isActive) {
      return ApiResponse.forbidden(res, 'Account has been deactivated');
    }

    // Attach admin to request
    req.admin = admin;
    req.adminId = admin._id;
    req.adminRole = admin.role;
    req.adminPermissions = admin.permissions || [];

    next();
  } catch (error) {
    logger.error('Admin authentication error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return ApiResponse.unauthorized(res, 'Invalid token');
    }
    
    if (error.name === 'TokenExpiredError') {
      return ApiResponse.unauthorized(res, 'Token expired');
    }

    return ApiResponse.unauthorized(res, 'Authentication failed');
  }
};

/**
 * Middleware to check admin permissions
 */
const checkPermission = (...requiredPermissions) => {
  return (req, res, next) => {
    // Super admin has all permissions
    if (req.adminRole === 'super_admin') {
      return next();
    }

    // Check if admin has at least one of the required permissions
    const hasPermission = requiredPermissions.some(permission =>
      req.adminPermissions.includes(permission)
    );

    if (!hasPermission) {
      return ApiResponse.forbidden(
        res,
        'You do not have permission to perform this action'
      );
    }

    next();
  };
};

/**
 * Middleware to check admin role
 */
const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.adminRole)) {
      return ApiResponse.forbidden(
        res,
        'You do not have the required role to perform this action'
      );
    }

    next();
  };
};

/**
 * Optional authentication - doesn't fail if no token
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = verifyToken(token);
      const user = await User.findById(decoded.userId);
      
      if (user && user.status === 'active') {
        req.user = user;
        req.userId = user._id;
      }
    }
  } catch (error) {
    // Silent fail for optional auth
    logger.debug('Optional auth failed:', error.message);
  }
  
  next();
};

module.exports = {
  authenticateUser,
  authenticateAdmin,
  checkPermission,
  checkRole,
  optionalAuth
};

