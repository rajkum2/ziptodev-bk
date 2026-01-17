const mongoose = require('mongoose');

const analyticsEventSchema = new mongoose.Schema({
  eventType: {
    type: String,
    enum: ['page_view', 'product_view', 'add_to_cart', 'purchase', 'search', 'remove_from_cart', 'checkout_initiated'],
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  sessionId: {
    type: String,
    required: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  userAgent: String,
  ipAddress: String,
  device: {
    type: String,
    enum: ['mobile', 'tablet', 'desktop', 'unknown'],
    default: 'unknown'
  },
  platform: {
    type: String,
    enum: ['web', 'ios', 'android'],
    default: 'web'
  }
}, {
  timestamps: true
});

// Indexes
analyticsEventSchema.index({ eventType: 1, timestamp: -1 });
analyticsEventSchema.index({ userId: 1, eventType: 1, timestamp: -1 });
analyticsEventSchema.index({ sessionId: 1, timestamp: 1 });
analyticsEventSchema.index({ timestamp: -1 });

// TTL index to auto-delete old events after 90 days
analyticsEventSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 });

module.exports = mongoose.model('AnalyticsEvent', analyticsEventSchema);

