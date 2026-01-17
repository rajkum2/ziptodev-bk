const { validationResult } = require('express-validator');
const ApiResponse = require('../utils/response');

const supportValidate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value
    }));

    return ApiResponse.error(res, 'Support validation error', 'SUPPORT_VALIDATION_ERROR', 422, formattedErrors);
  }

  next();
};

module.exports = supportValidate;

