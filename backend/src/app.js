const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

const { errorHandler, notFoundHandler } = require('./middlewares/errorHandler');
const { apiLimiter } = require('./middlewares/rateLimit');
const logger = require('./utils/logger');

// Initialize express app
const app = express();

// Trust proxy (for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:5173'],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Request logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim())
    }
  }));
}

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Zipto API is running',
    timestamp: new Date().toISOString()
  });
});

// Swagger API documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Zipto API Documentation'
}));

// Swagger JSON spec endpoint
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Apply rate limiting to API routes
app.use('/api', apiLimiter);

// Customer API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/user'));
app.use('/api/products', require('./routes/products'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/banners', require('./routes/banners'));
app.use('/api/shelves', require('./routes/shelves'));
app.use('/api/locations', require('./routes/locations'));
app.use('/api/chat', require('./routes/chat'));

// Admin API routes
app.use('/api/admin/auth', require('./routes/admin/auth'));
app.use('/api/admin/products', require('./routes/admin/products'));
app.use('/api/admin/categories', require('./routes/admin/categories'));
app.use('/api/admin/orders', require('./routes/admin/orders'));
app.use('/api/admin/banners', require('./routes/admin/banners'));
app.use('/api/admin/shelves', require('./routes/admin/shelves'));
app.use('/api/admin/locations', require('./routes/admin/locations'));
app.use('/api/admin/partners', require('./routes/admin/partners'));
app.use('/api/admin/analytics', require('./routes/admin/analytics'));
app.use('/api/admin/reports', require('./routes/admin/reports'));

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

module.exports = app;
