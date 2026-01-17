const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  icon: String,
  image: String,
  color: {
    type: String,
    default: '#6366f1'
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
  description: String,
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  }
}, {
  timestamps: true
});

// Indexes
categorySchema.index({ isActive: 1, priority: -1 });
categorySchema.index({ slug: 1, isActive: 1 });

module.exports = mongoose.model('Category', categorySchema);

