const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  variantId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  variantLabel: String,
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true
  },
  mrp: Number,
  image: String
});

const deliveryAddressSchema = new mongoose.Schema({
  name: String,
  phone: String,
  addressLine1: { type: String, required: true },
  addressLine2: String,
  landmark: String,
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  latitude: Number,
  longitude: Number
});

const paymentSchema = new mongoose.Schema({
  method: {
    type: String,
    enum: ['cod', 'online', 'wallet', 'upi'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'success', 'failed', 'refunded'],
    default: 'pending'
  },
  transactionId: String,
  paidAt: Date,
  refundedAt: Date
});

const pricingSchema = new mongoose.Schema({
  itemTotal: { type: Number, required: true },
  deliveryFee: { type: Number, default: 0 },
  handlingFee: { type: Number, default: 0 },
  tip: { type: Number, default: 0 },
  totalSavings: { type: Number, default: 0 },
  grandTotal: { type: Number, required: true }
});

const statusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  note: String,
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
});

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  items: [orderItemSchema],
  deliveryAddress: deliveryAddressSchema,
  payment: paymentSchema,
  pricing: pricingSchema,
  status: {
    type: String,
    enum: ['placed', 'confirmed', 'packing', 'out_for_delivery', 'delivered', 'cancelled'],
    default: 'placed',
    index: true
  },
  statusHistory: [statusHistorySchema],
  instructions: String,
  needBag: {
    type: Boolean,
    default: false
  },
  deliveryPartnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DeliveryPartner'
  },
  estimatedDelivery: Date,
  actualDelivery: Date,
  cancelReason: String,
  cancelledAt: Date,
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'cancelledByModel'
  },
  cancelledByModel: {
    type: String,
    enum: ['User', 'Admin']
  }
}, {
  timestamps: true
});

// Indexes
orderSchema.index({ createdAt: -1 });
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ deliveryPartnerId: 1, status: 1 });
orderSchema.index({ 'deliveryAddress.pincode': 1 });
orderSchema.index({ 'deliveryAddress.city': 1 });
orderSchema.index({ 'payment.method': 1 });
orderSchema.index({ 'payment.status': 1 });

// Generate orderId before saving
orderSchema.pre('save', async function(next) {
  if (!this.orderId) {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.orderId = `ORD${timestamp}${random}`;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);

