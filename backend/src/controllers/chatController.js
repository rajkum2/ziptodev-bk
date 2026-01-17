const chatService = require('../services/chat/chat.service');
const ragService = require('../services/chat/rag.service');
const KnowledgeDocument = require('../models/KnowledgeDocument');
const ApiResponse = require('../utils/response');
const logger = require('../utils/logger');

/**
 * Chat Controller
 * Handles chat API endpoints
 */

/**
 * Check if RAG should be used (auto-detect)
 * Returns true if there are enabled knowledge base documents
 */
const shouldUseRag = async () => {
  try {
    const enabledDocCount = await KnowledgeDocument.countDocuments({
      'status.ingestionStatus': 'ready',
      'status.enabledForChat': true
    });
    return enabledDocCount > 0;
  } catch (error) {
    logger.error('Error checking RAG availability:', error);
    return false;
  }
};

/**
 * POST /api/chat/message
 * Process a chat message
 */
exports.sendMessage = async (req, res, next) => {
  try {
    const { sessionId, userId, message, context, mode, documentId } = req.body;

    // Auto-detect mode: use RAG if enabled documents exist
    let effectiveMode = mode;
    if (!mode || mode === 'auto') {
      effectiveMode = await shouldUseRag() ? 'rag' : 'chat';
      logger.info('Auto-detected chat mode', { effectiveMode });
    }

    // Process chat message
    const result = effectiveMode === 'rag'
      ? await ragService.processMessage(
        sessionId,
        message,
        context || {},
        userId || null,
        { mode: effectiveMode, documentId }
      )
      : await chatService.processMessage(
        sessionId,
        message,
        context || {},
        userId || null
      );

    // Check if there was an error during processing
    if (result.error) {
      logger.warn('Chat service returned error', {
        sessionId,
        error: result.error,
        traceId: result.traceId
      });

      // Return error response with friendly message
      return res.status(503).json({
        success: false,
        error: {
          code: result.error.code,
          message: result.error.message
        },
        traceId: result.traceId,
        // Include top-level compatibility keys
        replyText: result.replyText,
        cards: result.cards,
        sources: result.sources || []
      });
    }

    // Success response (dual format for compatibility)
    return res.status(200).json({
      success: true,
      data: {
        replyText: result.replyText,
        cards: result.cards,
        traceId: result.traceId,
        metadata: result.metadata,
        sources: result.sources
      },
      message: 'Success',
      // Top-level compatibility keys
      replyText: result.replyText,
      cards: result.cards,
      traceId: result.traceId,
      sources: result.sources
    });

  } catch (error) {
    logger.error('Chat controller error:', {
      error: error.message,
      stack: error.stack,
      sessionId: req.body?.sessionId
    });

    // Generate a trace ID if not present
    const traceId = require('uuid').v4();

    // Return error with both formats
    return res.status(500).json({
      success: false,
      error: {
        code: 'CHAT_ERROR',
        message: 'An unexpected error occurred. Please try again.'
      },
      traceId,
      // Top-level compatibility keys
      replyText: 'An unexpected error occurred. Please try again.',
      cards: []
    });
  }
};

/**
 * GET /api/chat/health
 * Check chat service health
 */
exports.healthCheck = async (req, res) => {
  try {
    const status = await chatService.getProviderStatus();

    return res.status(status.healthy ? 200 : 503).json({
      success: status.healthy,
      data: status,
      message: status.healthy ? 'Chat service is healthy' : 'Chat service is unavailable'
    });

  } catch (error) {
    logger.error('Health check error:', error);
    
    return ApiResponse.serverError(res, 'Health check failed');
  }
};

/**
 * DELETE /api/chat/session/:sessionId
 * Clear a chat session (for testing/debugging)
 */
exports.clearSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    chatService.clearSession(sessionId);

    return ApiResponse.success(res, { sessionId }, 'Session cleared successfully');

  } catch (error) {
    logger.error('Clear session error:', error);
    return ApiResponse.serverError(res, 'Failed to clear session');
  }
};

/**
 * GET /api/chat/session/:sessionId
 * Get session statistics
 */
exports.getSessionStats = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const stats = chatService.getSessionStats(sessionId);

    return ApiResponse.success(res, stats, 'Session stats retrieved');

  } catch (error) {
    logger.error('Get session stats error:', error);
    return ApiResponse.serverError(res, 'Failed to get session stats');
  }
};

