const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. No token provided.' 
      });
    }

    const token = authHeader.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. Invalid token format.' 
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
      req.userId = decoded.userId;
      next();
    } catch (jwtError) {
      console.error('JWT verification error:', jwtError);
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid or expired token' 
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Authentication error' 
    });
  }
};

module.exports = auth;