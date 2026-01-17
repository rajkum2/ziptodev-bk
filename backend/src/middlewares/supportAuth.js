const ApiResponse = require('../utils/response');

const checkSupportPermission = (...requiredPermissions) => {
  return (req, res, next) => {
    if (req.adminRole === 'super_admin') {
      return next();
    }

    const permissions = req.adminPermissions || [];
    const hasAll = requiredPermissions.every(permission => permissions.includes(permission));

    if (!hasAll) {
      return ApiResponse.error(res, 'Support permission denied', 'SUPPORT_FORBIDDEN', 403);
    }

    next();
  };
};

module.exports = {
  checkSupportPermission
};

