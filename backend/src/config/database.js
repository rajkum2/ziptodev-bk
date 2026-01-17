const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    const options = {
      maxPoolSize: 10,
      minPoolSize: 5,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 5000,
      family: 4
    };

    // Connect to MongoDB Atlas
    const conn = await mongoose.connect(process.env.MONGODB_URI, options);

    logger.info(`✅ MongoDB Atlas Connected: ${conn.connection.host}`);
    logger.info(`📦 Database: ${conn.connection.name}`);

    // Connection event handlers
    mongoose.connection.on('error', (err) => {
      logger.error(`MongoDB connection error: ${err}`);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed through app termination');
      process.exit(0);
    });

    return conn;
  } catch (error) {
    logger.error(`❌ MongoDB Atlas Connection Error: ${error.message}`);
    logger.error('Please check:');
    logger.error('1. MONGODB_URI is correctly set in .env');
    logger.error('2. IP address is whitelisted in MongoDB Atlas');
    logger.error('3. Database user has proper permissions');
    logger.error('4. Network connectivity is working');
    process.exit(1);
  }
};

module.exports = connectDB;

