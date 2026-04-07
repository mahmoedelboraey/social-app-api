const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Post title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    content: {
      type: String,
      required: [true, 'Post content is required'],
      minlength: [10, 'Content must be at least 10 characters'],
    },
    images: {
      type: [String], // Array of ImageKit URLs
      validate: {
        validator: (arr) => arr.length > 0,
        message: 'Post must have at least one image',
      },
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Post must have an author'],
    },
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      default: null, // null = global post
    },
    // Bonus: likes system
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    likesCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: populate comments count
postSchema.virtual('commentsCount', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'post',
  count: true,
});

// Index for search and sorting
postSchema.index({ title: 'text', content: 'text' });
postSchema.index({ createdAt: -1 });
postSchema.index({ author: 1 });
postSchema.index({ group: 1 });

const Post = mongoose.model('Post', postSchema);
module.exports = Post;
