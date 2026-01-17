require('dotenv').config();
const mongoose = require('mongoose');
const logger = require('../src/utils/logger');

// Import models
const Admin = require('../src/models/Admin');
const Category = require('../src/models/Category');
const Product = require('../src/models/Product');
const User = require('../src/models/User');
const Order = require('../src/models/Order');
const Banner = require('../src/models/Banner');
const Shelf = require('../src/models/Shelf');
const ServiceableLocation = require('../src/models/ServiceableLocation');
const DeliveryPartner = require('../src/models/DeliveryPartner');
const AnalyticsEvent = require('../src/models/AnalyticsEvent');

// Import seed data
const seedData = require('./seed-data');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info('✅ Connected to MongoDB Atlas');
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Clear existing data
const clearData = async () => {
  logger.info('Clearing existing data...');
  
  await Promise.all([
    Admin.deleteMany({}),
    Category.deleteMany({}),
    Product.deleteMany({}),
    User.deleteMany({}),
    Order.deleteMany({}),
    Banner.deleteMany({}),
    Shelf.deleteMany({}),
    ServiceableLocation.deleteMany({}),
    DeliveryPartner.deleteMany({}),
    AnalyticsEvent.deleteMany({})
  ]);

  logger.info('✅ Existing data cleared');
};

// Seed data
const seed = async () => {
  try {
    logger.info('🌱 Starting database seeding...\n');

    await connectDB();
    await clearData();

    // 1. Create admin user
    logger.info('Creating admin user...');
    const admin = await Admin.create(seedData.admin);
    logger.info(`✅ Admin created: ${admin.username}`);

    // 2. Create categories
    logger.info('\nCreating categories...');
    const categories = await Category.insertMany(seedData.categories);
    logger.info(`✅ Created ${categories.length} categories`);

    // 3. Create products
    logger.info('\nCreating products...');
    const productsWithCategories = seedData.products.map(product => ({
      ...product,
      categoryId: categories.find(c => c.slug === product.categorySlug)._id
    }));
    const products = await Product.insertMany(productsWithCategories);
    logger.info(`✅ Created ${products.length} products`);

    // 4. Create users
    logger.info('\nCreating users...');
    const users = await User.insertMany(seedData.users);
    logger.info(`✅ Created ${users.length} users`);

    // 5. Create serviceable locations
    logger.info('\nCreating serviceable locations...');
    const locations = await ServiceableLocation.insertMany(seedData.locations);
    logger.info(`✅ Created ${locations.length} locations`);

    // 6. Create delivery partners
    logger.info('\nCreating delivery partners...');
    const partners = await DeliveryPartner.insertMany(seedData.partners);
    logger.info(`✅ Created ${partners.length} delivery partners`);

    // 7. Create orders
    logger.info('\nCreating orders...');
    const ordersWithRefs = seedData.orders.map((order, index) => ({
      ...order,
      userId: users[index % users.length]._id,
      items: order.items.map(item => ({
        ...item,
        productId: products[Math.floor(Math.random() * products.length)]._id
      })),
      deliveryPartnerId: ['out_for_delivery', 'delivered'].includes(order.status)
        ? partners[index % partners.length]._id
        : null
    }));
    const orders = await Order.insertMany(ordersWithRefs);
    logger.info(`✅ Created ${orders.length} orders`);

    // 8. Create banners
    logger.info('\nCreating banners...');
    const banners = await Banner.insertMany(seedData.banners);
    logger.info(`✅ Created ${banners.length} banners`);

    // 9. Create shelves
    logger.info('\nCreating shelves...');
    const shelvesWithProducts = seedData.shelves.map(shelf => ({
      ...shelf,
      categorySlug: shelf.categorySlug || null,
      productIds: products
        .slice(0, 10)
        .map(p => p._id)
    }));
    const shelves = await Shelf.insertMany(shelvesWithProducts);
    logger.info(`✅ Created ${shelves.length} shelves`);

    // 10. Create analytics events
    logger.info('\nCreating analytics events...');
    const eventsWithRefs = seedData.analyticsEvents.map(event => ({
      ...event,
      userId: event.eventType === 'purchase' || Math.random() > 0.3
        ? users[Math.floor(Math.random() * users.length)]._id
        : null,
      metadata: {
        ...event.metadata,
        productId: ['product_view', 'add_to_cart'].includes(event.eventType)
          ? products[Math.floor(Math.random() * products.length)]._id
          : undefined
      }
    }));
    const events = await AnalyticsEvent.insertMany(eventsWithRefs);
    logger.info(`✅ Created ${events.length} analytics events`);

    logger.info('\n🎉 Database seeding completed successfully!\n');
    logger.info('📋 Summary:');
    logger.info(`   - Admins: ${1}`);
    logger.info(`   - Categories: ${categories.length}`);
    logger.info(`   - Products: ${products.length}`);
    logger.info(`   - Users: ${users.length}`);
    logger.info(`   - Orders: ${orders.length}`);
    logger.info(`   - Banners: ${banners.length}`);
    logger.info(`   - Shelves: ${shelves.length}`);
    logger.info(`   - Locations: ${locations.length}`);
    logger.info(`   - Delivery Partners: ${partners.length}`);
    logger.info(`   - Analytics Events: ${events.length}`);
    logger.info('\n🔑 Admin Credentials:');
    logger.info(`   Username: ${seedData.admin.username}`);
    logger.info(`   Password: Admin@123`);
    logger.info('');

    process.exit(0);
  } catch (error) {
    logger.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

// Run seed
seed();

