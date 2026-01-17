const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  label: {
    type: String,
    enum: ['home', 'work', 'other'],
    default: 'home'
  },
  addressLine1: { type: String, required: true },
  addressLine2: String,
  landmark: String,
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true, index: true },
  latitude: Number,
  longitude: Number,
  isDefault: { type: Boolean, default: false }
});

const userSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    sparse: true
  },
  addresses: [addressSchema],
  status: {
    type: String,
    enum: ['active', 'blocked'],
    default: 'active',
    index: true
  },
  fcmToken: String,
  lastLogin: Date,
  totalOrders: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 }
}, {
  timestamps: true
});

// Indexes
userSchema.index({ createdAt: -1 });
userSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('User', userSchema);

