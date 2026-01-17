const express = require('express');
const router = express.Router();
const adminSupportController = require('../../controllers/adminSupportController');
const { authenticateAdmin } = require('../../middlewares/auth');
const { checkSupportPermission } = require('../../middlewares/supportAuth');
const supportValidate = require('../../middlewares/supportValidate');
const {
  conversationIdParamValidation,
  listConversationsValidation,
  assignConversationValidation,
  toggleNeedsReviewValidation,
  returnToAiValidation,
  sendMessageValidation
} = require('../../validators/support.validator');

router.get(
  '/conversations',
  authenticateAdmin,
  checkSupportPermission('SUPPORT_VIEW'),
  listConversationsValidation,
  supportValidate,
  adminSupportController.listConversations
);

router.get(
  '/conversations/:conversationId',
  authenticateAdmin,
  checkSupportPermission('SUPPORT_VIEW'),
  conversationIdParamValidation,
  supportValidate,
  adminSupportController.getConversationDetail
);

router.post(
  '/conversations/:conversationId/assign',
  authenticateAdmin,
  checkSupportPermission('SUPPORT_MANAGE', 'SUPPORT_ASSIGN'),
  conversationIdParamValidation,
  assignConversationValidation,
  supportValidate,
  adminSupportController.assignConversation
);

router.post(
  '/conversations/:conversationId/review',
  authenticateAdmin,
  checkSupportPermission('SUPPORT_MANAGE'),
  conversationIdParamValidation,
  toggleNeedsReviewValidation,
  supportValidate,
  adminSupportController.toggleNeedsReview
);

router.post(
  '/conversations/:conversationId/takeover',
  authenticateAdmin,
  checkSupportPermission('SUPPORT_MANAGE', 'SUPPORT_TAKEOVER'),
  conversationIdParamValidation,
  supportValidate,
  adminSupportController.takeoverConversation
);

router.post(
  '/conversations/:conversationId/return-to-ai',
  authenticateAdmin,
  checkSupportPermission('SUPPORT_MANAGE', 'SUPPORT_TAKEOVER'),
  conversationIdParamValidation,
  returnToAiValidation,
  supportValidate,
  adminSupportController.returnToAi
);

router.post(
  '/conversations/:conversationId/close',
  authenticateAdmin,
  checkSupportPermission('SUPPORT_MANAGE', 'SUPPORT_CLOSE'),
  conversationIdParamValidation,
  supportValidate,
  adminSupportController.closeConversation
);

router.post(
  '/conversations/:conversationId/messages',
  authenticateAdmin,
  checkSupportPermission('SUPPORT_MANAGE'),
  conversationIdParamValidation,
  sendMessageValidation,
  supportValidate,
  adminSupportController.sendHumanMessage
);

module.exports = router;

