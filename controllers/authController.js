const User = require('../models/User');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const generateToken = require('../utils/generateToken');

// ─── Register ─────────────────────────────────────────────────────────────────
const register = catchAsync(async (req, res, next) => {
  const { username, email, password, role } = req.body;
  const existingUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existingUser) {
    return next(new AppError('Email or username already exists.', 400));
  }
  const user = await User.create({ username, email, password, role });
  const token = generateToken(user._id);
  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    },
  });
});

// ─── Login ────────────────────────────────────────────────────────────────────
const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError('Invalid email or password.', 401));
  }

  const token = generateToken(user._id);

  res.status(200).json({
    status: 'success',
    token,
    data: {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    },
  });
});

// ─── Get Me ───────────────────────────────────────────────────────────────────
const getMe = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    data: { user: req.user },
  });
});

module.exports = { register, login, getMe };
