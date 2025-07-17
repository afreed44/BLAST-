const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, phone, addresses } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.userId,
      { name, phone, addresses },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        addresses: user.addresses,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update profile' 
    });
  }
});

module.exports = router;