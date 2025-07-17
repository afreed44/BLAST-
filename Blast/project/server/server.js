require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176', 'http://localhost:5177'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/blast-podilato';
    console.log('🔄 Attempting to connect to MongoDB...');
    console.log('📡 MongoDB URI:', mongoURI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')); // Hide credentials in logs

    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 10000, // 10 second timeout
      socketTimeoutMS: 45000, // 45 second socket timeout
    });

    console.log(`✅ MongoDB Connected Successfully!`);
    console.log(`🌐 Host: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    console.log(`🔗 Connection State: ${conn.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);

    return true;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);

    if (error.message.includes('IP that isn\'t whitelisted')) {
      console.error('💡 Solution: Add your IP address to MongoDB Atlas whitelist');
      console.error('   1. Go to MongoDB Atlas Dashboard');
      console.error('   2. Navigate to Network Access');
      console.error('   3. Add your current IP address or use 0.0.0.0/0 for all IPs (development only)');
    } else if (error.message.includes('authentication failed')) {
      console.error('💡 Solution: Check your MongoDB Atlas credentials');
      console.error('   1. Verify username and password in connection string');
      console.error('   2. Ensure database user has proper permissions');
    }

    console.log('⚠️  Continuing without MongoDB Atlas - using local fallback');

    // Try local MongoDB as fallback
    try {
      const localConn = await mongoose.connect('mongodb://localhost:27017/blast-podilato');
      console.log(`🔄 Fallback: Connected to local MongoDB`);
      console.log(`📊 Local Database: ${localConn.connection.name}`);
      return true;
    } catch (localError) {
      console.log('⚠️  Local MongoDB also unavailable - using in-memory mock data');
      return false;
    }
  }
};

connectDB();

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/users', require('./routes/users'));
app.use('/api/products', require('./routes/products'));
app.use('/api/cart', require('./routes/cart'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'Server is running!',
    mongodb: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 5001;

// Global error handlers
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please try a different port or stop the existing server.`);
  } else {
    console.error('Server error:', error);
  }
  process.exit(1);
});

module.exports = app;