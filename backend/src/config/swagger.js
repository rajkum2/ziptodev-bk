const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Zipto API Documentation',
      version: '1.0.0',
      description: 'Complete API documentation for Zipto - Quick Commerce Platform',
      contact: {
        name: 'Zipto Dev Team'
      }
    },
    servers: [
      {
        url: 'http://localhost:3008',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token'
        }
      },
      schemas: {
        // Common Response Schemas
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string' },
            data: { type: 'object' }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: {
              type: 'object',
              properties: {
                code: { type: 'string' },
                message: { type: 'string' },
                details: { type: 'array', items: { type: 'object' } }
              }
            }
          }
        },
        ValidationError: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: {
              type: 'object',
              properties: {
                code: { type: 'string', example: 'VALIDATION_ERROR' },
                message: { type: 'string', example: 'Validation failed' },
                details: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      field: { type: 'string' },
                      message: { type: 'string' },
                      value: { type: 'string' }
                    }
                  }
                }
              }
            }
          }
        },
        Pagination: {
          type: 'object',
          properties: {
            page: { type: 'integer', example: 1 },
            limit: { type: 'integer', example: 10 },
            total: { type: 'integer', example: 100 },
            totalPages: { type: 'integer', example: 10 }
          }
        },

        // Auth Schemas
        SendOtpRequest: {
          type: 'object',
          required: ['phone'],
          properties: {
            phone: { type: 'string', pattern: '^[0-9]{10}$', example: '9876543210' }
          }
        },
        VerifyOtpRequest: {
          type: 'object',
          required: ['phone', 'otp'],
          properties: {
            phone: { type: 'string', example: '9876543210' },
            otp: { type: 'string', pattern: '^[0-9]{6}$', example: '123456' }
          }
        },
        AuthResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                token: { type: 'string' },
                refreshToken: { type: 'string' },
                user: { $ref: '#/components/schemas/User' }
              }
            }
          }
        },

        // User Schemas
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            phone: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
            addresses: { type: 'array', items: { $ref: '#/components/schemas/Address' } },
            status: { type: 'string', enum: ['active', 'blocked'] },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Address: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            addressLine1: { type: 'string' },
            addressLine2: { type: 'string' },
            city: { type: 'string' },
            state: { type: 'string' },
            pincode: { type: 'string' },
            isDefault: { type: 'boolean' }
          }
        },
        AddressRequest: {
          type: 'object',
          required: ['addressLine1', 'city', 'state', 'pincode'],
          properties: {
            addressLine1: { type: 'string', example: '123 Main Street' },
            addressLine2: { type: 'string', example: 'Apt 4B' },
            city: { type: 'string', example: 'Mumbai' },
            state: { type: 'string', example: 'Maharashtra' },
            pincode: { type: 'string', pattern: '^[0-9]{6}$', example: '400001' },
            isDefault: { type: 'boolean', example: false }
          }
        },

        // Product Schemas
        Product: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            slug: { type: 'string' },
            description: { type: 'string' },
            category: { $ref: '#/components/schemas/Category' },
            variants: { type: 'array', items: { $ref: '#/components/schemas/ProductVariant' } },
            images: { type: 'array', items: { type: 'string' } },
            isActive: { type: 'boolean' },
            tags: { type: 'array', items: { type: 'string' } },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        ProductVariant: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string', example: '500g' },
            price: { type: 'number', example: 99.99 },
            mrp: { type: 'number', example: 120 },
            stock: { type: 'integer', example: 100 },
            sku: { type: 'string' }
          }
        },
        CreateProductRequest: {
          type: 'object',
          required: ['name', 'categoryId', 'variants'],
          properties: {
            name: { type: 'string', example: 'Fresh Tomatoes' },
            description: { type: 'string' },
            categoryId: { type: 'string' },
            variants: {
              type: 'array',
              minItems: 1,
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  price: { type: 'number' },
                  mrp: { type: 'number' },
                  stock: { type: 'integer' },
                  sku: { type: 'string' }
                }
              }
            },
            tags: { type: 'array', items: { type: 'string' } },
            isActive: { type: 'boolean', default: true }
          }
        },

        // Category Schemas
        Category: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            slug: { type: 'string' },
            image: { type: 'string' },
            parent: { type: 'string' },
            order: { type: 'integer' },
            isActive: { type: 'boolean' }
          }
        },
        CreateCategoryRequest: {
          type: 'object',
          required: ['name'],
          properties: {
            name: { type: 'string', example: 'Fruits & Vegetables' },
            image: { type: 'string' },
            parent: { type: 'string' },
            order: { type: 'integer' },
            isActive: { type: 'boolean', default: true }
          }
        },

        // Order Schemas
        Order: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            orderNumber: { type: 'string' },
            user: { type: 'string' },
            items: { type: 'array', items: { $ref: '#/components/schemas/OrderItem' } },
            deliveryAddress: { $ref: '#/components/schemas/Address' },
            status: { type: 'string', enum: ['placed', 'confirmed', 'packing', 'out_for_delivery', 'delivered', 'cancelled'] },
            payment: { $ref: '#/components/schemas/PaymentInfo' },
            subtotal: { type: 'number' },
            deliveryFee: { type: 'number' },
            discount: { type: 'number' },
            total: { type: 'number' },
            deliveryPartner: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        OrderItem: {
          type: 'object',
          properties: {
            product: { type: 'string' },
            variant: { type: 'string' },
            name: { type: 'string' },
            variantName: { type: 'string' },
            price: { type: 'number' },
            quantity: { type: 'integer' }
          }
        },
        PaymentInfo: {
          type: 'object',
          properties: {
            method: { type: 'string', enum: ['cod', 'online', 'wallet', 'upi'] },
            status: { type: 'string', enum: ['pending', 'completed', 'failed', 'refunded'] },
            transactionId: { type: 'string' }
          }
        },
        CreateOrderRequest: {
          type: 'object',
          required: ['items', 'deliveryAddress', 'payment'],
          properties: {
            items: {
              type: 'array',
              minItems: 1,
              items: {
                type: 'object',
                required: ['productId', 'variantId', 'quantity'],
                properties: {
                  productId: { type: 'string' },
                  variantId: { type: 'string' },
                  quantity: { type: 'integer', minimum: 1 }
                }
              }
            },
            deliveryAddress: {
              type: 'object',
              required: ['addressLine1', 'city', 'pincode'],
              properties: {
                addressLine1: { type: 'string' },
                addressLine2: { type: 'string' },
                city: { type: 'string' },
                state: { type: 'string' },
                pincode: { type: 'string' }
              }
            },
            payment: {
              type: 'object',
              required: ['method'],
              properties: {
                method: { type: 'string', enum: ['cod', 'online', 'wallet', 'upi'] }
              }
            }
          }
        },

        // Banner Schemas
        Banner: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            title: { type: 'string' },
            image: { type: 'string' },
            link: { type: 'string' },
            order: { type: 'integer' },
            isActive: { type: 'boolean' },
            startDate: { type: 'string', format: 'date-time' },
            endDate: { type: 'string', format: 'date-time' }
          }
        },
        CreateBannerRequest: {
          type: 'object',
          required: ['title', 'image'],
          properties: {
            title: { type: 'string', example: 'Summer Sale' },
            image: { type: 'string' },
            link: { type: 'string' },
            order: { type: 'integer' },
            isActive: { type: 'boolean', default: true },
            startDate: { type: 'string', format: 'date-time' },
            endDate: { type: 'string', format: 'date-time' }
          }
        },

        // Shelf Schemas
        Shelf: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            title: { type: 'string' },
            type: { type: 'string', enum: ['featured', 'category', 'tag-based', 'manual'] },
            category: { type: 'string' },
            tags: { type: 'array', items: { type: 'string' } },
            products: { type: 'array', items: { type: 'string' } },
            order: { type: 'integer' },
            isActive: { type: 'boolean' }
          }
        },
        CreateShelfRequest: {
          type: 'object',
          required: ['title', 'type'],
          properties: {
            title: { type: 'string', example: 'Best Sellers' },
            type: { type: 'string', enum: ['featured', 'category', 'tag-based', 'manual'] },
            category: { type: 'string' },
            tags: { type: 'array', items: { type: 'string' } },
            products: { type: 'array', items: { type: 'string' } },
            order: { type: 'integer' },
            isActive: { type: 'boolean', default: true }
          }
        },

        // Location Schemas
        Location: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            pincode: { type: 'string' },
            area: { type: 'string' },
            city: { type: 'string' },
            state: { type: 'string' },
            isServiceable: { type: 'boolean' },
            deliveryFee: { type: 'number' },
            minOrderValue: { type: 'number' }
          }
        },
        CreateLocationRequest: {
          type: 'object',
          required: ['pincode', 'area', 'city', 'state'],
          properties: {
            pincode: { type: 'string', pattern: '^[0-9]{6}$', example: '400001' },
            area: { type: 'string', example: 'Colaba' },
            city: { type: 'string', example: 'Mumbai' },
            state: { type: 'string', example: 'Maharashtra' },
            isServiceable: { type: 'boolean', default: true },
            deliveryFee: { type: 'number', default: 0 },
            minOrderValue: { type: 'number', default: 0 }
          }
        },

        // Partner Schemas
        Partner: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            phone: { type: 'string' },
            vehicleType: { type: 'string', enum: ['bike', 'scooter', 'van', 'bicycle'] },
            status: { type: 'string', enum: ['available', 'busy', 'offline'] },
            currentLocation: {
              type: 'object',
              properties: {
                type: { type: 'string', example: 'Point' },
                coordinates: { type: 'array', items: { type: 'number' } }
              }
            },
            isActive: { type: 'boolean' }
          }
        },
        CreatePartnerRequest: {
          type: 'object',
          required: ['name', 'phone', 'vehicleType'],
          properties: {
            name: { type: 'string', example: 'John Doe' },
            phone: { type: 'string', pattern: '^[0-9]{10}$', example: '9876543210' },
            vehicleType: { type: 'string', enum: ['bike', 'scooter', 'van', 'bicycle'] }
          }
        },

        // Admin Schemas
        Admin: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            username: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string' },
            permissions: { type: 'array', items: { type: 'string' } },
            isActive: { type: 'boolean' }
          }
        },
        AdminLoginRequest: {
          type: 'object',
          required: ['username', 'password'],
          properties: {
            username: { type: 'string', example: 'admin' },
            password: { type: 'string', example: 'password123' }
          }
        },
        AdminLoginResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: {
              type: 'object',
              properties: {
                token: { type: 'string' },
                admin: { $ref: '#/components/schemas/Admin' }
              }
            }
          }
        },

        // Analytics Schemas
        AnalyticsOverview: {
          type: 'object',
          properties: {
            totalOrders: { type: 'integer' },
            totalRevenue: { type: 'number' },
            totalUsers: { type: 'integer' },
            totalProducts: { type: 'integer' },
            ordersToday: { type: 'integer' },
            revenueToday: { type: 'number' }
          }
        }
      }
    },
    tags: [
      { name: 'Health', description: 'Health check endpoints' },
      { name: 'Customer Auth', description: 'Customer authentication endpoints' },
      { name: 'User Profile', description: 'User profile management' },
      { name: 'Products', description: 'Product catalog endpoints' },
      { name: 'Categories', description: 'Category endpoints' },
      { name: 'Orders', description: 'Customer order endpoints' },
      { name: 'Banners', description: 'Banner endpoints' },
      { name: 'Shelves', description: 'Shelf endpoints' },
      { name: 'Locations', description: 'Location/serviceability endpoints' },
      { name: 'Admin Auth', description: 'Admin authentication endpoints' },
      { name: 'Admin Products', description: 'Admin product management' },
      { name: 'Admin Categories', description: 'Admin category management' },
      { name: 'Admin Orders', description: 'Admin order management' },
      { name: 'Admin Banners', description: 'Admin banner management' },
      { name: 'Admin Shelves', description: 'Admin shelf management' },
      { name: 'Admin Locations', description: 'Admin location management' },
      { name: 'Admin Partners', description: 'Admin delivery partner management' },
      { name: 'Admin Analytics', description: 'Analytics and reporting' },
      { name: 'Admin Reports', description: 'Report export endpoints' }
    ]
  },
  apis: ['./src/docs/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;