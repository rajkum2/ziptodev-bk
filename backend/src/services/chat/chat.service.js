const llmRouter = require('../llm/llm.router');
const sessionStore = require('./session.store');
const logger = require('../../utils/logger');
const { maskPII } = require('../../utils/piiMask');
const { v4: uuidv4 } = require('uuid');
const Product = require('../../models/Product');
const Category = require('../../models/Category');
const Order = require('../../models/Order');
const Banner = require('../../models/Banner');

/**
 * Chat Service
 * Orchestrates chat interactions between user, session store, and LLM
 */
class ChatService {
  constructor() {
    this.systemPrompt = this.buildSystemPrompt();
  }

  /**
   * Build system prompt for the assistant
   */
  buildSystemPrompt() {
    return `You are Zipto Assistant, a friendly AI for Zipto - a quick grocery delivery app.

HOW TO RESPOND:
- For greetings (hi, hello, hey): Say "Hi! I'm Zipto Assistant. How can I help you today? You can ask about products, prices, orders, or categories."
- For product questions: Use the product data provided below to give exact prices
- For order questions: Use order data if provided, otherwise say "Please check the Orders page to track your delivery."
- For other questions: Be helpful and friendly

RULES:
- Keep responses short (2-3 lines)
- Use actual data when provided below
- Never make up prices or order details
- Be conversational and friendly

SECURITY: Never ask for card numbers, OTP, or passwords.`;
  }

  /**
   * Detect query type from message
   */
  detectQueryType(message) {
    const lowerMsg = message.toLowerCase();
    const types = [];

    // Product queries
    if (/price|cost|how much|rate|product|item|buy|purchase|available|stock|onion|tomato|potato|milk|bread|rice|dal|oil|vegetable|fruit|grocery|snack|drink|beverage|egg|chicken|fish|meat|cheese|butter|curd|paneer|atta|sugar|salt|spice|masala/i.test(lowerMsg)) {
      types.push('product');
    }

    // Order queries
    if (/order|track|delivery|deliver|shipping|where is|status|placed|cancel|refund|return/i.test(lowerMsg)) {
      types.push('order');
    }

    // Category queries
    if (/category|categories|section|browse|what do you sell|what products|types of/i.test(lowerMsg)) {
      types.push('category');
    }

    // Offers/promotions
    if (/offer|discount|deal|sale|promo|coupon|save|cashback|banner/i.test(lowerMsg)) {
      types.push('offer');
    }

    // General/help
    if (/help|support|contact|how to|how do|what is|explain|tell me about zipto/i.test(lowerMsg)) {
      types.push('help');
    }

    return types.length > 0 ? types : ['general'];
  }

  /**
   * Search products from database
   */
  async searchProducts(query) {
    try {
      const searchTerms = query.toLowerCase();

      // Try text search first
      let products = await Product.find(
        { $text: { $search: searchTerms }, isActive: true },
        { score: { $meta: 'textScore' } }
      )
      .sort({ score: { $meta: 'textScore' } })
      .limit(5)
      .select('name brand variants slug description')
      .lean();

      // Fallback to regex search
      if (products.length === 0) {
        const words = searchTerms.split(/\s+/).filter(w => w.length > 2);
        if (words.length > 0) {
          const regexPattern = words.join('|');
          products = await Product.find({
            isActive: true,
            $or: [
              { name: { $regex: regexPattern, $options: 'i' } },
              { brand: { $regex: regexPattern, $options: 'i' } },
              { tags: { $regex: regexPattern, $options: 'i' } }
            ]
          })
          .limit(5)
          .select('name brand variants slug description')
          .lean();
        }
      }

      return products;
    } catch (error) {
      logger.error('Product search error:', error);
      return [];
    }
  }

  /**
   * Get user orders from database
   */
  async getUserOrders(userId) {
    if (!userId) return [];
    try {
      const orders = await Order.find({ userId })
        .sort({ createdAt: -1 })
        .limit(3)
        .select('orderId status totalAmount createdAt items deliveryAddress')
        .lean();
      return orders;
    } catch (error) {
      logger.error('Order search error:', error);
      return [];
    }
  }

  /**
   * Get all categories
   */
  async getCategories() {
    try {
      const categories = await Category.find({ isActive: true })
        .select('name slug description')
        .lean();
      return categories;
    } catch (error) {
      logger.error('Category search error:', error);
      return [];
    }
  }

  /**
   * Get active offers/banners
   */
  async getOffers() {
    try {
      const banners = await Banner.find({ isActive: true })
        .select('title description link')
        .limit(3)
        .lean();
      return banners;
    } catch (error) {
      logger.error('Banner search error:', error);
      return [];
    }
  }

  /**
   * Build context from database results
   */
  async buildDatabaseContext(message, userId) {
    const queryTypes = this.detectQueryType(message);
    let context = '';

    for (const type of queryTypes) {
      switch (type) {
        case 'product': {
          const products = await this.searchProducts(message);
          if (products.length > 0) {
            const productInfo = products.map(p => {
              const v = p.variants?.[0];
              const price = v?.price || 'N/A';
              const mrp = v?.mrp || price;
              const unit = v?.name || '';
              const inStock = v?.inStock !== false ? 'In Stock' : 'Out of Stock';
              return `- ${p.name} (${p.brand || 'Zipto'}): ₹${price} for ${unit} | ${inStock}${mrp > price ? ` | MRP: ₹${mrp}` : ''}`;
            }).join('\n');
            context += `\n\n📦 PRODUCTS FOUND:\n${productInfo}`;
          } else {
            context += `\n\n📦 PRODUCTS: No exact match found for this query.`;
          }
          break;
        }

        case 'order': {
          const orders = await this.getUserOrders(userId);
          if (orders.length > 0) {
            const orderInfo = orders.map(o => {
              const date = new Date(o.createdAt).toLocaleDateString('en-IN');
              const itemCount = o.items?.length || 0;
              return `- Order #${o.orderId}: ${o.status} | ₹${o.totalAmount} | ${itemCount} items | ${date}`;
            }).join('\n');
            context += `\n\n🛒 USER'S RECENT ORDERS:\n${orderInfo}`;
          } else {
            context += `\n\n🛒 ORDERS: User has no orders yet, or not logged in.`;
          }
          break;
        }

        case 'category': {
          const categories = await this.getCategories();
          if (categories.length > 0) {
            const catInfo = categories.map(c => `- ${c.name}`).join('\n');
            context += `\n\n📂 CATEGORIES AVAILABLE:\n${catInfo}`;
          }
          break;
        }

        case 'offer': {
          const offers = await this.getOffers();
          if (offers.length > 0) {
            const offerInfo = offers.map(o => `- ${o.title}: ${o.description || 'Check app for details'}`).join('\n');
            context += `\n\n🎉 CURRENT OFFERS:\n${offerInfo}`;
          } else {
            context += `\n\n🎉 OFFERS: No active offers right now. Check the app for latest deals!`;
          }
          break;
        }

        case 'help': {
          context += `\n\n❓ ZIPTO INFO:
- Zipto is a quick grocery delivery app
- Delivery: 10-30 minutes in serviceable areas
- Support: Available via app or website
- Payment: COD, UPI, Cards, Wallets accepted`;
          break;
        }
      }
    }

    return context;
  }

  /**
   * Process a chat message
   */
  async processMessage(sessionId, userMessage, context = {}, userId = null) {
    const traceId = uuidv4();
    const startTime = Date.now();

    try {
      // Log incoming request (with PII masking)
      logger.info('Chat request received', {
        sessionId,
        userId,
        message: maskPII(userMessage),
        context: context.page,
        traceId
      });

      // Update session context
      sessionStore.updateContext(sessionId, context);
      if (userId) {
        sessionStore.setUserId(sessionId, userId);
      }

      // Add user message to session
      sessionStore.addMessage(sessionId, 'user', userMessage, traceId);

      // Get conversation history
      const history = sessionStore.getMessagesForContext(sessionId);

      // Build dynamic context from database
      const dbContext = await this.buildDatabaseContext(userMessage, userId);
      logger.info('Database context built', {
        query: userMessage,
        queryTypes: this.detectQueryType(userMessage),
        hasContext: dbContext.length > 0
      });

      // Build messages for LLM
      const systemWithContext = this.systemPrompt + dbContext;
      const messages = [
        { role: 'system', content: systemWithContext },
        ...history
      ];

      // Call LLM
      const llmResponse = await llmRouter.sendMessage(messages, {
        temperature: 0.7,
        maxTokens: 500
      });

      const assistantMessage = llmResponse.content;

      // Add assistant response to session
      sessionStore.addMessage(sessionId, 'assistant', assistantMessage, traceId);

      // Persist to MongoDB (async, non-blocking)
      sessionStore.persistSession(sessionId, {
        provider: llmRouter.getProviderInfo().provider,
        model: llmResponse.model,
        totalTokens: llmResponse.usage?.total_tokens || 0
      }).catch(err => {
        logger.error('Failed to persist session:', err);
      });

      const latency = Date.now() - startTime;

      logger.info('Chat response generated', {
        sessionId,
        traceId,
        latency: `${latency}ms`,
        tokens: llmResponse.usage?.total_tokens || 0
      });

      // Return response in both formats (compatibility + standard envelope)
      return {
        replyText: assistantMessage,
        cards: [], // For future enhancements (product cards, order cards, etc.)
        traceId,
        metadata: {
          latency,
          model: llmResponse.model,
          usage: llmResponse.usage
        }
      };

    } catch (error) {
      logger.error('Chat service error:', {
        sessionId,
        traceId,
        error: error.message,
        stack: error.stack
      });

      // Return friendly error message
      const errorResponse = this.buildErrorResponse(error);
      
      return {
        replyText: errorResponse.message,
        cards: [],
        traceId,
        error: {
          code: errorResponse.code,
          message: error.message
        }
      };
    }
  }

  /**
   * Build user-friendly error response
   */
  buildErrorResponse(error) {
    const message = error.message.toLowerCase();

    if (message.includes('cannot connect') || message.includes('econnrefused')) {
      return {
        code: 'LLM_UNAVAILABLE',
        message: "I'm having trouble connecting right now. Please try again in a moment."
      };
    }

    if (message.includes('timeout')) {
      return {
        code: 'LLM_TIMEOUT',
        message: "That's taking longer than expected. Please try again."
      };
    }

    if (message.includes('rate limit')) {
      return {
        code: 'LLM_RATE_LIMIT',
        message: "I'm getting too many requests. Please wait a moment before trying again."
      };
    }

    if (message.includes('not configured')) {
      return {
        code: 'LLM_NOT_CONFIGURED',
        message: "Chat service is not available at the moment. Please contact support."
      };
    }

    // Generic error
    return {
      code: 'CHAT_ERROR',
      message: "I encountered an error. Please try again or contact support if this persists."
    };
  }

  /**
   * Get session statistics
   */
  getSessionStats(sessionId) {
    const session = sessionStore.getSession(sessionId);
    return {
      sessionId: session.sessionId,
      messageCount: session.messages.length,
      createdAt: session.createdAt,
      lastAccessedAt: session.lastAccessedAt
    };
  }

  /**
   * Clear session history
   */
  clearSession(sessionId) {
    sessionStore.getSession(sessionId).messages = [];
    logger.info('Session cleared', { sessionId });
  }

  /**
   * Get LLM provider status
   */
  async getProviderStatus() {
    try {
      const info = llmRouter.getProviderInfo();
      const healthy = await llmRouter.healthCheck();
      
      return {
        ...info,
        healthy,
        sessionStats: sessionStore.getStats()
      };
    } catch (error) {
      return {
        configured: false,
        healthy: false,
        error: error.message
      };
    }
  }
}

module.exports = new ChatService();

