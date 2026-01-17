const mongoose = require('mongoose');

const deliverySlotSchema = new mongoose.Schema({
  slotId: String,
  label: String,
  startTime: String,
  endTime: String,
  isAvailable: {
    type: Boolean,
    default: true
  }
});

const serviceableLocationSchema = new mongoose.Schema({
  pincode: {
    type: String,
    required: true,
    unique: true,
    index: true,
    trim: true
  },
  area: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    required: true,
    index: true,
    trim: true
  },
  state: {
    type: String,
    required: true,
    trim: true
  },
  isServiceable: {
    type: Boolean,
    default: true,
    index: true
  },
  deliverySlots: [deliverySlotSchema],
  warehouseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Warehouse'
  },
  estimatedDeliveryTime: {
    type: Number,
    default: 10,
    comment: 'in minutes'
  },
  deliveryFee: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes
serviceableLocationSchema.index({ city: 1, isServiceable: 1 });

module.exports = mongoose.model('ServiceableLocation', serviceableLocationSchema);

