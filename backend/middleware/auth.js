const jwt = require('jsonwebtoken');
const { AuthenticationError } = require('apollo-server-express');
const User = require('../models/User');

// Authentication middleware
const auth = async (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
      req.user = await User.findById(decoded.id);
    } catch (err) {
      console.error('Error verifying token:', err);
    }
  }
  next();
};

// GraphQL context middleware
const authContext = ({ req }) => {
  // Return user in context if authenticated
  return { user: req.user };
};

// Auth resolver middleware (use in resolvers to protect routes)
const requireAuth = (resolver) => {
  return (parent, args, context, info) => {
    if (!context.user) {
      throw new AuthenticationError('You must be logged in to perform this action');
    }
    
    return resolver(parent, args, context, info);
  };
};

// Role-based access control
const requireRole = (roles) => (resolver) => {
  return (parent, args, context, info) => {
    if (!context.user) {
      throw new AuthenticationError('You must be logged in to perform this action');
    }
    
    if (!roles.includes(context.user.role)) {
      throw new AuthenticationError('You do not have permission to perform this action');
    }
    
    return resolver(parent, args, context, info);
  };
};

module.exports = { auth, authContext, requireAuth, requireRole }; 