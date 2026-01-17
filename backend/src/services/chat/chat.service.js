const llmRouter = require('../llm/llm.router');
const sessionStore = require('./session.store');
const logger = require('../../utils/logger');
const { maskPII } = require('../../utils/piiMask');
const { v4: uuidv4 } = require('uuid');

/**
 * Chat Service
 * Orchestrates chat interactions between user, session store, and LLM
 */
class ChatService {
  constructor() {
    this.systemPrompt = this.buildSystemPrompt();
  }

  /**
   * Build system prompt for the assistant
   */
  buildSystemPrompt() {
    return `You are Zipto Assistant, a helpful AI assistant for the Zipto quick commerce platform.

Guidelines:
- Be concise, helpful, and friendly
- Keep responses short (2-6 lines maximum)
- Ask at most one clarifying question per response
- Focus on helping users with product discovery, cart, and order tracking

Important limitations:
- You do NOT have access to real order, payment, or refund data yet
- If user asks about specific orders, refunds, or payments, respond with:
  "I can help once order tools are connected. For now, please check Orders → Track, or contact support."
- NEVER fabricate order numbers, payment details, or refund information

Security reminder:
- If user shares sensitive information (card numbers, OTP, passwords), remind them:
  "Please don't share sensitive info like card numbers or OTP here for your security."

Stay helpful and honest about your current capabilities.`;
  }

  /**
   * Process a chat message
   */
  async processMessage(sessionId, userMessage, context = {}, userId = null) {
    const traceId = uuidv4();
    const startTime = Date.now();

    try {
      // Log incoming request (with PII masking)
      logger.info('Chat request received', {
        sessionId,
        userId,
        message: maskPII(userMessage),
        context: context.page,
        traceId
      });

      // Update session context
      sessionStore.updateContext(sessionId, context);
      if (userId) {
        sessionStore.setUserId(sessionId, userId);
      }

      // Add user message to session
      sessionStore.addMessage(sessionId, 'user', userMessage, traceId);

      // Get conversation history
      const history = sessionStore.getMessagesForContext(sessionId);

      // Build messages for LLM
      const messages = [
        { role: 'system', content: this.systemPrompt },
        ...history
      ];

      // Call LLM
      const llmResponse = await llmRouter.sendMessage(messages, {
        temperature: 0.7,
        maxTokens: 500
      });

      const assistantMessage = llmResponse.content;

      // Add assistant response to session
      sessionStore.addMessage(sessionId, 'assistant', assistantMessage, traceId);

      // Persist to MongoDB (async, non-blocking)
      sessionStore.persistSession(sessionId, {
        provider: llmRouter.getProviderInfo().provider,
        model: llmResponse.model,
        totalTokens: llmResponse.usage?.total_tokens || 0
      }).catch(err => {
        logger.error('Failed to persist session:', err);
      });

      const latency = Date.now() - startTime;

      logger.info('Chat response generated', {
        sessionId,
        traceId,
        latency: `${latency}ms`,
        tokens: llmResponse.usage?.total_tokens || 0
      });

      // Return response in both formats (compatibility + standard envelope)
      return {
        replyText: assistantMessage,
        cards: [], // For future enhancements (product cards, order cards, etc.)
        traceId,
        metadata: {
          latency,
          model: llmResponse.model,
          usage: llmResponse.usage
        }
      };

    } catch (error) {
      logger.error('Chat service error:', {
        sessionId,
        traceId,
        error: error.message,
        stack: error.stack
      });

      // Return friendly error message
      const errorResponse = this.buildErrorResponse(error);
      
      return {
        replyText: errorResponse.message,
        cards: [],
        traceId,
        error: {
          code: errorResponse.code,
          message: error.message
        }
      };
    }
  }

  /**
   * Build user-friendly error response
   */
  buildErrorResponse(error) {
    const message = error.message.toLowerCase();

    if (message.includes('cannot connect') || message.includes('econnrefused')) {
      return {
        code: 'LLM_UNAVAILABLE',
        message: "I'm having trouble connecting right now. Please try again in a moment."
      };
    }

    if (message.includes('timeout')) {
      return {
        code: 'LLM_TIMEOUT',
        message: "That's taking longer than expected. Please try again."
      };
    }

    if (message.includes('rate limit')) {
      return {
        code: 'LLM_RATE_LIMIT',
        message: "I'm getting too many requests. Please wait a moment before trying again."
      };
    }

    if (message.includes('not configured')) {
      return {
        code: 'LLM_NOT_CONFIGURED',
        message: "Chat service is not available at the moment. Please contact support."
      };
    }

    // Generic error
    return {
      code: 'CHAT_ERROR',
      message: "I encountered an error. Please try again or contact support if this persists."
    };
  }

  /**
   * Get session statistics
   */
  getSessionStats(sessionId) {
    const session = sessionStore.getSession(sessionId);
    return {
      sessionId: session.sessionId,
      messageCount: session.messages.length,
      createdAt: session.createdAt,
      lastAccessedAt: session.lastAccessedAt
    };
  }

  /**
   * Clear session history
   */
  clearSession(sessionId) {
    sessionStore.getSession(sessionId).messages = [];
    logger.info('Session cleared', { sessionId });
  }

  /**
   * Get LLM provider status
   */
  async getProviderStatus() {
    try {
      const info = llmRouter.getProviderInfo();
      const healthy = await llmRouter.healthCheck();
      
      return {
        ...info,
        healthy,
        sessionStats: sessionStore.getStats()
      };
    } catch (error) {
      return {
        configured: false,
        healthy: false,
        error: error.message
      };
    }
  }
}

module.exports = new ChatService();

