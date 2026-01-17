require('dotenv').config();
const http = require('http');
const app = require('./app');
const connectDB = require('./config/database');
const { connectRedis } = require('./config/redis');
const { configureCloudinary } = require('./config/cloudinary');
const { initializeSocket } = require('./socket');
const { startCronJobs, stopCronJobs } = require('./jobs');
const logger = require('./utils/logger');

// Validate required environment variables
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET', 'ADMIN_JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  logger.error(`❌ Missing required environment variables: ${missingEnvVars.join(', ')}`);
  logger.error('Please check your .env file');
  process.exit(1);
}

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Initialize services and start server
const startServer = async () => {
  try {
    // Connect to MongoDB Atlas
    await connectDB();

    // Connect to Redis (optional)
    await connectRedis();

    // Configure Cloudinary (optional)
    configureCloudinary();

    // Initialize Socket.io
    initializeSocket(server);

    // Start cron jobs
    startCronJobs();

    // Start server
    server.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🔗 API: http://localhost:${PORT}/api`);
      logger.info(`🔗 Health: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  logger.info(`\n${signal} received. Starting graceful shutdown...`);

  // Stop accepting new connections
  server.close(async () => {
    logger.info('HTTP server closed');

    try {
      // Stop cron jobs
      stopCronJobs();

      // Close database connection
      const mongoose = require('mongoose');
      await mongoose.connection.close();
      logger.info('MongoDB connection closed');

      logger.info('Graceful shutdown completed');
      process.exit(0);
    } catch (error) {
      logger.error('Error during shutdown:', error);
      process.exit(1);
    }
  });

  // Force shutdown after 30 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 30000);
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Start the server
startServer();

