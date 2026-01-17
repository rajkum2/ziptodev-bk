const Product = require('../models/Product');
const Category = require('../models/Category');
const ApiResponse = require('../utils/response');
const { getPagination, buildPaginationResponse, generateSlug } = require('../utils/helpers');

/**
 * Get all products with filters and pagination
 */
exports.getProducts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      category,
      brand,
      tags,
      minPrice,
      maxPrice,
      inStock,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const { skip, limit: limitNum } = getPagination(page, limit);

    // Build query
    const query = { isActive: true };

    if (search) {
      query.$text = { $search: search };
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

    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      query.tags = { $in: tagArray };
    }

    if (minPrice || maxPrice) {
      query['variants.price'] = {};
      if (minPrice) query['variants.price'].$gte = parseFloat(minPrice);
      if (maxPrice) query['variants.price'].$lte = parseFloat(maxPrice);
    }

    if (inStock === 'true') {
      query['variants.inStock'] = true;
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
 * Get product by slug
 */
exports.getProductBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const product = await Product.findOne({ slug, isActive: true })
      .populate('categoryId', 'name slug icon color');

    if (!product) {
      return ApiResponse.notFound(res, 'Product');
    }

    // Increment views
    product.views += 1;
    await product.save();

    return ApiResponse.success(res, product);
  } catch (error) {
    next(error);
  }
};

/**
 * Get products by category
 */
exports.getProductsByCategory = async (req, res, next) => {
  try {
    const { categorySlug } = req.params;
    const { page = 1, limit = 20, sortBy = 'priority', sortOrder = 'desc' } = req.query;

    const category = await Category.findOne({ slug: categorySlug, isActive: true });

    if (!category) {
      return ApiResponse.notFound(res, 'Category');
    }

    const { skip, limit: limitNum } = getPagination(page, limit);

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [products, total] = await Promise.all([
      Product.find({ categoryId: category._id, isActive: true })
        .populate('categoryId', 'name slug')
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Product.countDocuments({ categoryId: category._id, isActive: true })
    ]);

    const pagination = buildPaginationResponse(page, limitNum, total);

    return ApiResponse.paginated(res, products, pagination);
  } catch (error) {
    next(error);
  }
};

/**
 * Search products
 */
exports.searchProducts = async (req, res, next) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q || q.trim().length < 2) {
      return ApiResponse.success(res, []);
    }

    const products = await Product.find({
      $text: { $search: q },
      isActive: true
    })
      .select('name slug brand images variants')
      .populate('categoryId', 'name slug')
      .limit(parseInt(limit))
      .lean();

    return ApiResponse.success(res, products);
  } catch (error) {
    next(error);
  }
};

/**
 * Get product recommendations
 */
exports.getRecommendations = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { limit = 8 } = req.query;

    const product = await Product.findById(productId);

    if (!product) {
      return ApiResponse.notFound(res, 'Product');
    }

    // Get similar products from same category
    const recommendations = await Product.find({
      _id: { $ne: productId },
      categoryId: product.categoryId,
      isActive: true
    })
      .select('name slug brand images variants')
      .populate('categoryId', 'name slug')
      .limit(parseInt(limit))
      .lean();

    return ApiResponse.success(res, recommendations);
  } catch (error) {
    next(error);
  }
};

/**
 * Get products by IDs (for cart, orders)
 * Usage: /products/by-ids?ids=id1,id2,id3
 */
exports.getProductsByIds = async (req, res, next) => {
  try {
    const { ids } = req.query;

    if (!ids) {
      return ApiResponse.badRequest(res, 'Product IDs are required');
    }

    const idArray = ids.split(',').filter(id => id.trim());

    if (idArray.length === 0) {
      return ApiResponse.success(res, []);
    }

    const products = await Product.find({
      _id: { $in: idArray },
      isActive: true
    })
      .select('name slug brand images variants')
      .populate('categoryId', 'name slug')
      .lean();

    return ApiResponse.success(res, products);
  } catch (error) {
    next(error);
  }
};
