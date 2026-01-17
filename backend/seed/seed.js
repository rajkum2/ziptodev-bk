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
const Conversation = require('../src/models/Conversation');
const ConversationMessage = require('../src/models/ConversationMessage');
const RagTrace = require('../src/models/RagTrace');
const AdminChatAudit = require('../src/models/AdminChatAudit');
const { v4: uuidv4 } = require('uuid');

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
    AnalyticsEvent.deleteMany({}),
    Conversation.deleteMany({}),
    ConversationMessage.deleteMany({}),
    RagTrace.deleteMany({}),
    AdminChatAudit.deleteMany({})
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

    // 11. Create support conversations + messages + rag traces
    logger.info('\nCreating support conversations...');
    const queues = ['delivery', 'refund', 'payment', 'product', 'general'];
    const statuses = ['open', 'closed'];
    const modes = ['AI_ONLY', 'AI_ASSIST', 'HUMAN_ONLY'];
    const priorities = ['low', 'medium', 'high'];

    const sampleCustomerMessages = [
      'Hi, my delivery is delayed. Can you check?',
      'I want a refund for a missing item.',
      'Payment went through twice, please help.',
      'Do you have a return policy for dairy?',
      'The app crashed during checkout.',
      'How can I update my address?',
      'The order shows delivered but I did not receive it.',
      'Can I cancel my order?',
      'Need help with product availability.',
      'Please apply the coupon again.'
    ];

    const sampleAiReplies = [
      'Thanks for reaching out! I can help with that.',
      'I am checking the order status now.',
      'I have logged this and will update you shortly.',
      'Please share your order ID so I can assist.',
      'Apologies for the inconvenience. Let me look into this.',
      'Here is the refund policy snippet for your request.',
      'I have escalated this to our support team.'
    ];

    const sampleHumanReplies = [
      'Hi! I am reviewing this for you now.',
      'Thanks for the details. I will update you in a moment.',
      'We have initiated the refund from our side.',
      'I have re-sent the payment confirmation to your email.'
    ];

    const supportConversations = [];
    const supportMessages = [];
    const ragTraces = [];
    const audits = [];
    let ragTraceCount = 0;

    for (let i = 0; i < 15; i++) {
      const convId = uuidv4();
      const queue = queues[i % queues.length];
      const status = statuses[i % statuses.length];
      const mode = modes[i % modes.length];
      const priority = priorities[i % priorities.length];
      const customer = users[i % users.length];
      const assigned = i % 3 === 0 ? admin._id : null;
      const needsReview = i % 4 === 0;
      const createdAt = new Date(Date.now() - (15 - i) * 60 * 60 * 1000);

      const slaDue = i % 5 === 0 ? new Date(Date.now() - 5 * 60 * 1000) : new Date(Date.now() + 30 * 60 * 1000);
      const slaBreached = i % 5 === 0;

      supportConversations.push({
        conversationId: convId,
        customerUserId: customer._id,
        channel: 'web',
        status,
        mode,
        queue,
        priority,
        assignedToAdminId: assigned,
        needsReview,
        aiConfidence: i % 3 === 0 ? 'high' : i % 3 === 1 ? 'medium' : 'low',
        lastMessageAt: createdAt,
        slaFirstResponseDueAt: slaDue,
        slaBreached,
        createdAt,
        updatedAt: createdAt
      });

      if (assigned) {
        audits.push({
          auditId: uuidv4(),
          adminId: admin._id,
          conversationId: convId,
          action: 'ASSIGN',
          before: { assignedToAdminId: null },
          after: { assignedToAdminId: admin._id },
          createdAt
        });
      }

      const messageCount = 8 + (i % 12);
      let currentTime = new Date(createdAt);
      let addedTakeover = false;

      for (let m = 0; m < messageCount; m++) {
        const isCustomer = m % 2 === 0;
        const role = isCustomer ? 'customer' : (mode === 'HUMAN_ONLY' && m > 2 ? 'human' : 'assistant');
        const content = isCustomer
          ? sampleCustomerMessages[m % sampleCustomerMessages.length]
          : role === 'human'
            ? sampleHumanReplies[m % sampleHumanReplies.length]
            : sampleAiReplies[m % sampleAiReplies.length];

        const messageId = uuidv4();
        const traceId = uuidv4();
        const metadata = role === 'assistant' ? {
          traceId,
          model: 'gpt-4o-mini',
          latencyMs: 320 + (m * 10),
          ragEnabled: false,
          ragTraceId: null
        } : undefined;

        supportMessages.push({
          messageId,
          conversationId: convId,
          role,
          content,
          metadata,
          createdAt: currentTime
        });

        if (role === 'assistant' && ragTraceCount < 8 && m % 2 === 1) {
          const ragTraceId = uuidv4();
          ragTraceCount += 1;

          supportMessages[supportMessages.length - 1].metadata = {
            traceId,
            model: 'gpt-4o-mini',
            latencyMs: 420,
            ragEnabled: true,
            ragTraceId
          };

          ragTraces.push({
            ragTraceId,
            traceId,
            conversationId: convId,
            messageId,
            kbDocIds: ['doc-1', 'doc-2'],
            kbDocNames: ['Refund Policy', 'Delivery SLA'],
            chunks: [
              {
                docId: 'doc-1',
                docName: 'Refund Policy',
                chunkId: '12',
                score: 0.83,
                textPreview: 'Refunds are processed within 5-7 business days...'
              },
              {
                docId: 'doc-2',
                docName: 'Delivery SLA',
                chunkId: '7',
                score: 0.78,
                textPreview: 'Delivery timelines vary based on serviceable areas...'
              }
            ],
            params: {
              topK: 4,
              chunkSize: 800,
              overlap: 120
            },
            models: {
              embedModel: 'nomic-embed-text',
              chatModel: 'gpt-4o-mini'
            },
            latencyMs: 420,
            createdAt: currentTime
          });
        }

        currentTime = new Date(currentTime.getTime() + 3 * 60 * 1000);

        if (mode === 'HUMAN_ONLY' && !addedTakeover && m === 2) {
          supportMessages.push({
            messageId: uuidv4(),
            conversationId: convId,
            role: 'system',
            content: 'Human agent took over',
            createdAt: new Date(currentTime.getTime() + 60 * 1000)
          });
          audits.push({
            auditId: uuidv4(),
            adminId: admin._id,
            conversationId: convId,
            action: 'TAKEOVER',
            before: { mode: 'AI_ONLY' },
            after: { mode: 'HUMAN_ONLY' },
            createdAt: new Date(currentTime.getTime() + 60 * 1000)
          });
          addedTakeover = true;
          currentTime = new Date(currentTime.getTime() + 4 * 60 * 1000);
        }
      }

      if (status === 'closed') {
        supportMessages.push({
          messageId: uuidv4(),
          conversationId: convId,
          role: 'system',
          content: 'Conversation closed',
          createdAt: new Date(currentTime.getTime() + 2 * 60 * 1000)
        });
        audits.push({
          auditId: uuidv4(),
          adminId: admin._id,
          conversationId: convId,
          action: 'CLOSE',
          before: { status: 'open' },
          after: { status: 'closed' },
          createdAt: new Date(currentTime.getTime() + 2 * 60 * 1000)
        });
        currentTime = new Date(currentTime.getTime() + 2 * 60 * 1000);
      }

      supportConversations[i].lastMessageAt = currentTime;
      supportConversations[i].updatedAt = currentTime;
    }

    const conversationsInserted = await Conversation.insertMany(supportConversations);
    await ConversationMessage.insertMany(supportMessages);
    await RagTrace.insertMany(ragTraces);
    await AdminChatAudit.insertMany(audits);
    logger.info(`✅ Created ${conversationsInserted.length} support conversations`);
    logger.info(`✅ Created ${supportMessages.length} support messages`);
    logger.info(`✅ Created ${ragTraces.length} RAG traces`);
    logger.info(`✅ Created ${audits.length} admin chat audits`);

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

