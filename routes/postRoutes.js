const express = require('express');
const router = express.Router();
const {
  getAllPosts, getUserPosts, getPost,
  createPost, updatePost, deletePost, toggleLike,
} = require('../controllers/postController');
const { getComments, createComment, deleteComment } = require('../controllers/commentController');
const { protect } = require('../middleware/auth');
const { uploadImages, uploadOnImageKit } = require('../middleware/upload');
const { validate, createPostSchema, updatePostSchema, createCommentSchema } = require('../middleware/validate');

router.use(protect);

router.get('/', getAllPosts);
router.get('/my-posts', getUserPosts);
router.get('/user/:userId', getUserPosts);
router.get('/:id', getPost);

router.post('/', uploadImages, uploadOnImageKit, validate(createPostSchema), createPost);
router.patch('/:id', uploadImages, uploadOnImageKit, validate(updatePostSchema), updatePost);
router.delete('/:id', deletePost);

// Likes
router.post('/:id/like', toggleLike);

// Comments (nested under posts)
router.get('/:postId/comments', getComments);
router.post('/:postId/comments', validate(createCommentSchema), createComment);
router.delete('/:postId/comments/:id', deleteComment);

module.exports = router;
