const { body, param, query } = require('express-validator');

const uuidRegex = /^[a-fA-F0-9-]{36}$/;

const conversationIdParamValidation = [
  param('conversationId')
    .trim()
    .notEmpty()
    .withMessage('conversationId is required')
    .matches(uuidRegex)
    .withMessage('conversationId must be a valid UUID')
];

const ragTraceIdParamValidation = [
  param('ragTraceId')
    .trim()
    .notEmpty()
    .withMessage('ragTraceId is required')
    .matches(uuidRegex)
    .withMessage('ragTraceId must be a valid UUID')
];

const listConversationsValidation = [
  query('status')
    .optional()
    .isIn(['open', 'closed', 'all'])
    .withMessage('status must be open, closed, or all'),
  query('queue')
    .optional()
    .isIn(['delivery', 'refund', 'payment', 'product', 'general', 'all'])
    .withMessage('queue must be a valid queue or all'),
  query('needsReview')
    .optional()
    .isBoolean()
    .withMessage('needsReview must be boolean'),
  query('assigned')
    .optional()
    .isIn(['me', 'unassigned', 'any'])
    .withMessage('assigned must be me, unassigned, or any'),
  query('slaBreached')
    .optional()
    .isBoolean()
    .withMessage('slaBreached must be boolean'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('limit must be between 1 and 100'),
  query('q')
    .optional()
    .isString()
    .isLength({ min: 1, max: 200 })
    .withMessage('q must be between 1 and 200 characters')
];

const assignConversationValidation = [
  body('assignedToAdminId')
    .optional()
    .custom((value) => {
      if (value === 'me') return true;
      if (typeof value === 'string' && /^[a-fA-F0-9]{24}$/.test(value)) return true;
      throw new Error('assignedToAdminId must be "me" or a valid admin ObjectId');
    })
];

const toggleNeedsReviewValidation = [
  body('needsReview')
    .notEmpty()
    .withMessage('needsReview is required')
    .isBoolean()
    .withMessage('needsReview must be boolean')
];

const returnToAiValidation = [
  body('mode')
    .optional()
    .isIn(['AI_ONLY', 'AI_ASSIST'])
    .withMessage('mode must be AI_ONLY or AI_ASSIST')
];

const sendMessageValidation = [
  body('content')
    .trim()
    .notEmpty()
    .withMessage('content is required')
    .isString()
    .withMessage('content must be a string')
    .isLength({ min: 1, max: 2000 })
    .withMessage('content must be between 1 and 2000 characters'),
  body('isInternalNote')
    .optional()
    .isBoolean()
    .withMessage('isInternalNote must be boolean')
];

const ragTraceListValidation = [
  query('conversationId')
    .optional()
    .matches(uuidRegex)
    .withMessage('conversationId must be a valid UUID'),
  query('messageId')
    .optional()
    .matches(uuidRegex)
    .withMessage('messageId must be a valid UUID'),
  query('traceId')
    .optional()
    .isString()
    .isLength({ min: 1, max: 200 })
    .withMessage('traceId must be between 1 and 200 characters'),
  query('ragTraceId')
    .optional()
    .matches(uuidRegex)
    .withMessage('ragTraceId must be a valid UUID'),
  query('docName')
    .optional()
    .isString()
    .isLength({ min: 1, max: 200 })
    .withMessage('docName must be between 1 and 200 characters'),
  query('docId')
    .optional()
    .isString()
    .isLength({ min: 1, max: 200 })
    .withMessage('docId must be between 1 and 200 characters'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('limit must be between 1 and 100')
];

module.exports = {
  conversationIdParamValidation,
  ragTraceIdParamValidation,
  listConversationsValidation,
  assignConversationValidation,
  toggleNeedsReviewValidation,
  returnToAiValidation,
  sendMessageValidation,
  ragTraceListValidation
};

