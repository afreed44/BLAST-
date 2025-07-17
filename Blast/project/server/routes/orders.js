const express = require('express');
const Order = require('../models/Order');
const auth = require('../middleware/auth');
const { validateOrderData, validateOrderStatusUpdate } = require('../middleware/validation');
const { sendOrderConfirmationEmail } = require('../services/emailService');

const router = express.Router();

// Create new order
router.post('/', auth, validateOrderData, async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, subtotal, shipping, tax, total } = req.body;

    console.log('Creating order for user:', req.userId);
    console.log('Order data:', { items: items.length, paymentMethod, total });

    // Calculate estimated delivery (5-7 business days)
    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 7);

    const order = new Order({
      user: req.userId,
      items,
      shippingAddress,
      paymentMethod,
      subtotal: subtotal || 0,
      shipping: shipping || 0,
      tax: tax || 0,
      total,
      estimatedDelivery,
      orderStatus: 'confirmed',
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid'
    });

    // Add order confirmed status to tracking history
    order.trackingHistory.push({
      status: 'order_confirmed',
      description: 'Order has been confirmed and is being processed',
      location: 'Order Processing Center',
      timestamp: new Date()
    });

    console.log('Saving order to database...');
    await order.save();
    console.log('Order saved successfully:', order.orderNumber);

    // Send order confirmation email
    try {
      const emailResult = await sendOrderConfirmationEmail(order, shippingAddress.email);
      console.log('Email service result:', emailResult.message);
    } catch (emailError) {
      console.error('Email sending failed:', emailError.message);
      // Don't fail the order if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        trackingNumber: order.trackingNumber,
        estimatedDelivery: order.estimatedDelivery,
        total: order.total,
        status: order.orderStatus
      }
    });
  } catch (error) {
    console.error('Order creation error:', error);
    console.error('Error stack:', error.stack);

    // More specific error handling
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate order detected. Please try again.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to place order. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get user orders
router.get('/my-orders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.userId })
      .sort({ createdAt: -1 })
      .select('-user');

    res.json({
      success: true,
      orders
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch orders' 
    });
  }
});

// Get specific order
router.get('/:orderId', auth, async (req, res) => {
  try {
    const order = await Order.findOne({ 
      _id: req.params.orderId, 
      user: req.userId 
    });

    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch order details' 
    });
  }
});

// Track order
router.get('/track/:trackingNumber', async (req, res) => {
  try {
    const order = await Order.findOne({ 
      trackingNumber: req.params.trackingNumber 
    });

    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Invalid tracking number' 
      });
    }

    // Get tracking timeline
    const timeline = order.getTrackingTimeline();

    res.json({
      success: true,
      tracking: {
        orderNumber: order.orderNumber,
        trackingNumber: order.trackingNumber,
        currentStatus: order.orderStatus,
        estimatedDelivery: order.estimatedDelivery,
        timeline,
        trackingHistory: order.trackingHistory,
        shippingCarrier: order.shippingCarrier,
        shippingMethod: order.shippingMethod
      }
    });
  } catch (error) {
    console.error('Track order error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to track order' 
    });
  }
});

// Update order status (Admin only)
router.patch('/:orderId/status', auth, validateOrderStatusUpdate, async (req, res) => {
  try {
    const { status, description, location } = req.body;
    
    const order = await Order.findById(req.params.orderId);
    
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    // Update order status
    await order.updateStatus(status, description, location);

    res.json({
      success: true,
      message: 'Order status updated successfully',
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        status: order.orderStatus,
        trackingHistory: order.trackingHistory
      }
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update order status' 
    });
  }
});

// Cancel order
router.patch('/:orderId/cancel', auth, async (req, res) => {
  try {
    const { reason } = req.body;
    
    const order = await Order.findOne({ 
      _id: req.params.orderId, 
      user: req.userId 
    });
    
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    // Check if order can be cancelled
    if (['shipped', 'delivered', 'cancelled'].includes(order.orderStatus)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Order cannot be cancelled at this stage' 
      });
    }

    // Cancel order
    order.orderStatus = 'cancelled';
    order.cancellationReason = reason;
    order.trackingHistory.push({
      status: 'cancelled',
      description: `Order cancelled: ${reason}`,
      location: 'Customer Request',
      timestamp: new Date()
    });

    await order.save();

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        status: order.orderStatus
      }
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to cancel order' 
    });
  }
});

// Request refund
router.post('/:orderId/refund', auth, async (req, res) => {
  try {
    const { reason, amount } = req.body;
    
    const order = await Order.findOne({ 
      _id: req.params.orderId, 
      user: req.userId 
    });
    
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    // Check if order is eligible for refund
    if (order.orderStatus !== 'delivered') {
      return res.status(400).json({ 
        success: false, 
        message: 'Order must be delivered to request a refund' 
      });
    }

    // Request refund
    order.refundStatus = 'pending';
    order.refundAmount = amount || order.total;
    order.notes = `Refund requested: ${reason}`;

    await order.save();

    res.json({
      success: true,
      message: 'Refund request submitted successfully',
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        refundStatus: order.refundStatus,
        refundAmount: order.refundAmount
      }
    });
  } catch (error) {
    console.error('Request refund error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to request refund' 
    });
  }
});

module.exports = router;