const express = require('express');
const router = express.Router();
const { getAllUsers, getUser, updateUser, deleteUser } = require('../controllers/userController');
const { protect, restrictTo } = require('../middleware/auth');
const { validate, updateUserSchema } = require('../middleware/validate');

// All user routes require authentication
router.use(protect);

router.get('/', restrictTo('admin', 'super-admin'), getAllUsers);
router.get('/:id', getUser);
router.patch('/:id', validate(updateUserSchema), updateUser);
router.delete('/:id', deleteUser);

module.exports = router;
