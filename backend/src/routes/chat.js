const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const chatController = require('../controllers/chatController');
const { chatMessageValidation } = require('../validators/chat.validator');
const validate = require('../middlewares/validate');
const logger = require('../utils/logger');

/**
 * Chat-specific rate limiter
 * 30 requests per 5 minutes per IP
 */
const chatLimiter = rateLimit({
  windowMs: parseInt(process.env.CHAT_RATE_LIMIT_WINDOW_MS) || 5 * 60 * 1000, // 5 minutes
  max: parseInt(process.env.CHAT_RATE_LIMIT_MAX) || 30,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many chat requests. Please try again in a few minutes.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Chat rate limit exceeded', {
      ip: req.ip,
      sessionId: req.body?.sessionId
    });
    
    res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many chat requests. Please try again in a few minutes.'
      },
      replyText: 'You\'re sending messages too quickly. Please wait a moment before trying again.',
      cards: []
    });
  }
});

/**
 * @route   POST /api/chat/message
 * @desc    Send a chat message
 * @access  Public
 */
router.post(
  '/message',
  chatLimiter,
  chatMessageValidation,
  validate,
  chatController.sendMessage
);

/**
 * @route   GET /api/chat/health
 * @desc    Check chat service health
 * @access  Public
 */
router.get('/health', chatController.healthCheck);

/**
 * @route   GET /api/chat/conversation/:conversationId/messages
 * @desc    Get conversation messages for customer chat
 * @access  Public (POC)
 */
router.get('/conversation/:conversationId/messages', chatController.getConversationMessages);

/**
 * @route   GET /api/chat/conversation/:conversationId
 * @desc    Get conversation summary for customer chat
 * @access  Public (POC)
 */
router.get('/conversation/:conversationId', chatController.getConversationSummary);

/**
 * @route   GET /api/chat/session/:sessionId
 * @desc    Get session statistics
 * @access  Public (could be protected later)
 */
router.get('/session/:sessionId', chatController.getSessionStats);

/**
 * @route   DELETE /api/chat/session/:sessionId
 * @desc    Clear session history
 * @access  Public (could be protected later)
 */
router.delete('/session/:sessionId', chatController.clearSession);

module.exports = router;

