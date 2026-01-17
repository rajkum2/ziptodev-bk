const { body } = require('express-validator');

const uploadKnowledgeValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('tags')
    .optional()
    .custom((value) => {
      if (Array.isArray(value)) return true;
      if (typeof value === 'string') return true;
      throw new Error('Tags must be a comma-separated string or array');
    })
];

const updateKnowledgeValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('tags')
    .optional()
    .custom((value) => {
      if (Array.isArray(value)) return true;
      if (typeof value === 'string') return true;
      throw new Error('Tags must be a comma-separated string or array');
    }),
  body('enabledForChat')
    .optional()
    .isBoolean()
    .withMessage('enabledForChat must be a boolean')
];

const searchKnowledgeValidation = [
  body('query')
    .trim()
    .notEmpty()
    .withMessage('Search query is required')
    .isLength({ min: 2, max: 500 })
    .withMessage('Query must be between 2 and 500 characters'),
  body('topK')
    .optional()
    .isInt({ min: 1, max: 20 })
    .withMessage('topK must be between 1 and 20'),
  body('documentId')
    .optional()
    .custom((value) => {
      if (!value) return true;
      if (typeof value === 'string' && /^[a-fA-F0-9]{24}$/.test(value)) {
        return true;
      }
      throw new Error('documentId must be a valid MongoDB ObjectId');
    })
];

module.exports = {
  uploadKnowledgeValidation,
  updateKnowledgeValidation,
  searchKnowledgeValidation
};
