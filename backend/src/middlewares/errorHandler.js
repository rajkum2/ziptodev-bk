const logger = require('../utils/logger');
const ApiResponse = require('../utils/response');

/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userId: req.userId || req.adminId
  });

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => ({
      field: e.path,
      message: e.message
    }));
    return ApiResponse.validationError(res, errors);
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    return ApiResponse.error(
      res,
      `Invalid ${err.path}: ${err.value}`,
      'INVALID_ID',
      400
    );
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return ApiResponse.error(
      res,
      `${field} already exists`,
      'DUPLICATE_ENTRY',
      409
    );
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return ApiResponse.unauthorized(res, 'Invalid token');
  }

  if (err.name === 'TokenExpiredError') {
    return ApiResponse.unauthorized(res, 'Token expired');
  }

  // Multer file upload errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return ApiResponse.error(
        res,
        'File size exceeds the limit',
        'FILE_TOO_LARGE',
        400
      );
    }
    return ApiResponse.error(res, err.message, 'UPLOAD_ERROR', 400);
  }

  // Default server error
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : err.message;

  return res.status(statusCode).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message
    }
  });
};

/**
 * 404 Not Found handler
 */
const notFoundHandler = (req, res) => {
  return ApiResponse.error(
    res,
    `Route ${req.originalUrl} not found`,
    'NOT_FOUND',
    404
  );
};

module.exports = {
  errorHandler,
  notFoundHandler
};

