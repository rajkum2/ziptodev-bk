const { body } = require('express-validator');

/**
 * Validation rules for chat endpoints
 */

const chatMessageValidation = [
  body('sessionId')
    .trim()
    .notEmpty()
    .withMessage('Session ID is required')
    .isString()
    .withMessage('Session ID must be a string')
    .isLength({ min: 1, max: 100 })
    .withMessage('Session ID must be between 1 and 100 characters'),

  body('message')
    .trim()
    .notEmpty()
    .withMessage('Message is required')
    .isString()
    .withMessage('Message must be a string')
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message must be between 1 and 1000 characters'),

  body('userId')
    .optional({ values: 'null' })
    .custom((value) => {
      if (value === null || value === '' || value === undefined) {
        return true;
      }
      if (typeof value === 'string' && /^[a-fA-F0-9]{24}$/.test(value)) {
        return true;
      }
      throw new Error('User ID must be a valid MongoDB ObjectId');
    }),

  body('context')
    .optional()
    .isObject()
    .withMessage('Context must be an object'),

  body('context.page')
    .optional()
    .isIn(['home', 'category', 'product', 'cart', 'orders', 'profile'])
    .withMessage('Invalid page value'),

  body('context.cartSummary')
    .optional()
    .isObject()
    .withMessage('Cart summary must be an object'),

  body('context.cartSummary.itemCount')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Item count must be a non-negative integer'),

  body('context.cartSummary.total')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Total must be a non-negative number'),

  body('context.lastOrderId')
    .optional()
    .trim()
    .isString()
    .withMessage('Last order ID must be a string'),

  body('mode')
    .optional()
    .isIn(['chat', 'rag', 'auto'])
    .withMessage('mode must be chat, rag, or auto'),

  body('conversationId')
    .optional()
    .trim()
    .isString()
    .isLength({ min: 1, max: 100 })
    .withMessage('conversationId must be between 1 and 100 characters'),

  body('documentId')
    .optional()
    .custom((value) => {
      if (value === null || value === '' || value === undefined) {
        return true;
      }
      if (typeof value === 'string' && /^[a-fA-F0-9]{24}$/.test(value)) {
        return true;
      }
      throw new Error('documentId must be a valid MongoDB ObjectId');
    })
];

module.exports = {
  chatMessageValidation
};

