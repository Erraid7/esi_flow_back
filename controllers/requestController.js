const { request, user, equipment } = require("../models");
const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinaryConfig = require("../config/cloudinary");
const sendEmail = require("../utils/emailService"); // Adjust path if needed
//create automated request for periodic maintenance
const { Op } = require("sequelize");
const dayjs = require("dayjs");
const createNotification = require("../utils/notifcationservice"); // Adjust path if needed

exports.createRequest = async (req, res) => {
  try {
    const requesterId = req.body.requesterId; // Assuming you have user ID in req.user 
    console.log("Requester ID:", requesterId); // Debugging line
    const {
      equipment_id,
      title,
      description,
      localisation,
      priority,
      picture,
    } = req.body;

    // Field validation
    if (!equipment_id || !title || !description || !localisation || !priority) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!["Low", "Medium", "High"].includes(priority)) {
      return res.status(400).json({ message: "Invalid priority value" });
    }

    // Create request first and capture the result
    const newRequest = await request.create({
      requester_id: requesterId,
      equipment_id,
      title,
      description,
      localisation,
      priority,
      picture,
    });

    // Send response immediately
    res.status(201).json(newRequest);

    // Prepare email content
    const subject = `🔔 Intervention Request: ${title} [${priority.toUpperCase()}]`;
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Intervention Request</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #4a5568; background-color: #f7fafc;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 20px auto;">
    <tr>
      <td style="padding: 0;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
          <!-- Header -->
          <tr>
            <td style="padding: 30px 20px; text-align: center; background-color: #a1c4fd; border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: white; font-size: 28px; text-shadow: 0 1px 2px rgba(0,0,0,0.1); font-weight: 600;"> New Intervention Request</h1>
            </td>
          </tr>
          
          <!-- Content area -->
          <tr>
            <td style="padding: 30px; background-color: white; border-radius: 0 0 12px 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td>
                    <!-- Title -->
                    <div style="padding: 15px 0; border-bottom: 1px solid #f0f4f8;">
                      <span style="font-weight: 600; color: #718096; display: inline-block; width: 100px; font-size: 14px;">📋 Title:</span>
                      <span style="font-weight: 500; color: #2d3748; font-size: 16px;">${title}</span>
                    </div>
                    
                    <!-- Priority -->
                    <div style="padding: 15px 0; border-bottom: 1px solid #f0f4f8;">
                      <span style="font-weight: 600; color: #718096; display: inline-block; width: 100px; font-size: 14px;">⚡ Priority:</span>
                      <span style="font-weight: 600; padding: 6px 16px; border-radius: 20px; font-size: 13px; display: inline-block; background-color: #ffeaa7; color: #6c5ce7; text-transform: uppercase; letter-spacing: 0.5px;">${priority}</span>
                    </div>
                    
                    <!-- Equipment -->
                    <div style="padding: 15px 0; border-bottom: 1px solid #f0f4f8;">
                      <span style="font-weight: 600; color: #718096; display: inline-block; width: 100px; font-size: 14px;">🔧 Equipment:</span>
                      <span style="font-weight: 500; color: #2d3748; font-size: 16px;">${equipment_id}</span>
                    </div>
                    
                    <!-- Location -->
                    <div style="padding: 15px 0; border-bottom: 1px solid #f0f4f8;">
                      <span style="font-weight: 600; color: #718096; display: inline-block; width: 100px; font-size: 14px;">📍 Location:</span>
                      <span style="font-weight: 500; color: #2d3748; font-size: 16px;">${localisation}</span>
                    </div>
                    
                    <!-- Description -->
                    <div style="padding: 15px 0 25px 0; border-bottom: 1px solid #f0f4f8;">
                      <div style="font-weight: 600; color: #718096; margin-bottom: 12px; font-size: 14px;">📝 Description:</div>
                      <div style="line-height: 1.6; background-color: #f8fafc; padding: 18px; border-radius: 10px; border-left: 4px solid #a1c4fd; color: #2d3748; font-size: 15px;">
                        ${description}
                      </div>
                    </div>
                    
                    <!-- Image attachment (conditional) -->
                    ${picture ? `
                    <div style="padding: 25px 0; text-align: center;">
                      <a href="${picture}" style="display: inline-block; background-color: #ddd6fe; color: #4a5568; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: 500; box-shadow: 0 4px 15px rgba(0,0,0,0.08); transition: all 0.3s ease; font-size: 15px;">
                        📷 View Attached Image
                      </a>
                    </div>` : ''}
                    
                    <!-- Single action button -->
                    <div style="padding: 25px 0 15px 0; text-align: center;">
                      <a href="https://esi-flow.vercel.app/" style="display: inline-block; background-color: #a1c4fd; color: white; text-decoration: none; padding: 16px 40px; border-radius: 10px; font-weight: 600; box-shadow: 0 4px 15px rgba(0,0,0,0.08); transition: all 0.3s ease; font-size: 16px;">
                        🌐 View on ESI Flow
                      </a>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 25px 20px; text-align: center; font-size: 12px; color: #a0aec0; background-color: #f8fafc; border-radius: 0 0 8px 8px;">
              <p style="margin: 8px 0; line-height: 1.4;">This is an automatic notification. Please do not reply to this email.</p>
              <p style="margin: 8px 0; line-height: 1.4;">© 2025 Your Company. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;


    // Helper function to set color based on priority
    function getPriorityColor(priority) {
      const priorityLower = priority.toLowerCase();
      
      if (priorityLower === 'high' || priorityLower === 'urgent') {
        return '#dc2626'; // red
      } else if (priorityLower === 'medium') {
        return '#f59e0b'; // amber
      } else {
        return '#10b981'; // green
      }
    }

    // Perform background tasks asynchronously without awaiting
    Promise.all([
      // Create app notifications and send emails for admins
      (async () => {
        // Only query for admin IDs, not entire user objects
        const admins = await user.findAll({
          attributes: ['id', 'email'],
          where: { role: "Admin" }
        });
        
        // Create separate arrays for notification and email promises
        const notificationPromises = admins.map((admin) => 
          createNotification({
            recipientId: admin.id,
            message: `📬 A new intervention request titled "${title}" was submitted.`,
            type: "Info",
            requestId: newRequest.id,
          })
        );
        
        // Send emails to all admins
        const emailPromises = admins.map((admin) => 
          sendEmail(admin.email, subject, htmlContent)
        );
        
        // Wait for all notification and email promises to resolve
        await Promise.all([...notificationPromises, ...emailPromises]);
      })()
    ]).catch(error => {
      console.error("Background task error:", error);
      // Consider sending to a monitoring system
    });
    
  } catch (error) {
    console.error("Error creating request:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};



// Get All Requests
exports.getAllRequests = async (req, res) => {
  try {
    const requests = await request.findAll({
      include: [
        {
          model: user,
          as: "requester", // Alias must match the model association
          attributes: ["id", "full_name", "email", "role"],
        },
        {
          model: equipment,
          as: "equipment",
          attributes: ["id", "type", "category", "localisation"],
        },
      ],
    });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Request by ID
exports.getRequestById = async (req, res) => {
  try {
    const requestData = await request.findByPk(req.params.id);
    requestData
      ? res.json(requestData)
      : res.status(404).json({ message: "Request not found" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Requests by User ID
exports.getRequestsByUserId = async (req, res) => {
  try {
    const requests = await request.findAll({
      where: { requester_id: req.params.userId },
      include: [
        {
          model: user,
          as: "requester",
          attributes: ["id", "full_name", "email", "role"],
        },
        {
          model: equipment,
          as: "equipment",
          attributes: ["id", "type", "category", "localisation"],
        },
      ],
    });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Update Request
exports.updateRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Find the request before updating to check status change
    const requestData = await request.findByPk(id, {
      include: [
        {
          model: user,
          as: "requester",
          attributes: ['id', 'email', 'full_name']
        }
      ]
    });
    
    if (!requestData) {
      return res.status(404).json({ message: "Request not found" });
    }
    
    // Check if status is being changed to "Refused"
    const isRefused = updateData.req_status === "Refused" && requestData.req_status !== "Refused";
    
    // Update the request
    const updated = await request.update(updateData, {
      where: { id }
    });
    
    if (!updated[0]) {
      return res.status(404).json({ message: "Request not found or no changes applied" });
    }
    
    // Send response immediately
    res.json({ message: "Request updated successfully" });
    
    // Handle email notification if request was refused
    if (isRefused && requestData.requester?.email) {
      try {
        await Promise.all([
          // Send email notification
          sendEmail(
            requestData.requester.email,
            "Your Maintenance Request Has Been Refused",
            `
            <h2>Hello ${requestData.requester.full_name},</h2>
            <p>We regret to inform you that your maintenance request titled <strong>"${requestData.title}"</strong> has been reviewed and declined by our team.</p>
            ${updateData.refusal_reason ? `<p><strong>Reason:</strong> ${updateData.refusal_reason}</p>` : ''}
            <p>If you have any questions or wish to submit a new request with additional information, please don't hesitate to contact us.</p>
            <br/>
            <p>Thank you for your understanding.</p>
            <p>— Maintenance Team</p>
            `
          ),
          
          // Create notification for requester
          createNotification({
            recipientId: requestData.requester.id,
            message: `❌ Your maintenance request "${requestData.title}" has been refused.`,
            type: "Warning",
            requestId: requestData.id,
          })
        ]);
      } catch (emailError) {
        console.error("Error sending refusal notification:", emailError.message);
      }
    }
  } catch (error) {
    console.error("Error updating request:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// Delete Request
exports.deleteRequest = async (req, res) => {
  try {
    const deleted = await request.destroy({ where: { id: req.params.id } });
    deleted
      ? res.json({ message: "Request deleted" })
      : res.status(404).json({ message: "Request not found" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    console.log("File uploaded:", req.file);

    let imageUrl;
    
    if (typeof req.file.path === "string") {
      imageUrl = req.file.path;
    } else if (typeof req.file.path === "object" && req.file.path.secure_url) {
      imageUrl = req.file.path.secure_url; 
    } else {
      throw new Error("Unexpected file upload format");
    }

    res.json({ message: "Image uploaded successfully", imageUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Image upload failed", error: error.message });
  }
};



async function notifyAdmins(newReq, eq, title, reason) {
  const admins = await user.findAll({ where: { role: "admin" } });

  const notifMsg = `🔧 Automatic maintenance request created for equipment #${eq.id}`;

  const emailTitle = title.includes("Seasonal")
    ? "🌦️ Seasonal Maintenance Triggered"
    : "🔁 Periodic Maintenance Triggered";

  const emailContent = `
    <div style="font-family: Arial, sans-serif; padding: 24px; background-color: #f3f4f6; border-radius: 10px;">
      <h2 style="color: #4b5563;">${emailTitle}</h2>
      <p style="margin-bottom: 12px;">A new automatic maintenance request has been created.</p>
      <ul style="list-style: none; padding-left: 0;">
        <li><strong>🆔 Equipment Code:</strong> ${eq.inventorie_code}</li>
        <li><strong>📍 Location:</strong> ${eq.localisation}</li>
        <li><strong>📄 Reason:</strong> ${reason}</li>
        <li><strong>🛠️ Request ID:</strong> ${newReq.id}</li>
      </ul>
      ${eq.picture ? `<p><a href="${eq.picture}" style="color: #3b82f6;">📷 View Equipment Image</a></p>` : ""}
      <p style="font-size: 12px; color: #6b7280;">Generated automatically by the maintenance system.</p>
    </div>
  `;

  await Promise.all([
    ...admins.map((admin) =>
      createNotification({
        recipientId: admin.id,
        message: notifMsg,
        type: "info",
        requestId: newReq.id,
      })
    ),
    ...admins.map((admin) => sendEmail(admin.email, emailTitle, emailContent)),
  ]);
}

exports.handlePeriodicRequests = async (req, res) => {
  try {
    const now = dayjs();
    const allEquipment = await equipment.findAll();
    const newRequests = [];

    for (const eq of allEquipment) {
      if (!eq.automatic_maintenance_interval) continue;

      const lastMaintenance = eq.maintenance_history?.length
        ? dayjs.unix(eq.maintenance_history[eq.maintenance_history.length - 1])
        : null;

      if (!lastMaintenance) continue;

      const daysSinceLast = now.diff(lastMaintenance, "day");
      if (daysSinceLast >= eq.automatic_maintenance_interval) {
        const newReq = await request.create({
          requester_id: 20,
          equipment_id: eq.id,
          title: "🔁 Periodic Maintenance Needed",
          description: `Automatically generated: Scheduled every ${eq.automatic_maintenance_interval} days`,
          localisation: eq.localisation || "Not specified",
          priority: "medium",
          picture: eq.picture,
        });

        newRequests.push(newReq);
        await notifyAdmins(newReq, eq, newReq.title, `Scheduled every ${eq.automatic_maintenance_interval} days`);
      }
    }

    res.status(201).json({
      message: `${newRequests.length} periodic request(s) created`,
      data: newRequests,
    });
  } catch (error) {
    console.error("Periodic Auto Request Error:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

exports.handleSeasonalRequests = async (req, res) => {
  try {
    const now = dayjs();
    const currentMonth = now.month() + 1;
    const allEquipment = await equipment.findAll();
    const newRequests = [];

    for (const eq of allEquipment) {
      if (!Array.isArray(eq.seasonal_maintenance_months)) continue;
      if (!eq.seasonal_maintenance_months.includes(currentMonth)) continue;

      const lastMaintenance = eq.maintenance_history?.length
        ? dayjs.unix(eq.maintenance_history[eq.maintenance_history.length - 1])
        : null;

      // Avoid duplicate request in the same month
      if (lastMaintenance && lastMaintenance.month() + 1 === currentMonth) continue;

      const newReq = await request.create({
        requester_id: 20,
        equipment_id: eq.id,
        title: "🌦️ Seasonal Maintenance Needed",
        description: `Automatically generated: Seasonal maintenance for month ${currentMonth}`,
        localisation: eq.localisation || "Not specified",
        priority: "medium",
        picture: eq.picture,
      });

      newRequests.push(newReq);
      await notifyAdmins(newReq, eq, newReq.title, `Seasonal maintenance for month ${currentMonth}`);
    }

    res.status(201).json({
      message: `${newRequests.length} seasonal request(s) created`,
      data: newRequests,
    });
  } catch (error) {
    console.error("Seasonal Auto Request Error:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};
