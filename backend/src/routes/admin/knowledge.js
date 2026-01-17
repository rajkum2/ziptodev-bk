const express = require('express');
const router = express.Router();
const adminKnowledgeController = require('../../controllers/adminKnowledgeController');
const { authenticateAdmin, checkPermission } = require('../../middlewares/auth');
const { strictLimiter } = require('../../middlewares/rateLimit');
const { knowledgeUpload, handleKnowledgeUploadError } = require('../../middlewares/knowledgeUpload');
const validate = require('../../middlewares/validate');
const {
  uploadKnowledgeValidation,
  updateKnowledgeValidation,
  searchKnowledgeValidation
} = require('../../validators/knowledge.validator');

// Upload a knowledge document
router.post(
  '/documents/upload',
  authenticateAdmin,
  checkPermission('KNOWLEDGE_MANAGE'),
  strictLimiter,
  knowledgeUpload.single('file'),
  handleKnowledgeUploadError,
  uploadKnowledgeValidation,
  validate,
  adminKnowledgeController.uploadDocument
);

// List documents
router.get(
  '/documents',
  authenticateAdmin,
  checkPermission('KNOWLEDGE_MANAGE'),
  adminKnowledgeController.getDocuments
);

// Document details
router.get(
  '/documents/:id',
  authenticateAdmin,
  checkPermission('KNOWLEDGE_MANAGE'),
  adminKnowledgeController.getDocument
);

// Update document
router.patch(
  '/documents/:id',
  authenticateAdmin,
  checkPermission('KNOWLEDGE_MANAGE'),
  updateKnowledgeValidation,
  validate,
  adminKnowledgeController.updateDocument
);

// Re-index document
router.post(
  '/documents/:id/reindex',
  authenticateAdmin,
  checkPermission('KNOWLEDGE_MANAGE'),
  strictLimiter,
  adminKnowledgeController.reindexDocument
);

// Delete document
router.delete(
  '/documents/:id',
  authenticateAdmin,
  checkPermission('KNOWLEDGE_MANAGE'),
  adminKnowledgeController.deleteDocument
);

// List chunks (preview)
router.get(
  '/documents/:id/chunks',
  authenticateAdmin,
  checkPermission('KNOWLEDGE_MANAGE'),
  adminKnowledgeController.listChunks
);

// Search knowledge base
router.post(
  '/search',
  authenticateAdmin,
  checkPermission('KNOWLEDGE_MANAGE'),
  searchKnowledgeValidation,
  validate,
  adminKnowledgeController.searchKnowledge
);

module.exports = router;
