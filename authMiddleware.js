// ============================================================
// middleware/authMiddleware.js - JWT Authentication Middleware
// ============================================================

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// =====================
// Protect Route - Requires valid JWT token
// =====================
const protect = async (req, res, next) => {
  let token;

  // Check if token is in the Authorization header
  // Format: "Bearer <token>"
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extract token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify the token using our secret key
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach the user to request (exclude password)
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ success: false, message: 'User not found' });
      }

      next(); // Proceed to the next middleware/route handler
    } catch (error) {
      console.error('Token verification failed:', error.message);
      res.status(401).json({ success: false, message: 'Not authorized, invalid token' });
    }
  } else {
    res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }
};

// =====================
// Admin Only - Must be admin role
// =====================
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next(); // User is admin, proceed
  } else {
    res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
  }
};

// Helper function to generate a JWT token for a user
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d' // Token expires in 7 days
  });
};

module.exports = { protect, adminOnly, generateToken };
