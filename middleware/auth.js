const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

// ─── Protect: verify JWT and attach user to req ───────────────────────────────
const protect = catchAsync(async (req, res, next) => {
  // 1. Get token from header
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('You are not logged in. Please log in to get access.', 401));
  }
  // 2. Verify token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  // 3. Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError('The user belonging to this token no longer exists.', 401));
  }

  // 4. Attach user to request
  req.user = currentUser;
  next();
});

// ─── restrictTo: role-based access control ────────────────────────────────────
const restrictTo = (...roles) => {
  return (req, res, next) => {
    // super-admin bypasses all role restrictions
    if (req.user.role === 'super-admin') return next();

    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action.', 403));
    }
    next();
  };
};

module.exports = { protect, restrictTo };
