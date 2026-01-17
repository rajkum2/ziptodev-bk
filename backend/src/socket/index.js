const { Server } = require('socket.io');
const { verifyAdminToken, verifyToken } = require('../utils/jwt');
const logger = require('../utils/logger');

let io;

/**
 * Initialize Socket.io server
 */
const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.SOCKET_CORS_ORIGINS?.split(',') || ['http://localhost:5173'],
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return next(new Error('Authentication token required'));
    }

    try {
      // Try admin token first
      try {
        const decoded = verifyAdminToken(token);
        socket.user = {
          ...decoded,
          type: 'admin'
        };
        return next();
      } catch (adminError) {
        // Try user token
        const decoded = verifyToken(token);
        socket.user = {
          ...decoded,
          type: 'user'
        };
        return next();
      }
    } catch (error) {
      logger.error('Socket authentication error:', error);
      return next(new Error('Invalid authentication token'));
    }
  });

  // Connection handler
  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id} (${socket.user.type})`);

    // Admin joins admin room
    if (socket.user.type === 'admin') {
      socket.join('admins');
      logger.info(`Admin ${socket.user.adminId} joined admin room`);
    } else {
      // User joins their own room
      socket.join(`user:${socket.user.userId}`);
      logger.info(`User ${socket.user.userId} joined their room`);
    }

    // Handle disconnection
    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`);
    });

    // Admin subscribes to specific order updates
    socket.on('subscribe:order', (orderId) => {
      if (socket.user.type === 'admin') {
        socket.join(`order:${orderId}`);
        logger.debug(`Admin subscribed to order: ${orderId}`);
      }
    });

    // Admin unsubscribes from order updates
    socket.on('unsubscribe:order', (orderId) => {
      socket.leave(`order:${orderId}`);
      logger.debug(`Unsubscribed from order: ${orderId}`);
    });
  });

  logger.info('✅ Socket.io initialized');
  return io;
};

/**
 * Get Socket.io instance
 */
const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

/**
 * Emit new order event to admins
 */
const emitNewOrder = (order) => {
  try {
    const io = getIO();
    io.to('admins').emit('new:order', order);
    logger.debug(`Emitted new order event: ${order.orderId}`);
  } catch (error) {
    logger.error('Error emitting new order event:', error);
  }
};

/**
 * Emit order status change
 */
const emitOrderStatusChange = (orderId, status, userId) => {
  try {
    const io = getIO();
    
    const data = {
      orderId,
      status,
      timestamp: new Date()
    };

    // Emit to admins
    io.to('admins').emit('order:status_changed', data);
    
    // Emit to specific order room
    io.to(`order:${orderId}`).emit('order:status_changed', data);
    
    // Emit to user
    if (userId) {
      io.to(`user:${userId}`).emit('order:status_changed', data);
    }

    logger.debug(`Emitted order status change: ${orderId} -> ${status}`);
  } catch (error) {
    logger.error('Error emitting order status change:', error);
  }
};

/**
 * Emit order assignment
 */
const emitOrderAssignment = (orderId, partnerId, partnerName) => {
  try {
    const io = getIO();
    
    const data = {
      orderId,
      partnerId,
      partnerName,
      timestamp: new Date()
    };

    // Emit to admins
    io.to('admins').emit('order:assigned', data);
    
    // Emit to specific order room
    io.to(`order:${orderId}`).emit('order:assigned', data);

    logger.debug(`Emitted order assignment: ${orderId} -> ${partnerName}`);
  } catch (error) {
    logger.error('Error emitting order assignment:', error);
  }
};

/**
 * Emit partner location update
 */
const emitPartnerLocationUpdate = (partnerId, location) => {
  try {
    const io = getIO();
    
    const data = {
      partnerId,
      location,
      timestamp: new Date()
    };

    // Emit to admins
    io.to('admins').emit('partner:location_update', data);

    logger.debug(`Emitted partner location update: ${partnerId}`);
  } catch (error) {
    logger.error('Error emitting partner location update:', error);
  }
};

/**
 * Emit notification to user
 */
const emitNotificationToUser = (userId, notification) => {
  try {
    const io = getIO();
    io.to(`user:${userId}`).emit('notification', notification);
    logger.debug(`Emitted notification to user: ${userId}`);
  } catch (error) {
    logger.error('Error emitting notification:', error);
  }
};

module.exports = {
  initializeSocket,
  getIO,
  emitNewOrder,
  emitOrderStatusChange,
  emitOrderAssignment,
  emitPartnerLocationUpdate,
  emitNotificationToUser
};

