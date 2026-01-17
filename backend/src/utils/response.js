/**
 * Standard API Response Utilities
 */

class ApiResponse {
  /**
   * Send success response
   */
  static success(res, data, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      data,
      message
    });
  }

  /**
   * Send paginated response
   */
  static paginated(res, data, pagination, message = 'Success') {
    return res.status(200).json({
      success: true,
      data,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        pages: Math.ceil(pagination.total / pagination.limit)
      },
      message
    });
  }

  /**
   * Send error response
   */
  static error(res, message, code = 'ERROR', statusCode = 400, errors = null) {
    const response = {
      success: false,
      error: {
        code,
        message
      }
    };

    if (errors) {
      response.error.details = errors;
    }

    return res.status(statusCode).json(response);
  }

  /**
   * Send validation error response
   */
  static validationError(res, errors) {
    return res.status(422).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: errors
      }
    });
  }

  /**
   * Send not found error
   */
  static notFound(res, resource = 'Resource') {
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: `${resource} not found`
      }
    });
  }

  /**
   * Send unauthorized error
   */
  static unauthorized(res, message = 'Unauthorized access') {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message
      }
    });
  }

  /**
   * Send forbidden error
   */
  static forbidden(res, message = 'Access forbidden') {
    return res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message
      }
    });
  }

  /**
   * Send server error
   */
  static serverError(res, message = 'Internal server error') {
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message
      }
    });
  }
}

module.exports = ApiResponse;

