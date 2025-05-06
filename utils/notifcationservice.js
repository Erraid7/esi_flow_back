// utils/notificationService.js

const { notification, user } = require("../models");

async function createNotification({
  recipientId,
  message,
  type,
  requestId = null,
  interventionId = null,
  method = "app_notification"
}) {
  try {
    const notif = await notification.create({
      recipient_id: recipientId,
      message,
      type,
      request_id: requestId,
      intervention_id: interventionId,
      delivery_method: method
    });

    return notif;
  } catch (error) {
    console.error("Error creating notification:", error.message);
    throw error;
  }
}

module.exports = createNotification;
