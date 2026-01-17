const cloudinary = require('cloudinary').v2;
const logger = require('../utils/logger');

// Configure Cloudinary (optional adapter)
const configureCloudinary = () => {
  if (process.env.UPLOAD_DRIVER === 'cloudinary' && process.env.CLOUDINARY_URL) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });
    logger.info('✅ Cloudinary configured');
  }
};

const uploadToCloudinary = async (filePath, folder = 'zipto') => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: 'auto',
      transformation: [
        { width: 1000, crop: 'limit' },
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ]
    });
    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height
    };
  } catch (error) {
    logger.error('Cloudinary upload error:', error);
    throw error;
  }
};

const deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
    logger.info(`Deleted image from Cloudinary: ${publicId}`);
  } catch (error) {
    logger.error('Cloudinary delete error:', error);
    throw error;
  }
};

module.exports = {
  configureCloudinary,
  uploadToCloudinary,
  deleteFromCloudinary,
  cloudinary
};

