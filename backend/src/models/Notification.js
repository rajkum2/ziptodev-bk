const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['order', 'promotional', 'system', 'delivery', 'offer'],
    default: 'system',
    index: true
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true
  },
  link: String,
  data: {
    type: mongoose.Schema.Types.Mixed
  },
  sentAt: {
    type: Date,
    default: Date.now
  },
  readAt: Date,
  channel: {
    type: String,
    enum: ['push', 'sms', 'email', 'in-app'],
    default: 'in-app'
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'failed', 'delivered'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Indexes
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ type: 1, createdAt: -1 });
notificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);

