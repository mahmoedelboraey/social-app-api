const Comment = require('../models/Comment');
const Post = require('../models/Post');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

// ─── Get Comments for a Post ──────────────────────────────────────────────────
const getComments = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.postId);
  if (!post) return next(new AppError('Post not found.', 404));

  const comments = await Comment.find({ post: req.params.postId })
    .populate('author', 'username avatar')
    .sort('-createdAt');

  res.status(200).json({ status: 'success', results: comments.length, data: { comments } });
});

// ─── Create Comment ───────────────────────────────────────────────────────────
const createComment = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.postId);
  if (!post) return next(new AppError('Post not found.', 404));

  const comment = await Comment.create({
    content: req.body.content,
    author: req.user._id,
    post: req.params.postId,
  });

  await comment.populate('author', 'username avatar');
  res.status(201).json({ status: 'success', data: { comment } });
});

// ─── Delete Comment ───────────────────────────────────────────────────────────
const deleteComment = catchAsync(async (req, res, next) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) return next(new AppError('Comment not found.', 404));

  if (!comment.author.equals(req.user._id) && req.user.role !== 'super-admin') {
    return next(new AppError('You can only delete your own comments.', 403));
  }

  await comment.deleteOne();
  res.status(204).json({ status: 'success', data: null });
});

module.exports = { getComments, createComment, deleteComment };
