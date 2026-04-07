const Post = require('../models/Post');
const Group = require('../models/Group');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');

// ─── Get All Posts (global + user's groups) ───────────────────────────────────
const getAllPosts = catchAsync(async (req, res, next) => {
  // Find groups the user belongs to
  const userGroups = await Group.find({
    $or: [{ members: req.user._id }, { admins: req.user._id }],
  }).select('_id');

  const groupIds = userGroups.map((g) => g._id);

  // Return global posts + posts from accessible groups
  const baseQuery = Post.find({
    $or: [{ group: null }, { group: { $in: groupIds } }],
  })
    .populate('author', 'username email avatar')
    .populate('group', 'name');

  const features = new APIFeatures(baseQuery, req.query)
    .search(['title', 'content'])
    .sort()
    .paginate();

  const posts = await features.query;
  const total = await Post.countDocuments({
    $or: [{ group: null }, { group: { $in: groupIds } }],
  });

  res.status(200).json({
    status: 'success',
    results: posts.length,
    pagination: {
      page: features.page,
      limit: features.limit,
      total,
      pages: Math.ceil(total / features.limit),
    },
    data: { posts },
  });
});

// ─── Get User Posts ────────────────────────────────────────────────────────────
const getUserPosts = catchAsync(async (req, res, next) => {
  const authorId = req.params.userId || req.user._id;

  const features = new APIFeatures(
    Post.find({ author: authorId })
      .populate('author', 'username email avatar')
      .populate('group', 'name'),
    req.query
  )
    .sort()
    .paginate();

  const posts = await features.query;

  res.status(200).json({
    status: 'success',
    results: posts.length,
    data: { posts },
  });
});

// ─── Get One Post ─────────────────────────────────────────────────────────────
const getPost = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id)
    .populate('author', 'username email avatar')
    .populate('group', 'name admins members');

  if (!post) return next(new AppError('No post found with that ID.', 404));

  // If group post, check access
  if (post.group) {
    const group = post.group;
    const isMember =
      group.members.some((m) => m.equals(req.user._id)) ||
      group.admins.some((a) => a.equals(req.user._id));

    if (!isMember && req.user.role !== 'super-admin') {
      return next(new AppError('You do not have access to this group post.', 403));
    }
  }

  res.status(200).json({ status: 'success', data: { post } });
});

// ─── Create Post ──────────────────────────────────────────────────────────────
const createPost = catchAsync(async (req, res, next) => {
  const { title, content, group: groupId } = req.body;

  // If posting to a group, check permissions
  if (groupId) {
    const group = await Group.findById(groupId);
    if (!group) return next(new AppError('Group not found.', 404));

    const isAdmin = group.admins.some((a) => a.equals(req.user._id));
    const isMember = group.members.some((m) => m.equals(req.user._id));
    const hasPostPermission = group.permissions.canPost.some((u) => u.equals(req.user._id));

    if (!isAdmin && !isMember) {
      return next(new AppError('You are not a member of this group.', 403));
    }

    if (
      !isAdmin &&
      !group.permissions.allMembersCanPost &&
      !hasPostPermission &&
      req.user.role !== 'super-admin'
    ) {
      return next(new AppError('You do not have permission to post in this group.', 403));
    }
  }

  const post = await Post.create({
    title,
    content,
    images: req.imageUrls, // Set by uploadOnImageKit middleware
    author: req.user._id,
    group: groupId || null,
  });

  await post.populate('author', 'username email avatar');

  res.status(201).json({ status: 'success', data: { post } });
});

// ─── Update Post ──────────────────────────────────────────────────────────────
const updatePost = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  if (!post) return next(new AppError('No post found with that ID.', 404));

  // Only owner or super-admin can update
  if (!post.author.equals(req.user._id) && req.user.role !== 'super-admin') {
    return next(new AppError('You can only update your own posts.', 403));
  }

  const { title, content } = req.body;
  if (title) post.title = title;
  if (content) post.content = content;
  // If new images uploaded, replace
  if (req.imageUrls && req.imageUrls.length > 0) {
    post.images = req.imageUrls;
  }

  await post.save();
  await post.populate('author', 'username email avatar');

  res.status(200).json({ status: 'success', data: { post } });
});

// ─── Delete Post ──────────────────────────────────────────────────────────────
const deletePost = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  if (!post) return next(new AppError('No post found with that ID.', 404));

  // Only owner or super-admin can delete
  if (!post.author.equals(req.user._id) && req.user.role !== 'super-admin') {
    return next(new AppError('You can only delete your own posts.', 403));
  }

  await post.deleteOne();
  res.status(204).json({ status: 'success', data: null });
});

// ─── Like / Unlike Post (Bonus) ───────────────────────────────────────────────
const toggleLike = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  if (!post) return next(new AppError('No post found with that ID.', 404));

  const alreadyLiked = post.likes.some((id) => id.equals(req.user._id));

  if (alreadyLiked) {
    post.likes = post.likes.filter((id) => !id.equals(req.user._id));
    post.likesCount = Math.max(0, post.likesCount - 1);
  } else {
    post.likes.push(req.user._id);
    post.likesCount += 1;
  }

  await post.save();

  res.status(200).json({
    status: 'success',
    message: alreadyLiked ? 'Post unliked' : 'Post liked',
    data: { likesCount: post.likesCount },
  });
});

module.exports = { getAllPosts, getUserPosts, getPost, createPost, updatePost, deletePost, toggleLike };
