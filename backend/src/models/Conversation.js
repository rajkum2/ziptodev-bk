const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const conversationSchema = new mongoose.Schema({
  conversationId: {
    type: String,
    unique: true,
    index: true,
    default: () => uuidv4()
  },
  customerUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true
  },
  guestSessionId: {
    type: String,
    default: null,
    index: true
  },
  channel: {
    type: String,
    enum: ['web'],
    default: 'web'
  },
  status: {
    type: String,
    enum: ['open', 'closed'],
    default: 'open',
    index: true
  },
  mode: {
    type: String,
    enum: ['AI_ONLY', 'AI_ASSIST', 'HUMAN_ONLY'],
    default: 'AI_ONLY',
    index: true
  },
  queue: {
    type: String,
    enum: ['delivery', 'refund', 'payment', 'product', 'general'],
    default: 'general',
    index: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
    index: true
  },
  assignedToAdminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    default: null,
    index: true
  },
  needsReview: {
    type: Boolean,
    default: false,
    index: true
  },
  aiConfidence: {
    type: String,
    enum: ['high', 'medium', 'low'],
    default: null
  },
  lastMessageAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  slaFirstResponseDueAt: {
    type: Date,
    default: null
  },
  slaBreached: {
    type: Boolean,
    default: false,
    index: true
  }
}, {
  timestamps: true
});

conversationSchema.index({ status: 1, queue: 1, updatedAt: -1 });
conversationSchema.index({ assignedToAdminId: 1, status: 1 });
conversationSchema.index({ lastMessageAt: -1 });

module.exports = mongoose.model('Conversation', conversationSchema);

