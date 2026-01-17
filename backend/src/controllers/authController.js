const User = require('../models/User');
const { generateToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { generateOTP, sanitizePhone } = require('../utils/helpers');
const ApiResponse = require('../utils/response');
const logger = require('../utils/logger');

// In-memory OTP store (use Redis in production)
const otpStore = new Map();

/**
 * Send OTP to user's phone
 */
exports.sendOTP = async (req, res, next) => {
  try {
    const { phone } = req.body;
    const sanitizedPhone = sanitizePhone(phone);

    // Generate OTP
    const otp = generateOTP(6);
    const expiresAt = Date.now() + (parseInt(process.env.OTP_EXPIRY_MINUTES) || 5) * 60 * 1000;

    // Store OTP
    otpStore.set(sanitizedPhone, { otp, expiresAt });

    // TODO: Integrate with SMS provider (Twilio, SNS, MSG91, etc.)
    logger.info(`OTP for ${sanitizedPhone}: ${otp}`);

    // In development, return OTP (remove in production)
    const responseData = process.env.NODE_ENV === 'development' 
      ? { otp } 
      : {};

    return ApiResponse.success(
      res,
      responseData,
      'OTP sent successfully'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Verify OTP and login/register user
 */
exports.verifyOTP = async (req, res, next) => {
  try {
    const { phone, otp } = req.body;
    const sanitizedPhone = sanitizePhone(phone);

    // Check OTP
    const storedOTP = otpStore.get(sanitizedPhone);

    if (!storedOTP) {
      return ApiResponse.error(res, 'OTP not found or expired', 'OTP_NOT_FOUND', 400);
    }

    if (storedOTP.expiresAt < Date.now()) {
      otpStore.delete(sanitizedPhone);
      return ApiResponse.error(res, 'OTP has expired', 'OTP_EXPIRED', 400);
    }

    if (storedOTP.otp !== otp) {
      return ApiResponse.error(res, 'Invalid OTP', 'INVALID_OTP', 400);
    }

    // Delete OTP after verification
    otpStore.delete(sanitizedPhone);

    // Find or create user
    let user = await User.findOne({ phone: sanitizedPhone });

    if (!user) {
      user = await User.create({
        phone: sanitizedPhone,
        status: 'active'
      });
      logger.info(`New user registered: ${sanitizedPhone}`);
    }

    if (user.status === 'blocked') {
      return ApiResponse.forbidden(res, 'Your account has been blocked');
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate tokens
    const token = generateToken({ userId: user._id });
    const refreshToken = generateRefreshToken({ userId: user._id });

    return ApiResponse.success(
      res,
      {
        user: {
          id: user._id,
          phone: user.phone,
          name: user.name,
          email: user.email
        },
        token,
        refreshToken
      },
      'Login successful'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh access token
 */
exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return ApiResponse.error(res, 'Refresh token required', 'TOKEN_REQUIRED', 400);
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Get user
    const user = await User.findById(decoded.userId);

    if (!user) {
      return ApiResponse.unauthorized(res, 'User not found');
    }

    if (user.status === 'blocked') {
      return ApiResponse.forbidden(res, 'Account has been blocked');
    }

    // Generate new tokens
    const newToken = generateToken({ userId: user._id });
    const newRefreshToken = generateRefreshToken({ userId: user._id });

    return ApiResponse.success(
      res,
      {
        token: newToken,
        refreshToken: newRefreshToken
      },
      'Token refreshed successfully'
    );
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return ApiResponse.unauthorized(res, 'Invalid or expired refresh token');
    }
    next(error);
  }
};

/**
 * Get user profile
 */
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select('-__v');

    if (!user) {
      return ApiResponse.notFound(res, 'User');
    }

    return ApiResponse.success(res, user, 'Profile retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Update user profile
 */
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body;

    const user = await User.findById(req.userId);

    if (!user) {
      return ApiResponse.notFound(res, 'User');
    }

    if (name) user.name = name;
    if (email) user.email = email;

    await user.save();

    return ApiResponse.success(
      res,
      user,
      'Profile updated successfully'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Add address
 */
exports.addAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return ApiResponse.notFound(res, 'User');
    }

    // If this is the first address or isDefault is true, set as default
    if (user.addresses.length === 0 || req.body.isDefault) {
      // Remove default from other addresses
      user.addresses.forEach(addr => addr.isDefault = false);
      req.body.isDefault = true;
    }

    user.addresses.push(req.body);
    await user.save();

    return ApiResponse.success(
      res,
      user.addresses,
      'Address added successfully'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Update address
 */
exports.updateAddress = async (req, res, next) => {
  try {
    const { addressId } = req.params;
    const user = await User.findById(req.userId);

    if (!user) {
      return ApiResponse.notFound(res, 'User');
    }

    const address = user.addresses.id(addressId);

    if (!address) {
      return ApiResponse.notFound(res, 'Address');
    }

    // If setting as default, remove default from others
    if (req.body.isDefault) {
      user.addresses.forEach(addr => addr.isDefault = false);
    }

    Object.assign(address, req.body);
    await user.save();

    return ApiResponse.success(
      res,
      user.addresses,
      'Address updated successfully'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Delete address
 */
exports.deleteAddress = async (req, res, next) => {
  try {
    const { addressId } = req.params;
    const user = await User.findById(req.userId);

    if (!user) {
      return ApiResponse.notFound(res, 'User');
    }

    user.addresses.pull(addressId);
    await user.save();

    return ApiResponse.success(
      res,
      user.addresses,
      'Address deleted successfully'
    );
  } catch (error) {
    next(error);
  }
};

