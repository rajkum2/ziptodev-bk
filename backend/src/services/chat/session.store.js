const logger = require('../../utils/logger');
const ChatSession = require('../../models/ChatSession');

/**
 * Session Store
 * Manages chat session history in-memory with optional MongoDB persistence
 */
class SessionStore {
  constructor() {
    // In-memory storage for active sessions
    this.sessions = new Map();
    
    // Configuration
    this.historyLimit = parseInt(process.env.SESSION_HISTORY_LIMIT) || 12;
    this.persistToMongo = process.env.PERSIST_CHAT_SESSIONS !== 'false'; // Default true
    
    // Cleanup old sessions periodically (every 30 minutes)
    this.cleanupInterval = setInterval(() => this.cleanup(), 30 * 60 * 1000);
    
    logger.info('Session Store initialized', {
      historyLimit: this.historyLimit,
      persistToMongo: this.persistToMongo
    });
  }

  /**
   * Get session history
   */
  getSession(sessionId) {
    if (!this.sessions.has(sessionId)) {
      this.sessions.set(sessionId, {
        sessionId,
        messages: [],
        createdAt: new Date(),
        lastAccessedAt: new Date()
      });
    }

    const session = this.sessions.get(sessionId);
    session.lastAccessedAt = new Date();
    return session;
  }

  /**
   * Add message to session
   */
  addMessage(sessionId, role, content, traceId = null) {
    const session = this.getSession(sessionId);
    
    const message = {
      role,
      content,
      timestamp: new Date(),
      traceId
    };

    session.messages.push(message);

    // Keep only last N messages
    if (session.messages.length > this.historyLimit) {
      session.messages = session.messages.slice(-this.historyLimit);
    }

    return message;
  }

  /**
   * Get messages for LLM context
   */
  getMessagesForContext(sessionId) {
    const session = this.getSession(sessionId);
    
    // Return messages in format expected by LLM
    return session.messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
  }

  /**
   * Update session context
   */
  updateContext(sessionId, context) {
    const session = this.getSession(sessionId);
    session.context = context;
  }

  /**
   * Set user ID for session
   */
  setUserId(sessionId, userId) {
    const session = this.getSession(sessionId);
    session.userId = userId;
  }

  /**
   * Persist session to MongoDB
   */
  async persistSession(sessionId, metadata = {}) {
    if (!this.persistToMongo) {
      return;
    }

    try {
      const session = this.getSession(sessionId);

      await ChatSession.findOneAndUpdate(
        { sessionId },
        {
          sessionId: session.sessionId,
          userId: session.userId || null,
          messages: session.messages,
          context: session.context,
          metadata: {
            ...metadata,
            totalRequests: session.messages.filter(m => m.role === 'user').length
          }
        },
        { upsert: true, new: true }
      );

      logger.debug('Session persisted to MongoDB', { sessionId });
    } catch (error) {
      logger.error('Failed to persist session to MongoDB:', {
        sessionId,
        error: error.message
      });
    }
  }

  /**
   * Load session from MongoDB
   */
  async loadSession(sessionId) {
    if (!this.persistToMongo) {
      return null;
    }

    try {
      const dbSession = await ChatSession.findOne({ sessionId })
        .sort({ updatedAt: -1 })
        .limit(1);

      if (dbSession) {
        // Restore to in-memory store
        this.sessions.set(sessionId, {
          sessionId: dbSession.sessionId,
          userId: dbSession.userId,
          messages: dbSession.messages.slice(-this.historyLimit),
          context: dbSession.context,
          createdAt: dbSession.createdAt,
          lastAccessedAt: new Date()
        });

        logger.debug('Session loaded from MongoDB', { sessionId });
        return dbSession;
      }
    } catch (error) {
      logger.error('Failed to load session from MongoDB:', {
        sessionId,
        error: error.message
      });
    }

    return null;
  }

  /**
   * Clean up old sessions from memory
   */
  cleanup() {
    const now = Date.now();
    const maxAge = 60 * 60 * 1000; // 1 hour

    let cleaned = 0;
    for (const [sessionId, session] of this.sessions.entries()) {
      if (now - session.lastAccessedAt.getTime() > maxAge) {
        this.sessions.delete(sessionId);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      logger.info(`Cleaned up ${cleaned} old sessions from memory`);
    }
  }

  /**
   * Get session statistics
   */
  getStats() {
    return {
      activeSessions: this.sessions.size,
      historyLimit: this.historyLimit,
      persistToMongo: this.persistToMongo
    };
  }

  /**
   * Clear all sessions (for testing/debugging)
   */
  clear() {
    this.sessions.clear();
    logger.info('All sessions cleared');
  }

  /**
   * Shutdown cleanup
   */
  shutdown() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    logger.info('Session Store shutdown');
  }
}

// Export singleton instance
module.exports = new SessionStore();

