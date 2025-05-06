const { request, intervention, user } = require("../models");
const sendEmail = require("../utils/emailService"); // Adjust path if needed
const createNotification = require("../utils/notifcationservice"); 

// Create an Intervention
exports.createIntervention = async (req, res) => {
  try {
    const newIntervention = await intervention.create(req.body);
    res.status(201).json(newIntervention);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get All Interventions
exports.getAllInterventions = async (req, res) => {
  try {
    const interventions = await intervention.findAll();
    res.json(interventions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Intervention by ID
exports.getInterventionById = async (req, res) => {
  try {
    const interventionData = await intervention.findByPk(req.params.id);
    interventionData ? res.json(interventionData) : res.status(404).json({ message: "Intervention not found" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update Intervention
exports.updateIntervention = async (req, res) => {
  try {
    const updated = await intervention.update(req.body, { where: { id: req.params.id } });
    updated[0] ? res.json({ message: "Intervention updated" }) : res.status(404).json({ message: "Intervention not found" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete Intervention
exports.deleteIntervention = async (req, res) => {
  try {
    const deleted = await intervention.destroy({ where: { id: req.params.id } });
    deleted ? res.json({ message: "Intervention deleted" }) : res.status(404).json({ message: "Intervention not found" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.createInterventionFromRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const {
      technician_id,
      intv_status,
      deadline,
      intervention_type,
      report,
      title,
      description,
      localisation,
      equipment_id,
      priority
    } = req.body;

    // 1. Find the original request with minimal data required
    const reqData = await request.findByPk(requestId, {
      include: [
        {
          model: user,
          as: "requester",
          attributes: ['id', 'email', 'full_name'] // Only fetch needed fields
        }
      ],
    });

    if (!reqData) {
      return res.status(404).json({ message: "Request not found" });
    }

    // 2. Determine picture value: keep existing or update with uploaded file
    const updatedPicture = req.file ? req.file.path : reqData.picture;

    // 3. Update request and create intervention in parallel
    const [updatedRequest, newIntervention] = await Promise.all([
      reqData.update({
        title: title || reqData.title,
        description: description || reqData.description,
        localisation: localisation || reqData.localisation,
        equipment_id: equipment_id || reqData.equipment_id,
        priority: priority || reqData.priority,
        picture: updatedPicture,
        req_status: "accepted",
      }),

      intervention.create({
        report,
        technician_id,
        intv_status,
        deadline,
        intervention_type,
        request_id: reqData.id,
      })
    ]);

    // 4. Send the response immediately
    res.status(201).json({
      message: "Intervention created and request updated successfully.",
      intervention: newIntervention,
    });

    // 5. Background tasks (send notifications and emails)
    Promise.all([
      user.findByPk(technician_id, {
        attributes: ['id', 'email', 'full_name']
      }),

      createNotification({
        recipientId: reqData.requester.id,
        message: `✅ Your maintenance request "${reqData.title}" has been accepted and assigned to a technician.`,
        type: "info",
        requestId: reqData.id,
      })
    ])
    .then(([technician]) => {
      if (technician) {
        return Promise.all([
          createNotification({
            recipientId: technician.id,
            message: `🔧 New task assigned: "${reqData.title}" in ${reqData.localisation}. Deadline: ${deadline ? new Date(deadline).toLocaleDateString() : "Not specified"}.`,
            type: "info",
            requestId: reqData.id,
            interventionId: newIntervention.id
          }),

          // Email to requester
          reqData.requester?.email
            ? sendEmail(
                reqData.requester.email,
                "Your Maintenance Request Has Been Accepted",
                `
                <h2>Hello ${reqData.requester.full_name},</h2>
                <p>We're glad to inform you that your maintenance request titled <strong>"${reqData.title}"</strong> has been reviewed and accepted by our team.</p>
                <p>An intervention has been created and assigned to a technician.</p>
                <br/>
                <p>Thank you for your collaboration.</p>
                <p>— Maintenance Team</p>
              `
              )
            : Promise.resolve(),

          // Email to technician
          technician?.email
            ? sendEmail(
                technician.email,
                "New Task Assigned: Maintenance Intervention",
                `
                <h2>Hello ${technician.full_name},</h2>
                <p>You have been assigned a new maintenance task from a user request.</p>
                <p><strong>Task Title:</strong> ${reqData.title}</p>
                <p><strong>Location:</strong> ${reqData.localisation}</p>
                <p><strong>Deadline:</strong> ${deadline ? new Date(deadline).toLocaleDateString() : "Not specified"}</p>
                <p><strong>Status:</strong> ${intv_status}</p>
                <br/>
                <p>Please log in to your dashboard to see more details.</p>
                <p>— Maintenance Team</p>
              `
              )
            : Promise.resolve()
        ]);
      }
    })
    .catch(error => {
      console.error("Background task error:", error.message);
    });

  } catch (error) {
    console.error("Error creating intervention:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
