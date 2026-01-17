const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  subtitle: {
    type: String,
    trim: true
  },
  image: {
    type: String,
    required: true
  },
  link: {
    type: String,
    trim: true
  },
  bgColor: {
    type: String,
    default: '#ffffff'
  },
  priority: {
    type: Number,
    default: 0,
    index: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  type: {
    type: String,
    enum: ['hero', 'promotional', 'category', 'offer'],
    default: 'promotional'
  },
  clickCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes
bannerSchema.index({ isActive: 1, priority: -1 });
bannerSchema.index({ startDate: 1, endDate: 1 });

// Virtual to check if banner is currently active
bannerSchema.virtual('isCurrentlyActive').get(function() {
  const now = new Date();
  const started = !this.startDate || this.startDate <= now;
  const notEnded = !this.endDate || this.endDate >= now;
  return this.isActive && started && notEnded;
});

module.exports = mongoose.model('Banner', bannerSchema);

