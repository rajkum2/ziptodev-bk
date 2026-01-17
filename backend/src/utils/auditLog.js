const logger = require('./logger');

/**
 * Audit log service for tracking sensitive operations
 */
class AuditLogger {
  /**
   * Log admin login
   */
  static logAdminLogin(admin, ip, userAgent) {
    logger.info('AUDIT: Admin Login', {
      adminId: admin._id,
      username: admin.username,
      role: admin.role,
      ip,
      userAgent,
      timestamp: new Date()
    });
  }

  /**
   * Log admin logout
   */
  static logAdminLogout(admin, ip) {
    logger.info('AUDIT: Admin Logout', {
      adminId: admin._id,
      username: admin.username,
      ip,
      timestamp: new Date()
    });
  }

  /**
   * Log product operation
   */
  static logProductOperation(admin, operation, productId, productName, changes = null) {
    logger.info('AUDIT: Product Operation', {
      adminId: admin._id,
      username: admin.username,
      operation,
      productId,
      productName,
      changes,
      timestamp: new Date()
    });
  }

  /**
   * Log order status update
   */
  static logOrderStatusUpdate(admin, orderId, oldStatus, newStatus, note = null) {
    logger.info('AUDIT: Order Status Update', {
      adminId: admin._id,
      username: admin.username,
      orderId,
      oldStatus,
      newStatus,
      note,
      timestamp: new Date()
    });
  }

  /**
   * Log partner assignment
   */
  static logPartnerAssignment(admin, orderId, partnerId, partnerName) {
    logger.info('AUDIT: Partner Assignment', {
      adminId: admin._id,
      username: admin.username,
      orderId,
      partnerId,
      partnerName,
      timestamp: new Date()
    });
  }

  /**
   * Log refund operation
   */
  static logRefund(admin, orderId, amount, reason) {
    logger.info('AUDIT: Refund Issued', {
      adminId: admin._id,
      username: admin.username,
      orderId,
      amount,
      reason,
      timestamp: new Date()
    });
  }

  /**
   * Log admin user operation
   */
  static logAdminUserOperation(admin, operation, targetAdminId, targetUsername, changes = null) {
    logger.info('AUDIT: Admin User Operation', {
      adminId: admin._id,
      username: admin.username,
      operation,
      targetAdminId,
      targetUsername,
      changes,
      timestamp: new Date()
    });
  }

  /**
   * Log user block/unblock
   */
  static logUserStatusChange(admin, userId, userPhone, oldStatus, newStatus) {
    logger.info('AUDIT: User Status Change', {
      adminId: admin._id,
      username: admin.username,
      userId,
      userPhone,
      oldStatus,
      newStatus,
      timestamp: new Date()
    });
  }

  /**
   * Log settings change
   */
  static logSettingsChange(admin, setting, oldValue, newValue) {
    logger.info('AUDIT: Settings Change', {
      adminId: admin._id,
      username: admin.username,
      setting,
      oldValue,
      newValue,
      timestamp: new Date()
    });
  }

  /**
   * Log bulk operation
   */
  static logBulkOperation(admin, operation, resource, count, details = null) {
    logger.info('AUDIT: Bulk Operation', {
      adminId: admin._id,
      username: admin.username,
      operation,
      resource,
      count,
      details,
      timestamp: new Date()
    });
  }

  /**
   * Log permission denied attempt
   */
  static logPermissionDenied(admin, attemptedAction, resource) {
    logger.warn('AUDIT: Permission Denied', {
      adminId: admin._id,
      username: admin.username,
      role: admin.role,
      attemptedAction,
      resource,
      timestamp: new Date()
    });
  }
}

module.exports = AuditLogger;

