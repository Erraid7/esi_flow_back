const { notification } = require("../models");

// Create a Notification
exports.createNotification = async (req, res) => {
  try {
    const newNotification = await notification.create(req.body);
    res.status(201).json(newNotification);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get All Notifications
exports.getAllNotifications = async (req, res) => {
  try {
    const notifications = await notification.findAll();
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Notification by ID
exports.getNotificationById = async (req, res) => {
  try {
    const notificationData = await notification.findByPk(req.params.id);
    notificationData
      ? res.json(notificationData)
      : res.status(404).json({ message: "Notification not found" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update Notification
exports.updateNotification = async (req, res) => {
  try {
    const updated = await notification.update(req.body, { where: { id: req.params.id } });
    updated[0]
      ? res.json({ message: "Notification updated" })
      : res.status(404).json({ message: "Notification not found" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete Notification
exports.deleteNotification = async (req, res) => {
  try {
    const deleted = await notification.destroy({ where: { id: req.params.id } });
    deleted
      ? res.json({ message: "Notification deleted" })
      : res.status(404).json({ message: "Notification not found" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
