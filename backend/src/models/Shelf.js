const mongoose = require('mongoose');

const shelfSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  subtitle: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['featured', 'category', 'tag-based', 'manual'],
    required: true
  },
  categorySlug: {
    type: String
  },
  tags: [String],
  productIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
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
  maxProducts: {
    type: Number,
    default: 20
  },
  layout: {
    type: String,
    enum: ['grid', 'carousel', 'list'],
    default: 'carousel'
  }
}, {
  timestamps: true
});

// Indexes
shelfSchema.index({ isActive: 1, priority: -1 });
shelfSchema.index({ type: 1, isActive: 1 });
shelfSchema.index({ categorySlug: 1 });

module.exports = mongoose.model('Shelf', shelfSchema);

