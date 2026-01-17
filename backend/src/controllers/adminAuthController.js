const Admin = require('../models/Admin');
const { generateAdminToken } = require('../utils/jwt');
const ApiResponse = require('../utils/response');
const AuditLogger = require('../utils/auditLog');
const logger = require('../utils/logger');

/**
 * Admin login
 */
exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Find admin with password field
    const admin = await Admin.findOne({ 
      $or: [
        { username: username.toLowerCase() },
        { email: username.toLowerCase() }
      ]
    }).select('+password');

    if (!admin) {
      return ApiResponse.error(
        res,
        'Invalid credentials',
        'INVALID_CREDENTIALS',
        401
      );
    }

    if (!admin.isActive) {
      return ApiResponse.forbidden(res, 'Account has been deactivated');
    }

    // Compare password
    const isPasswordValid = await admin.comparePassword(password);

    if (!isPasswordValid) {
      return ApiResponse.error(
        res,
        'Invalid credentials',
        'INVALID_CREDENTIALS',
        401
      );
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    // Generate token
    const token = generateAdminToken({
      adminId: admin._id,
      role: admin.role,
      permissions: admin.permissions
    });

    // Audit log
    AuditLogger.logAdminLogin(admin, req.ip, req.headers['user-agent']);

    return ApiResponse.success(
      res,
      {
        admin: {
          id: admin._id,
          username: admin.username,
          email: admin.email,
          role: admin.role,
          permissions: admin.permissions,
          firstName: admin.firstName,
          lastName: admin.lastName,
          avatar: admin.avatar
        },
        token
      },
      'Login successful'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Admin logout
 */
exports.logout = async (req, res, next) => {
  try {
    // Audit log
    AuditLogger.logAdminLogout(req.admin, req.ip);

    // In a production app with Redis, you would blacklist the token here

    return ApiResponse.success(res, null, 'Logout successful');
  } catch (error) {
    next(error);
  }
};

/**
 * Get admin profile
 */
exports.getMe = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.adminId).select('-password');

    if (!admin) {
      return ApiResponse.notFound(res, 'Admin');
    }

    return ApiResponse.success(
      res,
      {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions,
        firstName: admin.firstName,
        lastName: admin.lastName,
        avatar: admin.avatar,
        lastLogin: admin.lastLogin,
        createdAt: admin.createdAt
      },
      'Profile retrieved successfully'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Update admin profile
 */
exports.updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, email } = req.body;

    const admin = await Admin.findById(req.adminId);

    if (!admin) {
      return ApiResponse.notFound(res, 'Admin');
    }

    if (firstName !== undefined) admin.firstName = firstName;
    if (lastName !== undefined) admin.lastName = lastName;
    if (email !== undefined) admin.email = email;

    await admin.save();

    return ApiResponse.success(
      res,
      {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        firstName: admin.firstName,
        lastName: admin.lastName
      },
      'Profile updated successfully'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Change password
 */
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const admin = await Admin.findById(req.adminId).select('+password');

    if (!admin) {
      return ApiResponse.notFound(res, 'Admin');
    }

    // Verify current password
    const isPasswordValid = await admin.comparePassword(currentPassword);

    if (!isPasswordValid) {
      return ApiResponse.error(
        res,
        'Current password is incorrect',
        'INVALID_PASSWORD',
        400
      );
    }

    // Update password
    admin.password = newPassword;
    await admin.save();

    logger.info(`Admin ${admin.username} changed password`);

    return ApiResponse.success(res, null, 'Password changed successfully');
  } catch (error) {
    next(error);
  }
};

