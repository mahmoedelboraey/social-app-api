const User = require('../models/User');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

// ─── Get All Users ────────────────────────────────────────────────────────────
const getAllUsers = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const users = await User.find().skip(skip).limit(limit).select('-__v');
  const total = await User.countDocuments();

  res.status(200).json({
    status: 'success',
    results: users.length,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    data: { users },
  });
});

// ─── Get One User ─────────────────────────────────────────────────────────────
const getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id).select('-__v');
  if (!user) return next(new AppError('No user found with that ID.', 404));

  res.status(200).json({ status: 'success', data: { user } });
});

// ─── Update User ──────────────────────────────────────────────────────────────
const updateUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  // Only super-admin can update any user; others update themselves only
  if (req.user.role !== 'super-admin' && req.user._id.toString() !== id) {
    return next(new AppError('You can only update your own account.', 403));
  }

  // Prevent non-super-admins from changing roles
  if (req.body.role && req.user.role !== 'super-admin') {
    return next(new AppError('You are not allowed to change roles.', 403));
  }

  const user = await User.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  }).select('-__v');

  if (!user) return next(new AppError('No user found with that ID.', 404));

  res.status(200).json({ status: 'success', data: { user } });
});

// ─── Delete User ──────────────────────────────────────────────────────────────
const deleteUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  // Only super-admin can delete any user; others delete themselves only
  if (req.user.role !== 'super-admin' && req.user._id.toString() !== id) {
    return next(new AppError('You can only delete your own account.', 403));
  }

  const user = await User.findByIdAndDelete(id);
  if (!user) return next(new AppError('No user found with that ID.', 404));

  res.status(204).json({ status: 'success', data: null });
});

module.exports = { getAllUsers, getUser, updateUser, deleteUser };
