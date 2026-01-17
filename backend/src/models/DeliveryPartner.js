const mongoose = require('mongoose');

const deliveryPartnerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  vehicleType: {
    type: String,
    enum: ['bike', 'scooter', 'van', 'bicycle'],
    required: true
  },
  vehicleNumber: String,
  status: {
    type: String,
    enum: ['available', 'busy', 'offline'],
    default: 'offline',
    index: true
  },
  currentLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    }
  },
  activeOrderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },
  totalDeliveries: {
    type: Number,
    default: 0
  },
  todayDeliveries: {
    type: Number,
    default: 0
  },
  earnings: {
    today: { type: Number, default: 0 },
    total: { type: Number, default: 0 }
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  joinedDate: {
    type: Date,
    default: Date.now
  },
  lastLocationUpdate: Date,
  documents: {
    license: String,
    aadhar: String,
    pan: String
  }
}, {
  timestamps: true
});

// Create 2dsphere index for geospatial queries
deliveryPartnerSchema.index({ currentLocation: '2dsphere' });
deliveryPartnerSchema.index({ status: 1, isActive: 1 });

// Method to update location
deliveryPartnerSchema.methods.updateLocation = function(longitude, latitude) {
  this.currentLocation = {
    type: 'Point',
    coordinates: [longitude, latitude]
  };
  this.lastLocationUpdate = new Date();
  return this.save();
};

module.exports = mongoose.model('DeliveryPartner', deliveryPartnerSchema);

