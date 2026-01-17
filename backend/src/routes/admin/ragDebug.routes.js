const express = require('express');
const router = express.Router();
const adminRagDebugController = require('../../controllers/adminRagDebugController');
const { authenticateAdmin } = require('../../middlewares/auth');
const { checkSupportPermission } = require('../../middlewares/supportAuth');
const supportValidate = require('../../middlewares/supportValidate');
const {
  ragTraceIdParamValidation,
  ragTraceListValidation
} = require('../../validators/support.validator');

router.get(
  '/rag-traces',
  authenticateAdmin,
  checkSupportPermission('SUPPORT_RAG_DEBUG'),
  ragTraceListValidation,
  supportValidate,
  adminRagDebugController.listRagTraces
);

router.get(
  '/rag-traces/:ragTraceId',
  authenticateAdmin,
  checkSupportPermission('SUPPORT_RAG_DEBUG'),
  ragTraceIdParamValidation,
  supportValidate,
  adminRagDebugController.getRagTrace
);

module.exports = router;

