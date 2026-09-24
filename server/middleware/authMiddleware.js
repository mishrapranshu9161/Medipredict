const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { errorResponse } = require('../utils/apiResponse');

// Protect routes - JWT verification
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'medipredict_super_secret_jwt_key_2026_btech_final_year');

      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return errorResponse(res, 401, 'User associated with token no longer exists');
      }

      if (!user.isActive) {
        return errorResponse(res, 403, 'User account is deactivated');
      }

      req.user = user;
      next();
    } catch (error) {
      console.error('JWT Auth Error:', error.message);
      if (error.name === 'TokenExpiredError') {
        return errorResponse(res, 401, 'Session expired. Please log in again.');
      }
      return errorResponse(res, 401, 'Invalid authentication token');
    }
  }

  if (!token) {
    return errorResponse(res, 401, 'Not authorized, no token provided');
  }
};

// Role-based authorization
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return errorResponse(
        res,
        403,
        `Access denied. Role '${req.user ? req.user.role : 'guest'}' is not authorized to access this resource.`
      );
    }
    next();
  };
};

module.exports = {
  protect,
  authorize
};
