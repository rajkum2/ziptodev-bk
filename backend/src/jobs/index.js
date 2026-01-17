const cron = require('node-cron');
const Product = require('../models/Product');
const DeliveryPartner = require('../models/DeliveryPartner');
const logger = require('../utils/logger');

/**
 * Low stock alert job - runs daily at 9 AM
 */
const lowStockAlertJob = cron.schedule('0 9 * * *', async () => {
  try {
    logger.info('Running low stock alert job...');

    const lowStockProducts = await Product.find({
      isActive: true,
      'variants.stock': { $lt: 10, $gt: 0 }
    }).select('name variants');

    if (lowStockProducts.length > 0) {
      logger.warn(`Low stock alert: ${lowStockProducts.length} products`);
      // TODO: Send email/notification to admins
    } else {
      logger.info('No low stock products found');
    }
  } catch (error) {
    logger.error('Low stock alert job error:', error);
  }
}, {
  scheduled: false // Start manually
});

/**
 * Reset daily delivery stats - runs daily at midnight
 */
const resetDailyStatsJob = cron.schedule('0 0 * * *', async () => {
  try {
    logger.info('Resetting daily delivery stats...');

    await DeliveryPartner.updateMany(
      {},
      { todayDeliveries: 0, 'earnings.today': 0 }
    );

    logger.info('Daily stats reset completed');
  } catch (error) {
    logger.error('Reset daily stats job error:', error);
  }
}, {
  scheduled: false
});

/**
 * Scheduled reports job - runs weekly on Monday at 10 AM
 */
const weeklyReportJob = cron.schedule('0 10 * * 1', async () => {
  try {
    logger.info('Generating weekly report...');
    
    // TODO: Generate and send weekly reports
    
    logger.info('Weekly report generated');
  } catch (error) {
    logger.error('Weekly report job error:', error);
  }
}, {
  scheduled: false
});

/**
 * Abandoned cart reminder - runs every 6 hours
 */
const abandonedCartJob = cron.schedule('0 */6 * * *', async () => {
  try {
    logger.info('Checking for abandoned carts...');
    
    // TODO: Implement abandoned cart logic
    
    logger.info('Abandoned cart check completed');
  } catch (error) {
    logger.error('Abandoned cart job error:', error);
  }
}, {
  scheduled: false
});

/**
 * Start all cron jobs
 */
const startCronJobs = () => {
  if (process.env.NODE_ENV === 'production' || process.env.ENABLE_CRON === 'true') {
    lowStockAlertJob.start();
    resetDailyStatsJob.start();
    weeklyReportJob.start();
    abandonedCartJob.start();
    
    logger.info('✅ Cron jobs started');
  } else {
    logger.info('ℹ️  Cron jobs disabled in development');
  }
};

/**
 * Stop all cron jobs
 */
const stopCronJobs = () => {
  lowStockAlertJob.stop();
  resetDailyStatsJob.stop();
  weeklyReportJob.stop();
  abandonedCartJob.stop();
  
  logger.info('Cron jobs stopped');
};

module.exports = {
  startCronJobs,
  stopCronJobs
};

