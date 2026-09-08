import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      if (!token || token.trim() === '' || token === 'null' || token === 'undefined') {
        return res.status(401).json({ success: false, message: 'Not authorized, invalid token format' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (!decoded || !decoded.id) {
        return res.status(401).json({ success: false, message: 'Not authorized, token payload invalid' });
      }

      req.user = await User.findById(decoded.id).select('-passwordHash');
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'User not found or account removed' });
      }

      // Check account suspension / ban status
      if (req.user.isSuspended || req.user.accountStatus === 'SUSPENDED' || req.user.accountStatus === 'BLOCKED') {
        return res.status(403).json({
          success: false,
          error: 'ACCOUNT_SUSPENDED',
          message: 'Your account has been suspended or blocked. Please contact support.'
        });
      }

      return next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ success: false, error: 'TOKEN_EXPIRED', message: 'Session expired. Please log in again.' });
      }
      return res.status(401).json({ success: false, error: 'INVALID_TOKEN', message: 'Not authorized, token verification failed' });
    }
  }

  return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    const userRole = (req.user.role || 'BUYER').toUpperCase();
    const normalizedRoles = roles.map((r) => r.toUpperCase());

    // ADMIN has administrative authorization where specified
    if (userRole === 'ADMIN' && normalizedRoles.includes('ADMIN')) {
      return next();
    }

    // Handle BUYER and USER equivalence
    if ((normalizedRoles.includes('BUYER') || normalizedRoles.includes('USER')) && (userRole === 'BUYER' || userRole === 'USER')) {
      return next();
    }

    if (normalizedRoles.includes(userRole)) {
      return next();
    }

    return res.status(403).json({ success: false, message: 'Forbidden: Insufficient permissions for this action' });
  };
};

export default { protect, authorize };
