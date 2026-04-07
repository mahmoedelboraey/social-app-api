const Group = require('../models/Group');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

// ─── Create Group ─────────────────────────────────────────────────────────────
const createGroup = catchAsync(async (req, res, next) => {
  const { name, description, allMembersCanPost } = req.body;

  const group = await Group.create({
    name,
    description,
    admins: [req.user._id],
    members: [req.user._id],
    permissions: { canPost: [], allMembersCanPost: allMembersCanPost || false },
    createdBy: req.user._id,
  });

  res.status(201).json({ status: 'success', data: { group } });
});

// ─── Get All Groups ───────────────────────────────────────────────────────────
const getAllGroups = catchAsync(async (req, res, next) => {
  const groups = await Group.find()
    .populate('admins', 'username email')
    .populate('members', 'username email')
    .select('-__v');

  res.status(200).json({ status: 'success', results: groups.length, data: { groups } });
});

// ─── Get One Group ────────────────────────────────────────────────────────────
const getGroup = catchAsync(async (req, res, next) => {
  const group = await Group.findById(req.params.id)
    .populate('admins', 'username email')
    .populate('members', 'username email')
    .populate('permissions.canPost', 'username email');

  if (!group) return next(new AppError('Group not found.', 404));
  res.status(200).json({ status: 'success', data: { group } });
});

// ─── Update Group ─────────────────────────────────────────────────────────────
const updateGroup = catchAsync(async (req, res, next) => {
  const group = await Group.findById(req.params.id);
  if (!group) return next(new AppError('Group not found.', 404));

  const isAdmin = group.admins.some((a) => a.equals(req.user._id));
  if (!isAdmin && req.user.role !== 'super-admin') {
    return next(new AppError('Only group admins can update this group.', 403));
  }

  const updated = await Group.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ status: 'success', data: { group: updated } });
});

// ─── Delete Group ─────────────────────────────────────────────────────────────
const deleteGroup = catchAsync(async (req, res, next) => {
  const group = await Group.findById(req.params.id);
  if (!group) return next(new AppError('Group not found.', 404));

  const isAdmin = group.admins.some((a) => a.equals(req.user._id));
  if (!isAdmin && req.user.role !== 'super-admin') {
    return next(new AppError('Only group admins can delete this group.', 403));
  }

  await group.deleteOne();
  res.status(204).json({ status: 'success', data: null });
});

// ─── Add Member ───────────────────────────────────────────────────────────────
const addMember = catchAsync(async (req, res, next) => {
  const group = await Group.findById(req.params.id);
  if (!group) return next(new AppError('Group not found.', 404));

  const isAdmin = group.admins.some((a) => a.equals(req.user._id));
  if (!isAdmin && req.user.role !== 'super-admin') {
    return next(new AppError('Only admins can add members.', 403));
  }

  const { userId } = req.body;
  const userExists = await User.findById(userId);
  if (!userExists) return next(new AppError('User not found.', 404));

  if (group.members.some((m) => m.equals(userId))) {
    return next(new AppError('User is already a member.', 400));
  }

  group.members.push(userId);
  await group.save();

  res.status(200).json({ status: 'success', message: 'Member added successfully.', data: { group } });
});

// ─── Remove Member ────────────────────────────────────────────────────────────
const removeMember = catchAsync(async (req, res, next) => {
  const group = await Group.findById(req.params.id);
  if (!group) return next(new AppError('Group not found.', 404));

  const isAdmin = group.admins.some((a) => a.equals(req.user._id));
  if (!isAdmin && req.user.role !== 'super-admin') {
    return next(new AppError('Only admins can remove members.', 403));
  }

  const { userId } = req.body;
  group.members = group.members.filter((m) => !m.equals(userId));
  group.permissions.canPost = group.permissions.canPost.filter((u) => !u.equals(userId));
  await group.save();

  res.status(200).json({ status: 'success', message: 'Member removed successfully.' });
});

// ─── Add Admin ────────────────────────────────────────────────────────────────
const addAdmin = catchAsync(async (req, res, next) => {
  const group = await Group.findById(req.params.id);
  if (!group) return next(new AppError('Group not found.', 404));

  const isAdmin = group.admins.some((a) => a.equals(req.user._id));
  if (!isAdmin && req.user.role !== 'super-admin') {
    return next(new AppError('Only admins can promote other admins.', 403));
  }

  const { userId } = req.body;
  if (group.admins.some((a) => a.equals(userId))) {
    return next(new AppError('User is already an admin.', 400));
  }

  // Ensure admin is also a member
  if (!group.members.some((m) => m.equals(userId))) {
    group.members.push(userId);
  }
  group.admins.push(userId);
  await group.save();

  res.status(200).json({ status: 'success', message: 'Admin added successfully.' });
});

// ─── Grant Post Permission ────────────────────────────────────────────────────
const grantPostPermission = catchAsync(async (req, res, next) => {
  const group = await Group.findById(req.params.id);
  if (!group) return next(new AppError('Group not found.', 404));

  const isAdmin = group.admins.some((a) => a.equals(req.user._id));
  if (!isAdmin && req.user.role !== 'super-admin') {
    return next(new AppError('Only admins can manage permissions.', 403));
  }

  const { userId } = req.body;
  if (!group.members.some((m) => m.equals(userId))) {
    return next(new AppError('User must be a member first.', 400));
  }

  if (!group.permissions.canPost.some((u) => u.equals(userId))) {
    group.permissions.canPost.push(userId);
    await group.save();
  }

  res.status(200).json({ status: 'success', message: 'Post permission granted.' });
});

// ─── Revoke Post Permission ───────────────────────────────────────────────────
const revokePostPermission = catchAsync(async (req, res, next) => {
  const group = await Group.findById(req.params.id);
  if (!group) return next(new AppError('Group not found.', 404));

  const isAdmin = group.admins.some((a) => a.equals(req.user._id));
  if (!isAdmin && req.user.role !== 'super-admin') {
    return next(new AppError('Only admins can manage permissions.', 403));
  }

  const { userId } = req.body;
  group.permissions.canPost = group.permissions.canPost.filter((u) => !u.equals(userId));
  await group.save();

  res.status(200).json({ status: 'success', message: 'Post permission revoked.' });
});

module.exports = {
  createGroup, getAllGroups, getGroup, updateGroup, deleteGroup,
  addMember, removeMember, addAdmin, grantPostPermission, revokePostPermission,
};
