const express = require('express');
const Product = require('../models/Product');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all products with filtering and pagination
router.get('/', async (req, res) => {
  try {
    const {
      category,
      brand,
      minPrice,
      maxPrice,
      inStock,
      featured,
      search,
      sort = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 12
    } = req.query;

    // Build filter object
    const filter = { isActive: true };

    if (category) filter.category = category;
    if (brand) filter.brand = new RegExp(brand, 'i');
    if (inStock === 'true') filter.inStock = true;
    if (featured === 'true') filter.isFeatured = true;

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { brand: new RegExp(search, 'i') },
        { model: new RegExp(search, 'i') },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Sort options
    const sortOrder = order === 'desc' ? -1 : 1;
    const sortObj = { [sort]: sortOrder };

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);

    const products = await Product.find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(Number(limit))
      .select('-reviews'); // Exclude reviews for list view

    const total = await Product.countDocuments(filter);

    res.json({
      success: true,
      products,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalProducts: total,
        hasNext: skip + Number(limit) < total,
        hasPrev: Number(page) > 1
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products'
    });
  }
});

// Get single product by ID or slug
router.get('/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    
    // Try to find by ID first, then by slug
    let product = await Product.findById(identifier).populate('reviews.user', 'name');
    
    if (!product) {
      product = await Product.findOne({ slug: identifier }).populate('reviews.user', 'name');
    }

    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      product
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product'
    });
  }
});

// Get featured products
router.get('/featured/list', async (req, res) => {
  try {
    const products = await Product.find({
      isActive: true,
      isFeatured: true
    })
    .sort({ createdAt: -1 })
    .limit(8)
    .select('-reviews');

    res.json({
      success: true,
      products
    });
  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured products'
    });
  }
});

// Get products by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { limit = 12, page = 1 } = req.query;

    const filter = {
      isActive: true,
      category: category.toLowerCase()
    };

    const skip = (Number(page) - 1) * Number(limit);

    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .select('-reviews');

    const total = await Product.countDocuments(filter);

    res.json({
      success: true,
      products,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalProducts: total
      }
    });
  } catch (error) {
    console.error('Get category products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch category products'
    });
  }
});

// Add product review (authenticated users only)
router.post('/:id/reviews', auth, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const productId = req.params.id;

    if (!rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Rating and comment are required'
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if user already reviewed this product
    const existingReview = product.reviews.find(
      review => review.user.toString() === req.userId
    );

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this product'
      });
    }

    // Add review
    product.reviews.push({
      user: req.userId,
      rating: Number(rating),
      comment: comment.trim()
    });

    // Update average rating
    const totalRating = product.reviews.reduce((sum, review) => sum + review.rating, 0);
    product.rating.average = totalRating / product.reviews.length;
    product.rating.count = product.reviews.length;

    await product.save();

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      rating: product.rating
    });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add review'
    });
  }
});

module.exports = router;
