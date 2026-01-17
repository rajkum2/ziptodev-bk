const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const adminOrderController = require('../../controllers/adminOrderController');
const { authenticateAdmin, checkPermission } = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');

// Get all orders
router.get('/', authenticateAdmin, adminOrderController.getAllOrders);

// Get single order
router.get('/:orderId', authenticateAdmin, adminOrderController.getOrder);

// Update order status
router.patch('/:orderId/status',
  authenticateAdmin,
  checkPermission('orders:update', 'orders:*'),
  [
    body('status').isIn(['placed', 'confirmed', 'packing', 'out_for_delivery', 'delivered', 'cancelled'])
      .withMessage('Invalid status')
  ],
  validate,
  adminOrderController.updateOrderStatus
);

// Assign delivery partner
router.patch('/:orderId/assign-partner',
  authenticateAdmin,
  checkPermission('orders:update', 'orders:*'),
  [
    body('partnerId').notEmpty().withMessage('Partner ID is required')
  ],
  validate,
  adminOrderController.assignPartner
);

// Refund order (stub)
router.post('/:orderId/refund',
  authenticateAdmin,
  checkPermission('orders:refund', 'orders:*'),
  [
    body('amount').isNumeric().withMessage('Amount is required'),
    body('reason').notEmpty().withMessage('Reason is required')
  ],
  validate,
  adminOrderController.refundOrder
);

// Get invoice (stub)
router.get('/:orderId/invoice',
  authenticateAdmin,
  adminOrderController.getInvoice
);

module.exports = router;

