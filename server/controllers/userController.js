const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Get all users with search, filter, pagination
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res, next) => {
  try {
    const { role, search, status, page = 1, limit = 20 } = req.query;

    const query = {};
    if (role) query.role = role;
    if (status !== undefined && status !== '') query.isActive = status === 'true';
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const count = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    return successResponse(res, 200, 'Users retrieved successfully', {
      users,
      page: Number(page),
      pages: Math.ceil(count / limit),
      total: count
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle user active status
// @route   PATCH /api/users/:id/toggle-status
// @access  Private/Admin
const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }

    if (user.role === 'admin' && user._id.toString() === req.user._id.toString()) {
      return errorResponse(res, 400, 'You cannot deactivate your own admin account');
    }

    user.isActive = !user.isActive;
    await user.save();

    return successResponse(res, 200, `User ${user.isActive ? 'activated' : 'deactivated'} successfully`, { user });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }

    if (user._id.toString() === req.user._id.toString()) {
      return errorResponse(res, 400, 'You cannot delete yourself');
    }

    if (user.role === 'patient') {
      await Patient.deleteOne({ user: user._id });
    } else if (user.role === 'doctor') {
      await Doctor.deleteOne({ user: user._id });
    }

    await user.deleteOne();

    return successResponse(res, 200, 'User deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  toggleUserStatus,
  deleteUser
};
