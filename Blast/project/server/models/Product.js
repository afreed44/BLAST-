const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  originalPrice: {
    type: Number,
    min: 0
  },
  discount: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  category: {
    type: String,
    required: true,
    enum: ['car', 'bike', 'scooter', 'electric-bike', 'electric-car'],
    lowercase: true
  },
  brand: {
    type: String,
    required: true,
    trim: true
  },
  model: {
    type: String,
    required: true,
    trim: true
  },
  year: {
    type: Number,
    min: 1900,
    max: new Date().getFullYear() + 1
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  specifications: {
    engine: {
      type: String,
      trim: true
    },
    fuelType: {
      type: String,
      enum: ['petrol', 'diesel', 'electric', 'hybrid', 'cng'],
      lowercase: true
    },
    transmission: {
      type: String,
      enum: ['manual', 'automatic', 'cvt'],
      lowercase: true
    },
    mileage: {
      type: String,
      trim: true
    },
    topSpeed: {
      type: String,
      trim: true
    },
    seatingCapacity: {
      type: Number,
      min: 1
    },
    weight: {
      type: String,
      trim: true
    },
    dimensions: {
      length: String,
      width: String,
      height: String,
      wheelbase: String
    },
    colors: [String]
  },
  features: [String],
  inStock: {
    type: Boolean,
    default: true
  },
  stockQuantity: {
    type: Number,
    default: 0,
    min: 0
  },
  rating: {
    average: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    count: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      required: true,
      trim: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  tags: [String],
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  seoTitle: String,
  seoDescription: String,
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  }
}, {
  timestamps: true
});

// Create slug from name before saving
productSchema.pre('save', function(next) {
  if (this.isModified('name') || this.isNew) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

// Calculate discount price
productSchema.virtual('discountedPrice').get(function() {
  if (this.discount > 0 && this.originalPrice) {
    return this.originalPrice - (this.originalPrice * this.discount / 100);
  }
  return this.price;
});

// Ensure virtual fields are serialized
productSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
