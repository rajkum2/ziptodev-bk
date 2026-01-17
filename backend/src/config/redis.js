const logger = require('../utils/logger');

// Redis adapter stub - can be implemented with ioredis
let redisClient = null;

const connectRedis = async () => {
  if (process.env.REDIS_ENABLED === 'true' && process.env.REDIS_URL) {
    try {
      // Uncomment when implementing with ioredis:
      // const Redis = require('ioredis');
      // redisClient = new Redis(process.env.REDIS_URL);
      // 
      // redisClient.on('connect', () => {
      //   logger.info('✅ Redis connected');
      // });
      // 
      // redisClient.on('error', (err) => {
      //   logger.error('Redis connection error:', err);
      // });

      logger.info('ℹ️  Redis adapter available but not initialized (stub)');
    } catch (error) {
      logger.error('Redis connection failed:', error);
    }
  } else {
    logger.info('ℹ️  Redis disabled');
  }
};

const getCache = async (key) => {
  if (!redisClient) return null;
  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    logger.error('Redis get error:', error);
    return null;
  }
};

const setCache = async (key, value, expirySeconds = 3600) => {
  if (!redisClient) return false;
  try {
    await redisClient.setex(key, expirySeconds, JSON.stringify(value));
    return true;
  } catch (error) {
    logger.error('Redis set error:', error);
    return false;
  }
};

const deleteCache = async (key) => {
  if (!redisClient) return false;
  try {
    await redisClient.del(key);
    return true;
  } catch (error) {
    logger.error('Redis delete error:', error);
    return false;
  }
};

const clearCachePattern = async (pattern) => {
  if (!redisClient) return false;
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(...keys);
    }
    return true;
  } catch (error) {
    logger.error('Redis clear pattern error:', error);
    return false;
  }
};

module.exports = {
  connectRedis,
  getCache,
  setCache,
  deleteCache,
  clearCachePattern,
  redisClient
};

