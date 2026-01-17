const jwt = require('jsonwebtoken');

/**
 * Generate JWT token for users
 */
const generateToken = (payload, expiresIn = null) => {
  return jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: expiresIn || process.env.JWT_EXPIRES_IN || '7d' }
  );
};

/**
 * Generate refresh token
 */
const generateRefreshToken = (payload) => {
  return jwt.sign(
    payload,
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
  );
};

/**
 * Generate admin JWT token
 */
const generateAdminToken = (payload, expiresIn = null) => {
  return jwt.sign(
    payload,
    process.env.ADMIN_JWT_SECRET,
    { expiresIn: expiresIn || process.env.ADMIN_JWT_EXPIRES_IN || '12h' }
  );
};

/**
 * Verify JWT token
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw error;
  }
};

/**
 * Verify refresh token
 */
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    throw error;
  }
};

/**
 * Verify admin token
 */
const verifyAdminToken = (token) => {
  try {
    return jwt.verify(token, process.env.ADMIN_JWT_SECRET);
  } catch (error) {
    throw error;
  }
};

module.exports = {
  generateToken,
  generateRefreshToken,
  generateAdminToken,
  verifyToken,
  verifyRefreshToken,
  verifyAdminToken
};

