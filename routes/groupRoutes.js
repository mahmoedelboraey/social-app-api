const express = require('express');
const router = express.Router();
const {
  createGroup, getAllGroups, getGroup, updateGroup, deleteGroup,
  addMember, removeMember, addAdmin, grantPostPermission, revokePostPermission,
} = require('../controllers/groupController');
const { protect } = require('../middleware/auth');
const { validate, createGroupSchema, updateGroupSchema, userIdSchema } = require('../middleware/validate');

router.use(protect);

router.get('/', getAllGroups);
router.post('/', validate(createGroupSchema), createGroup);
router.get('/:id', getGroup);
router.patch('/:id', validate(updateGroupSchema), updateGroup);
router.delete('/:id', deleteGroup);

// Member management
router.post('/:id/members', validate(userIdSchema), addMember);
router.delete('/:id/members', validate(userIdSchema), removeMember);

// Admin management
router.post('/:id/admins', validate(userIdSchema), addAdmin);

// Permission management
router.post('/:id/permissions/grant', validate(userIdSchema), grantPostPermission);
router.post('/:id/permissions/revoke', validate(userIdSchema), revokePostPermission);

module.exports = router;
