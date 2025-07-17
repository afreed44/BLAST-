const validateOrderData = (req, res, next) => {
  const { items, shippingAddress, paymentMethod, total } = req.body;
  const errors = [];

  // Validate items
  if (!items || !Array.isArray(items) || items.length === 0) {
    errors.push('Order must contain at least one item');
  } else {
    items.forEach((item, index) => {
      if (!item.product || !item.product.id) {
        errors.push(`Item ${index + 1}: Product ID is required`);
      }
      if (!item.product || !item.product.name) {
        errors.push(`Item ${index + 1}: Product name is required`);
      }
      if (!item.quantity || item.quantity <= 0) {
        errors.push(`Item ${index + 1}: Valid quantity is required`);
      }
      if (!item.price || item.price <= 0) {
        errors.push(`Item ${index + 1}: Valid price is required`);
      }
    });
  }

  // Validate shipping address
  if (!shippingAddress) {
    errors.push('Shipping address is required');
  } else {
    const requiredFields = ['firstName', 'lastName', 'street', 'city', 'zipCode'];
    requiredFields.forEach(field => {
      if (!shippingAddress[field] || shippingAddress[field].trim() === '') {
        errors.push(`Shipping address: ${field} is required`);
      }
    });

    // Validate email format if provided
    if (shippingAddress.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(shippingAddress.email)) {
        errors.push('Shipping address: Invalid email format');
      }
    }

    // Validate phone format if provided
    if (shippingAddress.phone) {
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      if (!phoneRegex.test(shippingAddress.phone.replace(/[\s\-\(\)]/g, ''))) {
        errors.push('Shipping address: Invalid phone number format');
      }
    }
  }

  // Validate payment method
  if (!paymentMethod || !['card', 'upi', 'cod'].includes(paymentMethod)) {
    errors.push('Valid payment method is required (card, upi, or cod)');
  }

  // Validate total
  if (!total || typeof total !== 'number' || total <= 0) {
    errors.push('Valid order total is required');
  }

  // If there are validation errors, return them
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors
    });
  }

  // If validation passes, continue to the next middleware
  next();
};

const validateOrderStatusUpdate = (req, res, next) => {
  const { status, description, location } = req.body;
  const errors = [];

  // Validate status
  const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
  if (!status || !validStatuses.includes(status)) {
    errors.push(`Status must be one of: ${validStatuses.join(', ')}`);
  }

  // Description is optional but should be a string if provided
  if (description && typeof description !== 'string') {
    errors.push('Description must be a string');
  }

  // Location is optional but should be a string if provided
  if (location && typeof location !== 'string') {
    errors.push('Location must be a string');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors
    });
  }

  next();
};

module.exports = {
  validateOrderData,
  validateOrderStatusUpdate
};
