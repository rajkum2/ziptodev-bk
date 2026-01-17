const mongoose = require('mongoose');

/**
 * Chat Session Schema
 * Stores chat conversation history for audit and analysis
 */
const chatSessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true
  },
  messages: [{
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    traceId: {
      type: String,
      default: null
    }
  }],
  context: {
    page: {
      type: String,
      enum: ['home', 'category', 'product', 'cart', 'orders', 'profile'],
      default: null
    },
    cartSummary: {
      itemCount: Number,
      total: Number
    },
    lastOrderId: {
      type: String,
      default: null
    }
  },
  metadata: {
    provider: String,
    model: String,
    totalTokens: {
      type: Number,
      default: 0
    },
    totalRequests: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Index for efficient querying
chatSessionSchema.index({ createdAt: 1 });
chatSessionSchema.index({ sessionId: 1, createdAt: -1 });

// Auto-delete old sessions after 30 days
chatSessionSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });

const ChatSession = mongoose.model('ChatSession', chatSessionSchema);

module.exports = ChatSession;

