const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const orderController = require('../controllers/orderController');
const { authenticateUser } = require('../middlewares/auth');
const validate = require('../middlewares/validate');

// Create order
router.post('/',
  authenticateUser,
  [
    body('items').isArray({ min: 1 }).withMessage('Items are required'),
    body('items.*.productId').notEmpty().withMessage('Product ID is required'),
    body('items.*.variantId').notEmpty().withMessage('Variant ID is required'),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    body('deliveryAddress').notEmpty().withMessage('Delivery address is required'),
    body('deliveryAddress.addressLine1').notEmpty().withMessage('Address line 1 is required'),
    body('deliveryAddress.city').notEmpty().withMessage('City is required'),
    body('deliveryAddress.pincode').notEmpty().withMessage('Pincode is required'),
    body('payment.method').isIn(['cod', 'online', 'wallet', 'upi']).withMessage('Invalid payment method')
  ],
  validate,
  orderController.createOrder
);

// Get user orders
router.get('/', authenticateUser, orderController.getOrders);

// Track order
router.get('/:orderId/track', authenticateUser, orderController.trackOrder);

// Get order by ID
router.get('/:orderId', authenticateUser, orderController.getOrder);

// Cancel order
router.put('/:orderId/cancel',
  authenticateUser,
  [
    body('reason').notEmpty().withMessage('Reason is required')
  ],
  validate,
  orderController.cancelOrder
);

module.exports = router;

