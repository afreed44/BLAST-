const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  selectedColor: {
    type: String,
    trim: true
  },
  selectedVariant: {
    type: String,
    trim: true
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [cartItemSchema],
  totalItems: {
    type: Number,
    default: 0
  },
  totalPrice: {
    type: Number,
    default: 0
  },
  lastModified: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Calculate totals before saving
cartSchema.pre('save', function(next) {
  this.totalItems = this.items.reduce((total, item) => total + item.quantity, 0);
  this.totalPrice = this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  this.lastModified = new Date();
  next();
});

// Instance methods
cartSchema.methods.addItem = function(productId, quantity = 1, price, options = {}) {
  const existingItemIndex = this.items.findIndex(
    item => item.product.toString() === productId.toString()
  );

  if (existingItemIndex > -1) {
    // Update existing item
    this.items[existingItemIndex].quantity += quantity;
    this.items[existingItemIndex].price = price; // Update price in case it changed
  } else {
    // Add new item
    this.items.push({
      product: productId,
      quantity,
      price,
      selectedColor: options.color,
      selectedVariant: options.variant
    });
  }

  return this.save();
};

cartSchema.methods.removeItem = function(productId) {
  this.items = this.items.filter(
    item => item.product.toString() !== productId.toString()
  );
  return this.save();
};

cartSchema.methods.updateItemQuantity = function(productId, quantity) {
  const item = this.items.find(
    item => item.product.toString() === productId.toString()
  );

  if (item) {
    if (quantity <= 0) {
      return this.removeItem(productId);
    } else {
      item.quantity = quantity;
      return this.save();
    }
  }

  throw new Error('Item not found in cart');
};

cartSchema.methods.clearCart = function() {
  this.items = [];
  return this.save();
};

cartSchema.methods.getCartSummary = function() {
  return {
    totalItems: this.totalItems,
    totalPrice: this.totalPrice,
    itemCount: this.items.length,
    items: this.items
  };
};

// Static methods
cartSchema.statics.findOrCreateCart = async function(userId) {
  let cart = await this.findOne({ user: userId }).populate('items.product');
  
  if (!cart) {
    cart = new this({ user: userId, items: [] });
    await cart.save();
  }
  
  return cart;
};

module.exports = mongoose.model('Cart', cartSchema);
