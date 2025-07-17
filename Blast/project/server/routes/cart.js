const express = require('express');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const auth = require('../middleware/auth');

const router = express.Router();

// Get user's cart
router.get('/', auth, async (req, res) => {
  try {
    const cart = await Cart.findOrCreateCart(req.userId);
    await cart.populate('items.product');

    res.json({
      success: true,
      cart: cart.getCartSummary()
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cart'
    });
  }
});

// Add item to cart
router.post('/add', auth, async (req, res) => {
  try {
    const { productId, quantity = 1, color, variant } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    // Verify product exists and is in stock
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (!product.inStock) {
      return res.status(400).json({
        success: false,
        message: 'Product is out of stock'
      });
    }

    if (product.stockQuantity > 0 && quantity > product.stockQuantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stockQuantity} items available in stock`
      });
    }

    const cart = await Cart.findOrCreateCart(req.userId);
    
    await cart.addItem(productId, Number(quantity), product.price, {
      color,
      variant
    });

    await cart.populate('items.product');

    res.json({
      success: true,
      message: 'Item added to cart successfully',
      cart: cart.getCartSummary()
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add item to cart'
    });
  }
});

// Update item quantity in cart
router.put('/update/:productId', auth, async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid quantity is required'
      });
    }

    const cart = await Cart.findOne({ user: req.userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    if (quantity === 0) {
      await cart.removeItem(productId);
    } else {
      // Check stock availability
      const product = await Product.findById(productId);
      if (product && product.stockQuantity > 0 && quantity > product.stockQuantity) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stockQuantity} items available in stock`
        });
      }

      await cart.updateItemQuantity(productId, Number(quantity));
    }

    await cart.populate('items.product');

    res.json({
      success: true,
      message: 'Cart updated successfully',
      cart: cart.getCartSummary()
    });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update cart'
    });
  }
});

// Remove item from cart
router.delete('/remove/:productId', auth, async (req, res) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: req.userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    await cart.removeItem(productId);
    await cart.populate('items.product');

    res.json({
      success: true,
      message: 'Item removed from cart successfully',
      cart: cart.getCartSummary()
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove item from cart'
    });
  }
});

// Clear entire cart
router.delete('/clear', auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    await cart.clearCart();

    res.json({
      success: true,
      message: 'Cart cleared successfully',
      cart: cart.getCartSummary()
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear cart'
    });
  }
});

// Get cart item count
router.get('/count', auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.userId });
    const count = cart ? cart.totalItems : 0;

    res.json({
      success: true,
      count
    });
  } catch (error) {
    console.error('Get cart count error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get cart count'
    });
  }
});

module.exports = router;
