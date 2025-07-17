const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderNumber: {
    type: String,
    unique: true
  },
  items: [{
    product: {
      id: String,
      name: String,
      price: Number,
      image: String,
      brand: String
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true
    }
  }],
  shippingAddress: {
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'upi', 'cod'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  orderStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  subtotal: {
    type: Number,
    required: true
  },
  shipping: {
    type: Number,
    default: 0
  },
  tax: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    required: true
  },
  trackingNumber: {
    type: String,
    unique: true
  },
  estimatedDelivery: {
    type: Date
  },
  deliveredAt: {
    type: Date
  },
  // Enhanced tracking information
  trackingHistory: [{
    status: {
      type: String,
      enum: ['order_placed', 'order_confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'],
      required: true
    },
    description: String,
    location: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  // Shipping details
  shippingCarrier: {
    type: String,
    default: 'BLAST Express'
  },
  shippingMethod: {
    type: String,
    default: 'Standard Delivery'
  },
  // Additional order information
  notes: {
    type: String
  },
  cancellationReason: {
    type: String
  },
  refundAmount: {
    type: Number
  },
  refundStatus: {
    type: String,
    enum: ['none', 'pending', 'processed', 'completed'],
    default: 'none'
  }
}, {
  timestamps: true
});

// Generate order number before saving
orderSchema.pre('save', async function(next) {
  try {
    if (!this.orderNumber) {
      // Use this.constructor instead of mongoose.model to avoid circular reference
      const count = await this.constructor.countDocuments();
      this.orderNumber = `BWP${String(count + 1).padStart(6, '0')}`;
    }

    // Generate tracking number if not exists
    if (!this.trackingNumber) {
      this.trackingNumber = `BWP${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    }

    // Initialize tracking history if empty
    if (!this.trackingHistory || this.trackingHistory.length === 0) {
      this.trackingHistory = [{
        status: 'order_placed',
        description: 'Order has been placed successfully',
        location: 'Online Store',
        timestamp: new Date()
      }];
    }

    next();
  } catch (error) {
    console.error('Order pre-save hook error:', error);
    next(error);
  }
});

// Method to update order status
orderSchema.methods.updateStatus = function(newStatus, description, location) {
  this.orderStatus = newStatus;
  this.trackingHistory.push({
    status: newStatus,
    description: description || `Order status updated to ${newStatus}`,
    location: location || 'Processing Center',
    timestamp: new Date()
  });
  
  // Set deliveredAt if order is delivered
  if (newStatus === 'delivered') {
    this.deliveredAt = new Date();
  }
  
  return this.save();
};

// Method to get current tracking status
orderSchema.methods.getCurrentTrackingStatus = function() {
  if (!this.trackingHistory || this.trackingHistory.length === 0) {
    return null;
  }
  return this.trackingHistory[this.trackingHistory.length - 1];
};

// Method to get tracking timeline
orderSchema.methods.getTrackingTimeline = function() {
  const timeline = [
    { status: 'Order Placed', date: this.createdAt, completed: true },
    { status: 'Order Confirmed', date: null, completed: false },
    { status: 'Processing', date: null, completed: false },
    { status: 'Shipped', date: null, completed: false },
    { status: 'Out for Delivery', date: null, completed: false },
    { status: 'Delivered', date: this.deliveredAt, completed: false }
  ];
  
  // Update timeline based on tracking history
  this.trackingHistory.forEach(entry => {
    switch (entry.status) {
      case 'order_confirmed':
        timeline[1].date = entry.timestamp;
        timeline[1].completed = true;
        break;
      case 'processing':
        timeline[2].date = entry.timestamp;
        timeline[2].completed = true;
        break;
      case 'shipped':
        timeline[3].date = entry.timestamp;
        timeline[3].completed = true;
        break;
      case 'out_for_delivery':
        timeline[4].date = entry.timestamp;
        timeline[4].completed = true;
        break;
      case 'delivered':
        timeline[5].date = entry.timestamp;
        timeline[5].completed = true;
        break;
    }
  });
  
  return timeline;
};

module.exports = mongoose.model('Order', orderSchema);