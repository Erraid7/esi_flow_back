const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");

// Notification-related routes
router.get("/", notificationController.getAllNotifications);
router.get("/:id", notificationController.getNotificationById);
router.put("/:id", notificationController.updateNotification);
router.delete("/:id", notificationController.deleteNotification);

module.exports = router;
// Compare this snippet from controllers/userController.js: