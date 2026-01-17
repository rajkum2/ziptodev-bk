/**
 * @swagger
 * /api/admin/auth/login:
 *   post:
 *     summary: Admin login
 *     tags: [Admin Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdminLoginRequest'
 *     responses:
 *       200:
 *         description: Admin logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminLoginResponse'
 *       401:
 *         description: Invalid credentials
 *       429:
 *         description: Rate limit exceeded
 */

/**
 * @swagger
 * /api/admin/auth/logout:
 *   post:
 *     summary: Admin logout
 *     tags: [Admin Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/admin/auth/me:
 *   get:
 *     summary: Get current admin profile
 *     tags: [Admin Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin profile retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/Admin' }
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/admin/auth/profile:
 *   put:
 *     summary: Update admin profile
 *     tags: [Admin Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string, format: email }
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/admin/auth/change-password:
 *   post:
 *     summary: Change admin password
 *     tags: [Admin Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword: { type: string }
 *               newPassword: { type: string, minLength: 6 }
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       401:
 *         description: Invalid current password
 */

/**
 * @swagger
 * /api/admin/products:
 *   get:
 *     summary: Get all products (admin)
 *     tags: [Admin Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: isActive
 *         schema: { type: boolean }
 *     responses:
 *       200:
 *         description: Products retrieved
 *       401:
 *         description: Unauthorized
 *   post:
 *     summary: Create product
 *     tags: [Admin Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateProductRequest'
 *     responses:
 *       201:
 *         description: Product created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Permission denied
 *       422:
 *         description: Validation error
 */

/**
 * @swagger
 * /api/admin/products/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Admin Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Product details
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
 *   put:
 *     summary: Update product
 *     tags: [Admin Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateProductRequest'
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Permission denied
 *       404:
 *         description: Product not found
 *   delete:
 *     summary: Delete product
 *     tags: [Admin Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Permission denied
 *       404:
 *         description: Product not found
 */

/**
 * @swagger
 * /api/admin/products/{id}/upload-images:
 *   post:
 *     summary: Upload product images
 *     tags: [Admin Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 maxItems: 5
 *     responses:
 *       200:
 *         description: Images uploaded successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Permission denied
 */

/**
 * @swagger
 * /api/admin/products/bulk-import:
 *   post:
 *     summary: Bulk import products
 *     tags: [Admin Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               products:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/CreateProductRequest'
 *     responses:
 *       200:
 *         description: Products imported successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Permission denied
 */

/**
 * @swagger
 * /api/admin/categories:
 *   get:
 *     summary: Get all categories (admin)
 *     tags: [Admin Categories]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Categories retrieved
 *       401:
 *         description: Unauthorized
 *   post:
 *     summary: Create category
 *     tags: [Admin Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCategoryRequest'
 *     responses:
 *       201:
 *         description: Category created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Permission denied
 */

/**
 * @swagger
 * /api/admin/categories/{id}:
 *   get:
 *     summary: Get category by ID
 *     tags: [Admin Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Category details
 *       404:
 *         description: Category not found
 *   put:
 *     summary: Update category
 *     tags: [Admin Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCategoryRequest'
 *     responses:
 *       200:
 *         description: Category updated successfully
 *       403:
 *         description: Permission denied
 *       404:
 *         description: Category not found
 *   delete:
 *     summary: Delete category
 *     tags: [Admin Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *       403:
 *         description: Permission denied
 *       404:
 *         description: Category not found
 */

/**
 * @swagger
 * /api/admin/categories/reorder:
 *   patch:
 *     summary: Reorder categories
 *     tags: [Admin Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [categories]
 *             properties:
 *               categories:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id: { type: string }
 *                     order: { type: integer }
 *     responses:
 *       200:
 *         description: Categories reordered successfully
 *       403:
 *         description: Permission denied
 */

/**
 * @swagger
 * /api/admin/orders:
 *   get:
 *     summary: Get all orders (admin)
 *     tags: [Admin Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [placed, confirmed, packing, out_for_delivery, delivered, cancelled] }
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: Orders retrieved
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/admin/orders/{orderId}:
 *   get:
 *     summary: Get order by ID (admin)
 *     tags: [Admin Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Order details
 *       404:
 *         description: Order not found
 */

/**
 * @swagger
 * /api/admin/orders/{orderId}/status:
 *   patch:
 *     summary: Update order status
 *     tags: [Admin Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [placed, confirmed, packing, out_for_delivery, delivered, cancelled]
 *     responses:
 *       200:
 *         description: Status updated successfully
 *       403:
 *         description: Permission denied
 *       404:
 *         description: Order not found
 */

/**
 * @swagger
 * /api/admin/orders/{orderId}/assign-partner:
 *   patch:
 *     summary: Assign delivery partner to order
 *     tags: [Admin Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [partnerId]
 *             properties:
 *               partnerId: { type: string }
 *     responses:
 *       200:
 *         description: Partner assigned successfully
 *       403:
 *         description: Permission denied
 *       404:
 *         description: Order or partner not found
 */

/**
 * @swagger
 * /api/admin/orders/{orderId}/refund:
 *   post:
 *     summary: Refund order
 *     tags: [Admin Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [reason]
 *             properties:
 *               amount: { type: number }
 *               reason: { type: string }
 *     responses:
 *       200:
 *         description: Refund processed successfully
 *       403:
 *         description: Permission denied
 *       404:
 *         description: Order not found
 */

/**
 * @swagger
 * /api/admin/orders/{orderId}/invoice:
 *   get:
 *     summary: Get order invoice
 *     tags: [Admin Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Invoice data
 *       404:
 *         description: Order not found
 */

/**
 * @swagger
 * /api/admin/banners:
 *   get:
 *     summary: Get all banners (admin)
 *     tags: [Admin Banners]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Banners retrieved
 *   post:
 *     summary: Create banner
 *     tags: [Admin Banners]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateBannerRequest'
 *     responses:
 *       201:
 *         description: Banner created successfully
 *       403:
 *         description: Permission denied
 */

/**
 * @swagger
 * /api/admin/banners/{id}:
 *   get:
 *     summary: Get banner by ID
 *     tags: [Admin Banners]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Banner details
 *       404:
 *         description: Banner not found
 *   put:
 *     summary: Update banner
 *     tags: [Admin Banners]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateBannerRequest'
 *     responses:
 *       200:
 *         description: Banner updated successfully
 *       403:
 *         description: Permission denied
 *       404:
 *         description: Banner not found
 *   delete:
 *     summary: Delete banner
 *     tags: [Admin Banners]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Banner deleted successfully
 *       403:
 *         description: Permission denied
 *       404:
 *         description: Banner not found
 */

/**
 * @swagger
 * /api/admin/shelves:
 *   get:
 *     summary: Get all shelves (admin)
 *     tags: [Admin Shelves]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Shelves retrieved
 *   post:
 *     summary: Create shelf
 *     tags: [Admin Shelves]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateShelfRequest'
 *     responses:
 *       201:
 *         description: Shelf created successfully
 *       403:
 *         description: Permission denied
 */

/**
 * @swagger
 * /api/admin/shelves/{id}:
 *   get:
 *     summary: Get shelf by ID
 *     tags: [Admin Shelves]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Shelf details
 *       404:
 *         description: Shelf not found
 *   put:
 *     summary: Update shelf
 *     tags: [Admin Shelves]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateShelfRequest'
 *     responses:
 *       200:
 *         description: Shelf updated successfully
 *       403:
 *         description: Permission denied
 *       404:
 *         description: Shelf not found
 *   delete:
 *     summary: Delete shelf
 *     tags: [Admin Shelves]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Shelf deleted successfully
 *       403:
 *         description: Permission denied
 *       404:
 *         description: Shelf not found
 */

/**
 * @swagger
 * /api/admin/locations:
 *   get:
 *     summary: Get all locations (admin)
 *     tags: [Admin Locations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Locations retrieved
 *   post:
 *     summary: Create location
 *     tags: [Admin Locations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateLocationRequest'
 *     responses:
 *       201:
 *         description: Location created successfully
 *       403:
 *         description: Permission denied
 */

/**
 * @swagger
 * /api/admin/locations/{id}:
 *   get:
 *     summary: Get location by ID
 *     tags: [Admin Locations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Location details
 *       404:
 *         description: Location not found
 *   put:
 *     summary: Update location
 *     tags: [Admin Locations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateLocationRequest'
 *     responses:
 *       200:
 *         description: Location updated successfully
 *       403:
 *         description: Permission denied
 *       404:
 *         description: Location not found
 *   delete:
 *     summary: Delete location
 *     tags: [Admin Locations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Location deleted successfully
 *       403:
 *         description: Permission denied
 *       404:
 *         description: Location not found
 */

/**
 * @swagger
 * /api/admin/partners:
 *   get:
 *     summary: Get all delivery partners
 *     tags: [Admin Partners]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [available, busy, offline] }
 *     responses:
 *       200:
 *         description: Partners retrieved
 *   post:
 *     summary: Create delivery partner
 *     tags: [Admin Partners]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePartnerRequest'
 *     responses:
 *       201:
 *         description: Partner created successfully
 *       403:
 *         description: Permission denied
 */

/**
 * @swagger
 * /api/admin/partners/{id}:
 *   get:
 *     summary: Get partner by ID
 *     tags: [Admin Partners]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Partner details
 *       404:
 *         description: Partner not found
 *   put:
 *     summary: Update partner
 *     tags: [Admin Partners]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePartnerRequest'
 *     responses:
 *       200:
 *         description: Partner updated successfully
 *       403:
 *         description: Permission denied
 *       404:
 *         description: Partner not found
 *   delete:
 *     summary: Delete partner
 *     tags: [Admin Partners]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Partner deleted successfully
 *       403:
 *         description: Permission denied
 *       404:
 *         description: Partner not found
 */

/**
 * @swagger
 * /api/admin/partners/{id}/status:
 *   patch:
 *     summary: Update partner status
 *     tags: [Admin Partners]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status: { type: string, enum: [available, busy, offline] }
 *     responses:
 *       200:
 *         description: Status updated successfully
 *       403:
 *         description: Permission denied
 *       404:
 *         description: Partner not found
 */

/**
 * @swagger
 * /api/admin/partners/{id}/location:
 *   patch:
 *     summary: Update partner location (simulation)
 *     tags: [Admin Partners]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [longitude, latitude]
 *             properties:
 *               longitude: { type: number, example: 72.8777 }
 *               latitude: { type: number, example: 19.0760 }
 *     responses:
 *       200:
 *         description: Location updated successfully
 *       404:
 *         description: Partner not found
 */

/**
 * @swagger
 * /api/admin/analytics/overview:
 *   get:
 *     summary: Get dashboard overview
 *     tags: [Admin Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard overview data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/AnalyticsOverview' }
 */

/**
 * @swagger
 * /api/admin/analytics/sales:
 *   get:
 *     summary: Get sales analytics
 *     tags: [Admin Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: groupBy
 *         schema: { type: string, enum: [day, week, month] }
 *     responses:
 *       200:
 *         description: Sales analytics data
 */

/**
 * @swagger
 * /api/admin/analytics/products:
 *   get:
 *     summary: Get product analytics
 *     tags: [Admin Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Product analytics (top sellers, low stock, etc.)
 */

/**
 * @swagger
 * /api/admin/analytics/categories:
 *   get:
 *     summary: Get category analytics
 *     tags: [Admin Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Category-wise sales breakdown
 */

/**
 * @swagger
 * /api/admin/analytics/users:
 *   get:
 *     summary: Get user analytics
 *     tags: [Admin Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User analytics (new users, active users, etc.)
 */

/**
 * @swagger
 * /api/admin/reports/export:
 *   get:
 *     summary: Export reports
 *     tags: [Admin Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         required: true
 *         schema: { type: string, enum: [orders, products, users, sales] }
 *       - in: query
 *         name: format
 *         schema: { type: string, enum: [csv, xlsx], default: csv }
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: Report file
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       403:
 *         description: Permission denied
 */