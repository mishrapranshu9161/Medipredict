const express = require('express');
const router = express.Router();
const { getUsers, toggleUserStatus, deleteUser } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('admin'));

router.get('/', getUsers);
router.patch('/:id/toggle-status', toggleUserStatus);
router.delete('/:id', deleteUser);

module.exports = router;
