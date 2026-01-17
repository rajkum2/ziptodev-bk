const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
  variantId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  label: String,
  mrp: {
    type: Number,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  inStock: {
    type: Boolean,
    default: true
  },
  stock: {
    type: Number,
    default: 0
  },
  sku: String,
  unit: String,
  weight: Number
});

const complianceSchema = new mongoose.Schema({
  fssai: String,
  seller: String,
  address: String,
  manufacturedBy: String,
  marketedBy: String
});

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  brand: {
    type: String,
    trim: true,
    index: true
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
    index: true
  },
  images: [{
    url: String,
    alt: String,
    publicId: String
  }],
  variants: [variantSchema],
  tags: {
    type: [String]
  },
  highlights: {
    type: Map,
    of: String
  },
  description: String,
  compliance: complianceSchema,
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  stock: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  sales: {
    type: Number,
    default: 0
  },
  rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Indexes
productSchema.index({ name: 'text', brand: 'text', tags: 'text' });
productSchema.index({ categoryId: 1, isActive: 1 });
productSchema.index({ brand: 1, isActive: 1 });
productSchema.index({ tags: 1, isActive: 1 });
productSchema.index({ isActive: 1, createdAt: -1 });
productSchema.index({ sales: -1 });

// Virtual for discount percentage
productSchema.virtual('hasDiscount').get(function() {
  return this.variants.some(v => v.price < v.mrp);
});

module.exports = mongoose.model('Product', productSchema);

