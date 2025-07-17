const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// In-memory storage fallback when MongoDB is not available
let mockUsers = [];
let userIdCounter = 1;

// Helper function to check if MongoDB is connected
const isMongoConnected = () => {
  const mongoose = require('mongoose');
  return mongoose.connection.readyState === 1;
};

// Register user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide name, email, and password' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 6 characters long' 
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide a valid email address' 
      });
    }

    if (isMongoConnected()) {
      // MongoDB operation
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({ 
          success: false, 
          message: 'User already exists with this email address' 
        });
      }

      const user = new User({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password
      });

      await user.save();

      res.status(201).json({
        success: true,
        message: 'Registration successful! Please sign in with your credentials.',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } else {
      // Fallback to in-memory storage
      const existingUser = mockUsers.find(u => u.email === email.toLowerCase());
      if (existingUser) {
        return res.status(400).json({ 
          success: false, 
          message: 'User already exists with this email address' 
        });
      }

      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = {
        id: userIdCounter++,
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role: 'user',
        createdAt: new Date()
      };

      mockUsers.push(newUser);

      res.status(201).json({
        success: true,
        message: 'Registration successful! Please sign in with your credentials.',
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role
        }
      });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Registration failed. Please try again.' 
    });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide email and password' 
      });
    }

    if (isMongoConnected()) {
      // MongoDB operation
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid email or password' 
        });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid email or password' 
        });
      }

      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '7d' }
      );

      res.json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } else {
      // Fallback to in-memory storage
      const user = mockUsers.find(u => u.email === email.toLowerCase());
      if (!user) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid email or password' 
        });
      }

      const bcrypt = require('bcryptjs');
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid email or password' 
        });
      }

      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '7d' }
      );

      res.json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Login failed. Please try again.' 
    });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    if (isMongoConnected()) {
      const user = await User.findById(req.userId).select('-password');
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: 'User not found' 
        });
      }

      res.json({
        success: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          addresses: user.addresses
        }
      });
    } else {
      const user = mockUsers.find(u => u.id == req.userId);
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: 'User not found' 
        });
      }

      res.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          addresses: user.addresses || []
        }
      });
    }
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get user information' 
    });
  }
});

module.exports = router;