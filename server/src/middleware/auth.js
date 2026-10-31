import { verifyToken } from '../utils/jwt.js';
import { User } from '../modules/users/user.model.js';
import { Customer } from '../modules/customers/customer.model.js';

export const authenticate = async (req, res, next) => {
  try {
    let token;

    // 1. Check HttpOnly cookie
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    // 2. Check Authorization Bearer header (supports API/test calls)
    else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required. Please log in.',
          details: [],
        },
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = await verifyToken(token);
    } catch (err) {
      const isExpired = err.name === 'TokenExpiredError';
      return res.status(401).json({
        success: false,
        error: {
          code: isExpired ? 'TOKEN_EXPIRED' : 'INVALID_TOKEN',
          message: isExpired
            ? 'Your session has expired. Please log in again.'
            : 'Invalid authentication token.',
          details: [],
        },
      });
    }

    // Check if user still exists and is active
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'The account associated with this session no longer exists.',
          details: [],
        },
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCOUNT_DEACTIVATED',
          message: 'Your account has been deactivated. Please contact an administrator.',
          details: [],
        },
      });
    }

    // Attach user to request
    req.user = user;

    // If role is customer, load associated Customer profile
    if (user.role === 'customer') {
      const customer = await Customer.findOne({ userId: user._id });
      req.customer = customer;
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required.',
          details: [],
        },
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to perform this action.',
          details: [{ requiredRoles: roles, userRole: req.user.role }],
        },
      });
    }

    next();
  };
};
