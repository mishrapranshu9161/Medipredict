const Notification = require('../models/Notification');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Get logged in user notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .limit(30);

    const unreadCount = await Notification.countDocuments({ recipient: req.user._id, isRead: false });

    return successResponse(res, 200, 'Notifications retrieved', { notifications, unreadCount });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark notification(s) as read
// @route   PATCH /api/notifications/mark-read
// @access  Private
const markAsRead = async (req, res, next) => {
  try {
    const { notificationId } = req.body;

    if (notificationId) {
      await Notification.findByIdAndUpdate(notificationId, { isRead: true });
    } else {
      // Mark all as read for user
      await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true });
    }

    return successResponse(res, 200, 'Notification status updated');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  markAsRead
};
