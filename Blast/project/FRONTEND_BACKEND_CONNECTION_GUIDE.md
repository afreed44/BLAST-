# Frontend-Backend Connection Guide

## ✅ Current Status

Your MERN stack application is now fully connected and working:

- ✅ **Backend Server**: Running on http://localhost:5001
- ✅ **MongoDB Atlas**: Connected and storing data
- ✅ **Frontend-Backend**: Communication established
- ✅ **User Registration**: Working and storing in MongoDB Atlas
- ✅ **Authentication**: JWT tokens working properly
- ✅ **API Endpoints**: All endpoints accessible

## 🔗 Available API Endpoints

### Authentication APIs
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user (requires auth)

### Products APIs
- `GET /api/products` - Get all products (cars, bikes, etc.)
- `GET /api/products/:id` - Get single product
- `GET /api/products/category/:category` - Get products by category
- `GET /api/products/featured/list` - Get featured products
- `POST /api/products/:id/reviews` - Add product review (requires auth)

### Cart APIs
- `GET /api/cart` - Get user's cart (requires auth)
- `POST /api/cart/add` - Add item to cart (requires auth)
- `PUT /api/cart/update/:productId` - Update cart item quantity (requires auth)
- `DELETE /api/cart/remove/:productId` - Remove item from cart (requires auth)
- `DELETE /api/cart/clear` - Clear entire cart (requires auth)
- `GET /api/cart/count` - Get cart item count (requires auth)

### Orders APIs
- `POST /api/orders` - Create new order (requires auth)
- `GET /api/orders/my-orders` - Get user's orders (requires auth)
- `GET /api/orders/:orderId` - Get specific order (requires auth)
- `GET /api/orders/track/:trackingNumber` - Track order

## 📊 Data Models in MongoDB Atlas

Your application now has these collections in MongoDB Atlas:

### 1. Users Collection
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: 'user' | 'admin',
  phone: String,
  addresses: Array,
  wishlist: Array,
  isEmailVerified: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### 2. Products Collection (Cars/Bikes)
```javascript
{
  name: String,
  description: String,
  price: Number,
  originalPrice: Number,
  discount: Number,
  category: 'car' | 'bike' | 'scooter' | 'electric-bike' | 'electric-car',
  brand: String,
  model: String,
  year: Number,
  images: Array,
  specifications: Object,
  features: Array,
  inStock: Boolean,
  stockQuantity: Number,
  rating: Object,
  reviews: Array,
  tags: Array,
  isActive: Boolean,
  isFeatured: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### 3. Cart Collection
```javascript
{
  user: ObjectId (ref: User),
  items: [{
    product: ObjectId (ref: Product),
    quantity: Number,
    price: Number,
    selectedColor: String,
    selectedVariant: String,
    addedAt: Date
  }],
  totalItems: Number,
  totalPrice: Number,
  lastModified: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### 4. Orders Collection
```javascript
{
  user: ObjectId (ref: User),
  orderNumber: String (unique),
  items: Array,
  shippingAddress: Object,
  paymentMethod: String,
  paymentStatus: String,
  orderStatus: String,
  subtotal: Number,
  shipping: Number,
  tax: Number,
  total: Number,
  trackingNumber: String,
  estimatedDelivery: Date,
  trackingHistory: Array,
  createdAt: Date,
  updatedAt: Date
}
```

## 🔧 Frontend Integration

### 1. Update Your Frontend API Calls

Make sure your frontend components use these API endpoints:

```javascript
// Example: User Registration
const registerUser = async (userData) => {
  const response = await axios.post('http://localhost:5001/api/auth/register', userData);
  return response.data;
};

// Example: Add to Cart
const addToCart = async (productId, quantity) => {
  const token = localStorage.getItem('token');
  const response = await axios.post('http://localhost:5001/api/cart/add', 
    { productId, quantity },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

// Example: Get Products
const getProducts = async (filters = {}) => {
  const response = await axios.get('http://localhost:5001/api/products', { params: filters });
  return response.data;
};
```

### 2. Authentication Token Management

Ensure your frontend stores and uses JWT tokens:

```javascript
// Store token after login
localStorage.setItem('token', response.data.token);

// Include token in API requests
const token = localStorage.getItem('token');
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
```

## 🚀 Next Steps

### 1. Add Your Products
Use the Products API to add your cars and bikes:
```javascript
POST /api/products
{
  "name": "Your Car/Bike Name",
  "description": "Description",
  "price": 100000,
  "category": "car", // or "bike"
  "brand": "Brand Name",
  "model": "Model Name",
  // ... other fields
}
```

### 2. Update Frontend Forms
Ensure all your frontend forms (registration, login, add to cart, checkout) use the correct API endpoints.

### 3. Test Complete Workflow
1. Register a new user
2. Login with the user
3. Browse products
4. Add items to cart
5. Place an order
6. Track the order

## 🔍 Monitoring

### Check MongoDB Atlas Data
1. Go to MongoDB Atlas Dashboard
2. Navigate to your cluster
3. Click "Browse Collections"
4. You should see: `users`, `products`, `carts`, `orders` collections

### Server Logs
Monitor your server console for:
- User registrations
- Order placements
- Cart updates
- Product queries

## 🛠 Troubleshooting

### If MongoDB Connection Fails
1. Check IP whitelist in MongoDB Atlas
2. Verify connection string in `.env` file
3. Ensure cluster is running

### If API Calls Fail
1. Check CORS configuration
2. Verify server is running on port 5001
3. Check authentication tokens
4. Review request/response in browser dev tools

## ✅ Success Indicators

Your setup is working correctly when:
- Users can register and login
- Products can be fetched and displayed
- Cart operations work (add, remove, update)
- Orders can be placed successfully
- Data appears in MongoDB Atlas collections

Your MERN stack application is now fully connected to MongoDB Atlas and ready for production use!
