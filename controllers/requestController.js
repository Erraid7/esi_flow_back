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

    if (!["low", "medium", "high"].includes(priority)) {
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
    const subject = `📬 New Intervention Request Submitted: ${title}`;
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 24px; background-color: #f9fafb; border-radius: 12px;">
        <h2 style="color: #4f46e5;">New Request Submitted</h2>
        <p><strong>Title:</strong> ${title}</p>
        <p><strong>Description:</strong> ${description}</p>
        <p><strong>Location:</strong> ${localisation}</p>
        <p><strong>Priority:</strong> ${priority}</p>
        <p><strong>Equipment ID:</strong> ${equipment_id}</p>
        <p><a href="${picture}" style="color: #2563eb;">📷 View Attached Picture</a></p>
        <br/>
        <p style="font-size: 12px; color: #6b7280;">This is an automatic notification. Please do not reply.</p>
      </div>
    `;

    // Perform background tasks asynchronously without awaiting
    Promise.all([
      // Create app notifications and send emails for admins
      (async () => {
        // Only query for admin IDs, not entire user objects
        const admins = await user.findAll({
          attributes: ['id', 'email'],
          where: { role: "admin" }
        });
        
        // Create separate arrays for notification and email promises
        const notificationPromises = admins.map((admin) => 
          createNotification({
            recipientId: admin.id,
            message: `📬 A new intervention request titled "${title}" was submitted.`,
            type: "info",
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

// Update Request
exports.updateRequest = async (req, res) => {
  try {
    const updated = await request.update(req.body, {
      where: { id: req.params.id },
    });
    updated[0]
      ? res.json({ message: "Request updated" })
      : res.status(404).json({ message: "Request not found" });
  } catch (error) {
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