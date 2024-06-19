const Notification = require("../models/Notification");
const mongoose = require('mongoose');

class NotificationCounter{

    async getAllUnreadNotifications(req, res) {
      try {
        const unreadNotifications = await Notification.find({ read: false });
        const unreadCount = unreadNotifications.length;
        res.status(200).json({ notifications: unreadNotifications, unreadCount });
      } catch (error) {
        res.status(400).json({ message: error.message });
      }
    }
    async markNotificationAsRead(req, res) {
        try {
            console.log("Marking notifications as read", req.body);
            const { notifications } = req.body;
            const notificationIds = notifications.map(notification => notification._id);
            await Notification.updateMany({ _id: { $in: notificationIds } }, { $set: { read: true } });
            res.status(200).send('Notifications marked as read');
        } catch (error) {
          res.status(400).json({ message: error.message });
        }
      }
}
module.exports = NotificationCounter