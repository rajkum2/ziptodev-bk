const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const adminChatAuditSchema = new mongoose.Schema({
  auditId: {
    type: String,
    unique: true,
    index: true,
    default: () => uuidv4()
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true,
    index: true
  },
  conversationId: {
    type: String,
    required: true,
    index: true
  },
  action: {
    type: String,
    enum: ['ASSIGN', 'TAKEOVER', 'RETURN_TO_AI', 'CLOSE', 'ADD_NOTE', 'MARK_REVIEW', 'SEND_MESSAGE'],
    required: true,
    index: true
  },
  before: {
    type: Object,
    default: null
  },
  after: {
    type: Object,
    default: null
  },
  meta: {
    type: Object,
    default: null
  }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

adminChatAuditSchema.index({ conversationId: 1, createdAt: -1 });
adminChatAuditSchema.index({ adminId: 1, createdAt: -1 });

module.exports = mongoose.model('AdminChatAudit', adminChatAuditSchema);

