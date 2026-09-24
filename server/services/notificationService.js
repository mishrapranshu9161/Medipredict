const Notification = require('../models/Notification');

/**
 * Creates an in-app notification for a given user
 */
const createNotification = async ({ recipient, title, message, type = 'system', link = '' }) => {
  try {
    const notification = await Notification.create({
      recipient,
      title,
      message,
      type,
      link
    });
    return notification;
  } catch (error) {
    console.error('Notification Creation Error:', error.message);
    return null;
  }
};

module.exports = {
  createNotification
};
