const Product = require('../models/Product');
const Category = require('../models/Category');
const ApiResponse = require('../utils/response');
const { getPagination, buildPaginationResponse, generateSlug } = require('../utils/helpers');
const AuditLogger = require('../utils/auditLog');
const logger = require('../utils/logger');

/**
 * Get all products (admin) with extended filters
 */
exports.getAllProducts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      category,
      brand,
      isActive,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const { skip, limit: limitNum } = getPagination(page, limit);

    // Build query
    const query = {};

    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { brand: new RegExp(search, 'i') },
        { tags: new RegExp(search, 'i') }
      ];
    }

    if (category) {
      const cat = await Category.findOne({ slug: category });
      if (cat) {
        query.categoryId = cat._id;
      }
    }

    if (brand) {
      query.brand = new RegExp(brand, 'i');
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query
    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('categoryId', 'name slug')
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Product.countDocuments(query)
    ]);

    const pagination = buildPaginationResponse(page, limitNum, total);

    return ApiResponse.paginated(res, products, pagination);
  } catch (error) {
    next(error);
  }
};

/**
 * Get single product by ID (admin)
 */
exports.getProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id)
      .populate('categoryId', 'name slug icon');

    if (!product) {
      return ApiResponse.notFound(res, 'Product');
    }

    return ApiResponse.success(res, product);
  } catch (error) {
    next(error);
  }
};

/**
 * Create product
 */
exports.createProduct = async (req, res, next) => {
  try {
    const {
      name,
      slug: customSlug,
      brand,
      categoryId,
      images = [],
      variants = [],
      tags = [],
      highlights,
      description,
      compliance,
      isActive = true,
      stock = 0
    } = req.body;

    // Generate slug if not provided
    const slug = customSlug || generateSlug(name);

    // Check if slug already exists
    const existingProduct = await Product.findOne({ slug });
    if (existingProduct) {
      return ApiResponse.error(
        res,
        'Product with this slug already exists',
        'DUPLICATE_SLUG',
        409
      );
    }

    // Verify category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return ApiResponse.error(res, 'Category not found', 'CATEGORY_NOT_FOUND', 404);
    }

    // Create product
    const product = await Product.create({
      name,
      slug,
      brand,
      categoryId,
      images,
      variants,
      tags,
      highlights,
      description,
      compliance,
      isActive,
      stock
    });

    await product.populate('categoryId', 'name slug');

    // Audit log
    AuditLogger.logProductOperation(
      req.admin,
      'CREATE',
      product._id,
      product.name
    );

    logger.info(`Product created: ${product.name} by ${req.admin.username}`);

    return ApiResponse.success(
      res,
      product,
      'Product created successfully',
      201
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Update product
 */
exports.updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const product = await Product.findById(id);

    if (!product) {
      return ApiResponse.notFound(res, 'Product');
    }

    // If updating slug, check for duplicates
    if (updates.slug && updates.slug !== product.slug) {
      const existingProduct = await Product.findOne({ slug: updates.slug });
      if (existingProduct) {
        return ApiResponse.error(
          res,
          'Product with this slug already exists',
          'DUPLICATE_SLUG',
          409
        );
      }
    }

    // If updating category, verify it exists
    if (updates.categoryId && updates.categoryId !== product.categoryId.toString()) {
      const category = await Category.findById(updates.categoryId);
      if (!category) {
        return ApiResponse.error(res, 'Category not found', 'CATEGORY_NOT_FOUND', 404);
      }
    }

    // Track changes for audit
    const changes = {};
    Object.keys(updates).forEach(key => {
      if (JSON.stringify(product[key]) !== JSON.stringify(updates[key])) {
        changes[key] = { old: product[key], new: updates[key] };
      }
    });

    // Update product
    Object.assign(product, updates);
    await product.save();

    await product.populate('categoryId', 'name slug');

    // Audit log
    AuditLogger.logProductOperation(
      req.admin,
      'UPDATE',
      product._id,
      product.name,
      changes
    );

    logger.info(`Product updated: ${product.name} by ${req.admin.username}`);

    return ApiResponse.success(res, product, 'Product updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Delete product
 */
exports.deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      return ApiResponse.notFound(res, 'Product');
    }

    // Soft delete by setting isActive to false
    product.isActive = false;
    await product.save();

    // Audit log
    AuditLogger.logProductOperation(
      req.admin,
      'DELETE',
      product._id,
      product.name
    );

    logger.info(`Product deleted: ${product.name} by ${req.admin.username}`);

    return ApiResponse.success(res, null, 'Product deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Upload product images
 */
exports.uploadImages = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!req.files || req.files.length === 0) {
      return ApiResponse.error(res, 'No images uploaded', 'NO_FILES', 400);
    }

    const product = await Product.findById(id);

    if (!product) {
      return ApiResponse.notFound(res, 'Product');
    }

    // Add new images
    const newImages = req.files.map(file => ({
      url: `/uploads/${file.filename}`,
      alt: product.name
    }));

    product.images.push(...newImages);
    await product.save();

    logger.info(`Images uploaded for product: ${product.name}`);

    return ApiResponse.success(res, product.images, 'Images uploaded successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Bulk import products (stub)
 */
exports.bulkImport = async (req, res, next) => {
  try {
    // TODO: Implement CSV parsing and bulk product creation
    // This is a stub implementation

    return ApiResponse.success(
      res,
      { imported: 0, failed: 0 },
      'Bulk import feature coming soon'
    );
  } catch (error) {
    next(error);
  }
};

