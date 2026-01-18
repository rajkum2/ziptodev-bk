const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const messageSchema = new mongoose.Schema({
  messageId: {
    type: String,
    unique: true,
    index: true,
    default: () => uuidv4()
  },
  conversationId: {
    type: String,
    required: true,
    index: true
  },
  role: {
    type: String,
    enum: ['customer', 'assistant', 'human', 'system', 'agent', 'internal_note'],
    required: true,
    index: true
  },
  content: {
    type: String,
    required: true
  },
  metadata: {
    traceId: { type: String, default: null },
    model: { type: String, default: null },
    latencyMs: { type: Number, default: null },
    ragEnabled: { type: Boolean, default: null },
    ragTraceId: { type: String, default: null },
    error: { type: Boolean, default: null }
  }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

messageSchema.index({ conversationId: 1, createdAt: 1 });

module.exports = mongoose.model('ConversationMessage', messageSchema);

