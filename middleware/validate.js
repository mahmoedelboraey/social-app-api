const Joi = require('joi');
const AppError = require('../utils/AppError');

// ─── Generic validation middleware factory ───────────────────────────────────
const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const message = error.details.map((d) => d.message).join(', ');
    return next(new AppError(message, 400));
  }
  next();
};
// ─── Auth Schemas ─────────────────────────────────────────────────────────────
const registerSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('user', 'admin', 'super-admin'),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

// ─── User Schemas ─────────────────────────────────────────────────────────────
const updateUserSchema = Joi.object({
  username: Joi.string().min(3).max(30),
  email: Joi.string().email(),
  password: Joi.string().min(6),
  role: Joi.string().valid('user', 'admin', 'super-admin'),
}).min(1); // At least one field required

// ─── Post Schemas ─────────────────────────────────────────────────────────────
const createPostSchema = Joi.object({
  title: Joi.string().min(3).max(200).required(),
  content: Joi.string().min(10).required(),
  group: Joi.string().hex().length(24), // Optional ObjectId
});

const updatePostSchema = Joi.object({
  title: Joi.string().min(3).max(200),
  content: Joi.string().min(10),
}).min(1);

// ─── Group Schemas ────────────────────────────────────────────────────────────
const createGroupSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  description: Joi.string().max(500),
  allMembersCanPost: Joi.boolean(),
});

const updateGroupSchema = Joi.object({
  name: Joi.string().min(3).max(100),
  description: Joi.string().max(500),
  allMembersCanPost: Joi.boolean(),
}).min(1);

const userIdSchema = Joi.object({
  userId: Joi.string().hex().length(24).required(),
});

// ─── Comment Schemas ──────────────────────────────────────────────────────────
const createCommentSchema = Joi.object({
  content: Joi.string().min(1).max(1000).required(),
});

module.exports = {
  validate,
  registerSchema,
  loginSchema,
  updateUserSchema,
  createPostSchema,
  updatePostSchema,
  createGroupSchema,
  updateGroupSchema,
  userIdSchema,
  createCommentSchema,
};
