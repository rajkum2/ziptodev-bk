/**
 * PII Masking Utility
 * Masks sensitive information in logs and messages
 */

// Patterns for detecting PII
const PII_PATTERNS = {
  // Email: user@example.com -> u***@example.com
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  
  // Phone: +1234567890 or 123-456-7890 -> ***-***-7890
  phone: /(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)(\d{3}[-.\s]?)(\d{4})\b/g,
  
  // Credit card: 1234-5678-9012-3456 -> ****-****-****-3456
  creditCard: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
  
  // Indian PAN: ABCDE1234F -> ABC****34F
  pan: /\b[A-Z]{3}[ABCFGHLJPT][A-Z]\d{4}[A-Z]\b/g,
  
  // Aadhaar: 1234-5678-9012 or 123456789012 -> ****-****-9012
  aadhaar: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
  
  // OTP/PIN: 6 digits -> ******
  otp: /\b\d{6}\b/g,
  
  // CVV: 3-4 digits at end -> ***
  cvv: /\bCVV:?\s*\d{3,4}\b/gi
};

/**
 * Mask email addresses
 */
function maskEmail(email) {
  const [username, domain] = email.split('@');
  const maskedUsername = username.length > 2 
    ? username[0] + '***' 
    : '***';
  return `${maskedUsername}@${domain}`;
}

/**
 * Mask phone numbers (keep last 4 digits)
 */
function maskPhone(match, p1, p2, p3, p4) {
  return '***-***-' + p4;
}

/**
 * Mask credit card numbers (keep last 4 digits)
 */
function maskCreditCard(card) {
  return '****-****-****-' + card.slice(-4);
}

/**
 * Mask Indian PAN (keep first 3 and last 3 characters)
 */
function maskPAN(pan) {
  return pan.slice(0, 3) + '****' + pan.slice(-2);
}

/**
 * Mask Aadhaar (keep last 4 digits)
 */
function maskAadhaar(aadhaar) {
  return '****-****-' + aadhaar.slice(-4);
}

/**
 * Main masking function
 */
function maskPII(text) {
  if (!text || typeof text !== 'string') {
    return text;
  }

  let masked = text;

  // Mask emails
  masked = masked.replace(PII_PATTERNS.email, (match) => maskEmail(match));

  // Mask phone numbers
  masked = masked.replace(PII_PATTERNS.phone, maskPhone);

  // Mask credit cards
  masked = masked.replace(PII_PATTERNS.creditCard, (match) => maskCreditCard(match));

  // Mask PAN
  masked = masked.replace(PII_PATTERNS.pan, (match) => maskPAN(match));

  // Mask OTP/PIN
  masked = masked.replace(PII_PATTERNS.otp, '******');

  // Mask CVV
  masked = masked.replace(PII_PATTERNS.cvv, 'CVV: ***');

  return masked;
}

/**
 * Mask PII in objects (recursive)
 */
function maskPIIInObject(obj) {
  if (typeof obj === 'string') {
    return maskPII(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(item => maskPIIInObject(item));
  }

  if (obj && typeof obj === 'object') {
    const masked = {};
    for (const [key, value] of Object.entries(obj)) {
      masked[key] = maskPIIInObject(value);
    }
    return masked;
  }

  return obj;
}

module.exports = {
  maskPII,
  maskPIIInObject
};

