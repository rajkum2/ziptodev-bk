const slugify = require('slugify');

/**
 * Generate slug from text
 */
const generateSlug = (text) => {
  return slugify(text, {
    lower: true,
    strict: true,
    remove: /[*+~.()'"!:@]/g
  });
};

/**
 * Generate OTP
 */
const generateOTP = (length = 6) => {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
};

/**
 * Generate unique order ID
 */
const generateOrderId = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD${timestamp}${random}`;
};

/**
 * Pagination helper
 */
const getPagination = (page = 1, limit = 20) => {
  const pageNum = parseInt(page) || 1;
  const limitNum = parseInt(limit) || 20;
  const skip = (pageNum - 1) * limitNum;
  
  return {
    page: pageNum,
    limit: limitNum,
    skip
  };
};

/**
 * Build pagination response
 */
const buildPaginationResponse = (page, limit, total) => {
  return {
    page: parseInt(page),
    limit: parseInt(limit),
    total,
    pages: Math.ceil(total / limit),
    hasNext: page * limit < total,
    hasPrev: page > 1
  };
};

/**
 * Calculate discount percentage
 */
const calculateDiscount = (mrp, price) => {
  if (mrp <= price) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
};

/**
 * Format currency
 */
const formatCurrency = (amount, currency = 'INR') => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency
  }).format(amount);
};

/**
 * Calculate delivery fee
 */
const calculateDeliveryFee = (itemTotal) => {
  const defaultFee = parseFloat(process.env.DEFAULT_DELIVERY_FEE) || 20;
  const threshold = parseFloat(process.env.FREE_DELIVERY_THRESHOLD) || 299;
  
  return itemTotal >= threshold ? 0 : defaultFee;
};

/**
 * Calculate handling fee
 */
const calculateHandlingFee = (itemTotal) => {
  const handlingFee = parseFloat(process.env.HANDLING_FEE) || 5;
  return handlingFee;
};

/**
 * Calculate order pricing
 */
const calculateOrderPricing = (items, tip = 0) => {
  const itemTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const itemMrpTotal = items.reduce((sum, item) => sum + ((item.mrp || item.price) * item.quantity), 0);
  const deliveryFee = calculateDeliveryFee(itemTotal);
  const handlingFee = calculateHandlingFee(itemTotal);
  const totalSavings = itemMrpTotal - itemTotal;
  const grandTotal = itemTotal + deliveryFee + handlingFee + tip;

  return {
    itemTotal,
    deliveryFee,
    handlingFee,
    tip,
    totalSavings,
    grandTotal
  };
};

/**
 * Sanitize phone number
 */
const sanitizePhone = (phone) => {
  return phone.replace(/[^0-9]/g, '');
};

/**
 * Check if coordinates are valid
 */
const isValidCoordinates = (longitude, latitude) => {
  return (
    typeof longitude === 'number' &&
    typeof latitude === 'number' &&
    longitude >= -180 &&
    longitude <= 180 &&
    latitude >= -90 &&
    latitude <= 90
  );
};

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRad = (value) => {
  return (value * Math.PI) / 180;
};

/**
 * Get estimated delivery time based on distance
 */
const getEstimatedDeliveryTime = (distanceKm) => {
  const baseTime = 10; // 10 minutes base time
  const additionalTime = Math.ceil(distanceKm / 2) * 5; // 5 min per 2km
  return Math.min(baseTime + additionalTime, 30); // Max 30 minutes
};

/**
 * Mask phone number
 */
const maskPhone = (phone) => {
  if (!phone || phone.length < 4) return phone;
  return phone.slice(0, -4).replace(/./g, '*') + phone.slice(-4);
};

/**
 * Mask email
 */
const maskEmail = (email) => {
  if (!email) return email;
  const [name, domain] = email.split('@');
  if (name.length <= 2) return email;
  return name[0] + '*'.repeat(name.length - 2) + name[name.length - 1] + '@' + domain;
};

/**
 * Random item from array
 */
const randomItem = (array) => {
  return array[Math.floor(Math.random() * array.length)];
};

/**
 * Sleep/delay function
 */
const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

module.exports = {
  generateSlug,
  generateOTP,
  generateOrderId,
  getPagination,
  buildPaginationResponse,
  calculateDiscount,
  formatCurrency,
  calculateDeliveryFee,
  calculateHandlingFee,
  calculateOrderPricing,
  sanitizePhone,
  isValidCoordinates,
  calculateDistance,
  getEstimatedDeliveryTime,
  maskPhone,
  maskEmail,
  randomItem,
  sleep
};

