const { request, intervention, user, equipment } = require("../models");
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
    interventionData ? res.json(interventionData) : res.json({ message: "Intervention not found" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Interventions by Technician ID
exports.getInterventionsByTechnicianId = async (req, res) => {
  try {
    const interventions = await intervention.findAll({
      where: { technician_id: req.params.technicianId },
      include: [
        {
          model: request,
          as: "request",
          include: [
            {
              model: user,
              as: "requester",
              attributes: ['id', 'email', 'full_name']
            }
          ]
        }
      ]
    });
    interventions.length ? res.json(interventions) : res.json({ message: "No interventions found for this technician" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update Intervention
exports.updateIntervention = async (req, res) => {
  try {
    const {
      technician_id,
      intv_status,
      deadline,
      intervention_type,
      report,
      equipment_id,
      priority
    } = req.body;

    // 1. Find the intervention with related data
    const interventionData = await intervention.findByPk(req.params.id, {
      include: [
        {
          model: request,
          as: "request",
          include: [
            {
              model: user,
              as: "requester",
              attributes: ['id', 'email', 'full_name']
            }
          ]
        }
      ]
    });

    if (!interventionData) {
      return res.status(404).json({ message: "Intervention not found" });
    }

    const oldIntvStatus = interventionData?.intv_status;

    // 2. Find equipment if equipment_id is provided or use existing one
    let equipmentData = null;
    if (equipment_id) {
      equipmentData = await equipment.findByPk(equipment_id, {
        attributes: ['id', 'eqp_status']
      });

      if (!equipmentData) {
        return res.status(404).json({ message: "Equipment not found" });
      }
    }

    // 3. Prepare updates with status transitions
    const updates = [];
    
    // Update intervention
    updates.push(
      interventionData.update({
        technician_id: technician_id || interventionData.technician_id,
        intv_status: intv_status || interventionData.intv_status,
        deadline: deadline || interventionData.deadline,
        intervention_type: intervention_type || interventionData.intervention_type,
        report: report || interventionData.report
      })
    );

    // Update request if needed
    if (interventionData.request) {
      // Update the related request
      updates.push(
        interventionData.request.update({
          equipment_id: equipment_id || interventionData.request.equipment_id,
          priority: priority || interventionData.request.priority,
        })
      );
    }

    // Update equipment status based on intervention status if relevant
    if (equipmentData || (intv_status && interventionData.request?.equipment_id)) {
      const eqpId = equipment_id || interventionData.request.equipment_id;
      
      if (eqpId) {
        const eqpToUpdate = equipmentData || await equipment.findByPk(eqpId);
        
        if (eqpToUpdate) {
          updates.push(
            eqpToUpdate.update({
              eqp_status: intv_status === 'Completed' ? 'Working' : 
                         intv_status === 'In Progress' ? 'Needs Maintenance' : 
                         intv_status === 'Pending' ? 'Out of service' :
                         eqpToUpdate.eqp_status
            })
          );
        }
      }
    }

    // 4. Execute all updates in parallel
    await Promise.all(updates);

    // 5. Send the response immediately
    res.status(200).json({
      message: "Intervention updated successfully",
      intervention: await intervention.findByPk(req.params.id)
    });

    // 8. Background tasks (send notifications and emails)
    Promise.all([
      user.findByPk(technician_id || interventionData.technician_id, {
        attributes: ['id', 'email', 'full_name']
      })
    ])
    .then(([technician]) => {
      const notifications = [];
      const emails = [];

      // Only send notifications for meaningful status updates
      if (intv_status && intv_status !== oldIntvStatus) {
        // Notification to requester about status change
        if (interventionData.request?.requester) {
          const requester = interventionData.request.requester;
          
          // Create notification for requester
          if (intv_status !== 'In Progress' && intv_status !== 'Completed') {
          notifications.push(
            createNotification({
              recipientId: requester.id,
              message: `🔄 Your maintenance request "${interventionData.request.title}" has been updated to "${intv_status}".`,
              type: "Info",
              requestId: interventionData.request.id,
              interventionId: interventionData.id
            })
          );
          } else {
            notifications.push(
              createNotification({
                recipientId: requester.id,
                message: `✅ Your maintenance request "${interventionData.request.title}" has been ${intv_status === 'In Progress' ? 'started' : 'completed'}.`,
                type: "Success",
                requestId: interventionData.request.id,
                interventionId: interventionData.id
              })
            );
          }

          // Email to requester
          if (requester.email) {
            let statusMessage = '';
            switch (intv_status) {
              case 'In Progress':
                statusMessage = 'Work has started on your maintenance request.';
                break;
              case 'Completed':
                statusMessage = 'Your maintenance request has been completed.';
                break;
              case 'Scheduled':
                statusMessage = `Your maintenance request has been scheduled${deadline ? ` for ${new Date(deadline).toLocaleDateString()}` : ''}.`;
                break;
              default:
                statusMessage = `Your maintenance request status has been updated to "${intv_status}".`;
            }

            emails.push(
              sendEmail(
                requester.email,
                `Maintenance Request Status Update: ${intv_status}`,
                `
                <!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Request Status Update</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #4a5568; background-color: #f7fafc;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 20px auto;">
    <tr>
      <td style="padding: 0;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
          <!-- Header -->
          <tr>
            <td style="padding: 30px 20px; text-align: center; background-color: #0D57AB; border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: white; font-size: 28px; text-shadow: 0 1px 2px rgba(0,0,0,0.1); font-weight: 600;">Request Status Update</h1>
            </td>
          </tr>
          
          <!-- Content area -->
          <tr>
            <td style="padding: 40px 30px; background-color: white; border-radius: 0 0 12px 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td>
                    <!-- Greeting -->
                    <h2 style="margin: 0 0 20px 0; color: #2d3748; font-size: 22px; font-weight: 600;">Hello ${requester.full_name},</h2>
                    
                    <!-- Status message -->
                    <p style="margin: 0 0 25px 0; line-height: 1.6; color: #4a5568; font-size: 16px;">
                      ${statusMessage}
                    </p>
                    
                    <!-- Request details -->
                    <div style="background-color: #f8fafc; padding: 25px; border-radius: 10px; border-left: 4px solid #0D57AB; margin: 25px 0;">
                      <!-- Request Title -->
                      <div style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                        <span style="font-weight: 600; color: #718096; display: inline-block; width: 120px; font-size: 14px;">Request Title:</span>
                        <span style="font-weight: 500; color: #2d3748; font-size: 15px;">${interventionData.request.title}</span>
                      </div>
                      
                      <!-- Current Status -->
                      <div style="padding: 8px 0; ${report ? 'border-bottom: 1px solid #e2e8f0;' : ''}">
                        <span style="font-weight: 600; color: #718096; display: inline-block; width: 120px; font-size: 14px;">Current Status:</span>
                        <span style="font-weight: 600; padding: 4px 12px; border-radius: 15px; font-size: 13px; display: inline-block; background-color: #dbeafe; color: #0D57AB; text-transform: uppercase; letter-spacing: 0.5px;">${intv_status}</span>
                      </div>
                      
                      <!-- Technician Notes (conditional) -->
                      ${report ? `
                      <div style="padding: 8px 0;">
                        <div style="font-weight: 600; color: #718096; margin-bottom: 8px; font-size: 14px;">Technician Notes:</div>
                        <div style="background-color: white; padding: 12px; border-radius: 6px; color: #2d3748; font-size: 15px; line-height: 1.5; border: 1px solid #e2e8f0;">
                          ${report}
                        </div>
                      </div>` : ''}
                    </div>
                    
                    <!-- Closing -->
                    <p style="margin: 25px 0 8px 0; line-height: 1.6; color: #4a5568; font-size: 16px;">
                      Thank you for your patience.
                    </p>
                    
                    <p style="margin: 0; color: #718096; font-size: 15px; font-weight: 500;">
                      — Maintenance Team
                    </p>
                    
                    <!-- Action button -->
                    <div style="padding: 30px 0 10px 0; text-align: center;">
                      <a href="https://esi-flow.vercel.app/" style="display: inline-block; background-color: #0D57AB; color: white; text-decoration: none; padding: 14px 35px; border-radius: 8px; font-weight: 500; box-shadow: 0 4px 15px rgba(0,0,0,0.08); font-size: 15px;">
                        View Details
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
                `
              )
            );
          }
        }

        // Notification to technician if technician changed
        if (technician && technician_id && technician_id !== interventionData.technician_id) {
          notifications.push(
            createNotification({
              recipientId: technician.id,
              message: `🔧 New task reassigned to you: "${interventionData.request?.title}" in ${interventionData.request?.localisation}. Deadline: ${deadline ? new Date(deadline).toLocaleDateString() : "Not specified"}.`,
              type: "Info",
              requestId: interventionData.request?.id,
              interventionId: interventionData.id
            })
          );

          // Email to new technician
          if (technician.email) {
            emails.push(
              sendEmail(
                technician.email,
                "New Task Assigned: Maintenance Intervention",
                `
                <h2>Hello ${technician.full_name},</h2>
                <p>You have been assigned a maintenance task that was previously assigned to another technician.</p>
                <p><strong>Task Title:</strong> ${interventionData.request?.title}</p>
                <p><strong>Location:</strong> ${interventionData.request?.localisation}</p>
                <p><strong>Status:</strong> ${intv_status || interventionData.intv_status}</p>
                <p><strong>Deadline:</strong> ${deadline ? new Date(deadline).toLocaleDateString() : (interventionData.deadline ? new Date(interventionData.deadline).toLocaleDateString() : "Not specified")}</p>
                <br/>
                <p>Please log in to your dashboard to see more details.</p>
                <p>— Maintenance Team</p>
                `
              )
            );
          }
        }

        // Process all notifications and emails
        return Promise.all([...notifications, ...emails]);
      }
      
      return Promise.resolve();
    })
    .catch(error => {
      console.error("Background task error:", error.message);
    });

  } catch (error) {
    console.error("Error updating intervention:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
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
      priority,
      request_code,
      requester_id // Add requester_id for new request creation
    } = req.body;

    let reqData;
    let isNewRequest = false;

    // Check if we're creating from an existing request or creating a new one
    if (requestId && requestId !== 'new') {
      // 1. Find the original request with minimal data required
      reqData = await request.findByPk(requestId, {
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
    } else {
      // Creating a new request from scratch
      isNewRequest = true;
      
      // Validate required fields for new request
      if (!title || !equipment_id) {
        return res.status(400).json({ 
          message: "Title and equipment_id are required when creating a new request" 
        });
      }

      if (!requester_id) {
        return res.status(400).json({ 
          message: "Requester ID is required when creating a new request" 
        });
      }

      // Find the requester user for later notification
      const requesterData = await user.findByPk(requester_id, {
        attributes: ['id', 'email', 'full_name']
      });

      if (!requesterData) {
        return res.status(404).json({ message: "Requester not found" });
      }

      // Create a new request
      reqData = await request.create({
        title,
        description,
        localisation,
        equipment_id,
        priority,
        picture: req.file ? req.file.path : null,
        req_status: "Accepted", // Auto-accept since we're creating an intervention
        requester_id,
        request_code
      });

      // Attach the requester for notification use
      reqData.requester = requesterData;
    }

    // Find the equipment associated with the request
    const equipmentData = await equipment.findByPk(equipment_id, {
      attributes: ['id', "eqp_status"] // Only fetch needed fields
    });

    if (!equipmentData) {
      // If we created a new request but equipment is invalid, delete the request
      if (isNewRequest) {
        await reqData.destroy();
      }
      return res.status(404).json({ message: "Equipment not found" });
    }

    // Determine picture value for existing request updates
    const updatedPicture = req.file ? req.file.path : (isNewRequest ? null : reqData.picture);

    // Create tasks array for Promise.all
    const tasks = [];

    // Only update request if we're working with an existing one
    if (!isNewRequest) {
      tasks.push(
        reqData.update({
          title: title || reqData.title,
          description: description || reqData.description,
          localisation: localisation || reqData.localisation,
          equipment_id: equipment_id || reqData.equipment_id,
          priority: priority || reqData.priority,
          picture: updatedPicture,
          req_status: "Accepted",
        })
      );
    }

    // Always update equipment status
    tasks.push(
      equipmentData.update({
        eqp_status: "Needs Maintenance",
      })
    );

    // Create new intervention
    tasks.push(
      intervention.create({
        report,
        technician_id,
        intv_status,
        deadline,
        intervention_type,
        request_id: reqData.id,
      })
    );

    // Execute all tasks
    const results = await Promise.all(tasks);
    
    // Get the newly created intervention from the results
    // It's the last item in the results array if not a new request, otherwise the second item
    const newIntervention = isNewRequest ? results[1] : results[2];

    // Send the response immediately
    res.status(201).json({
      message: isNewRequest ? 
        "Request and intervention created successfully." : 
        "Intervention created and request updated successfully.",
      intervention: newIntervention,
      request: reqData
    });

    // Background tasks (send notifications and emails)
    Promise.all([
      user.findByPk(technician_id, {
        attributes: ['id', 'email', 'full_name']
      }),

      createNotification({
        recipientId: reqData.requester.id,
        message: `✅ Your maintenance request "${reqData.title}" has been ${isNewRequest ? 'created' : 'accepted'} and assigned to a technician.`,
        type: "Success",
        requestId: reqData.id,
      })
    ])
    .then(([technician]) => {
      if (technician) {
        return Promise.all([
          createNotification({
            recipientId: technician.id,
            message: `🔧 New task assigned: "${reqData.title}" in ${reqData.localisation}. Deadline: ${deadline ? new Date(deadline).toLocaleDateString() : "Not specified"}.`,
            type: "Info",
            requestId: reqData.id,
            interventionId: newIntervention.id
          }),

          // Email to requester
          reqData.requester?.email
            ? sendEmail(
                reqData.requester.email,
                `Your Maintenance Request Has Been ${isNewRequest ? 'Created' : 'Accepted'}`,
                  ` <!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Request Accepted</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #4a5568; background-color: #f7fafc;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 20px auto;">
    <tr>
      <td style="padding: 0;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
          <!-- Header -->
          <tr>
            <td style="padding: 30px 20px; text-align: center; background-color: #0D57AB; border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: white; font-size: 28px; text-shadow: 0 1px 2px rgba(0,0,0,0.1); font-weight: 600;">Request Accepted</h1>
            </td>
          </tr>
          
          <!-- Content area -->
          <tr>
            <td style="padding: 40px 30px; background-color: white; border-radius: 0 0 12px 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td>
                    <!-- Greeting -->
                    <h2 style="margin: 0 0 20px 0; color: #2d3748; font-size: 22px; font-weight: 600;">Hello Mr. ${reqData.requester.full_name},</h2>
                    
                    <!-- Main message -->
                    <p style="margin: 0 0 18px 0; line-height: 1.6; color: #4a5568; font-size: 16px;">
                      We're pleased to inform you that your maintenance request titled <strong style="color: #2d3748;">"${reqData.title}"</strong> has been reviewed and accepted by our team.
                    </p>
                    
                    <!-- Status update -->
                    <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; border-left: 4px solid #0D57AB; margin: 25px 0;">
                      <p style="margin: 0; color: #0D57AB; font-weight: 500; font-size: 15px;">
                        ✓ An intervention has been created and assigned to a technician.
                      </p>
                    </div>
                    
                    <!-- Closing -->
                    <p style="margin: 25px 0 8px 0; line-height: 1.6; color: #4a5568; font-size: 16px;">
                      Thank you for your collaboration.
                    </p>
                    
                    <p style="margin: 0; color: #718096; font-size: 15px; font-weight: 500;">
                      — Maintenance Team
                    </p>
                    
                    <!-- Action button -->
                    <div style="padding: 30px 0 10px 0; text-align: center;">
                      <a href="https://esi-flow.vercel.app/" style="display: inline-block; background-color: #0D57AB; color: white; text-decoration: none; padding: 14px 35px; border-radius: 8px; font-weight: 500; box-shadow: 0 4px 15px rgba(0,0,0,0.08); font-size: 15px;">
                        View Status
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
              `
              )
            : Promise.resolve(),

          // Email to technician
          technician?.email
            ? sendEmail(
                technician.email,
                  `New Task Assigned: Maintenance Intervention ${reqData.title}`,
                  `
              <!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Task Assignment</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #4a5568; background-color: #f7fafc;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 20px auto;">
    <tr>
      <td style="padding: 0;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
          <!-- Header -->
          <tr>
            <td style="padding: 30px 20px; text-align: center; background-color: #0D57AB; border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: white; font-size: 28px; text-shadow: 0 1px 2px rgba(0,0,0,0.1); font-weight: 600;">New Task Assignment</h1>
            </td>
          </tr>
          
          <!-- Content area -->
          <tr>
            <td style="padding: 40px 30px; background-color: white; border-radius: 0 0 12px 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td>
                    <!-- Greeting -->
                    <h2 style="margin: 0 0 20px 0; color: #2d3748; font-size: 22px; font-weight: 600;">Dear Mr. ${technician.full_name},</h2>
                    
                    <!-- Main message -->
                    <p style="margin: 0 0 25px 0; line-height: 1.6; color: #4a5568; font-size: 16px;">
                      You have been assigned a new maintenance task from a user request.
                    </p>
                    
                    <!-- Task details -->
                    <div style="background-color: #f8fafc; padding: 25px; border-radius: 10px; border-left: 4px solid #0D57AB; margin: 25px 0;">
                      <!-- Task Title -->
                      <div style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                        <span style="font-weight: 600; color: #718096; display: inline-block; width: 80px; font-size: 14px;">Task:</span>
                        <span style="font-weight: 500; color: #2d3748; font-size: 15px;">${reqData.title}</span>
                      </div>
                      
                      <!-- Location -->
                      <div style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                        <span style="font-weight: 600; color: #718096; display: inline-block; width: 80px; font-size: 14px;">Location:</span>
                        <span style="font-weight: 500; color: #2d3748; font-size: 15px;">${reqData.localisation}</span>
                      </div>
                      
                      <!-- Deadline -->
                      <div style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                        <span style="font-weight: 600; color: #718096; display: inline-block; width: 80px; font-size: 14px;">Deadline:</span>
                        <span style="font-weight: 500; color: #2d3748; font-size: 15px;">${deadline ? new Date(deadline).toLocaleDateString() : "Not specified"}</span>
                      </div>
                      
                      <!-- Status -->
                      <div style="padding: 8px 0;">
                        <span style="font-weight: 600; color: #718096; display: inline-block; width: 80px; font-size: 14px;">Status:</span>
                        <span style="font-weight: 600; padding: 4px 12px; border-radius: 15px; font-size: 13px; display: inline-block; background-color: #dbeafe; color: #0D57AB; text-transform: uppercase; letter-spacing: 0.5px;">${intv_status}</span>
                      </div>
                    </div>
                    
                    <!-- Instructions -->
                    <p style="margin: 25px 0 8px 0; line-height: 1.6; color: #4a5568; font-size: 16px;">
                      Please log in to your dashboard to see more details.
                    </p>
                    
                    <p style="margin: 0; color: #718096; font-size: 15px; font-weight: 500;">
                      — Maintenance Team
                    </p>
                    
                    <!-- Action button -->
                    <div style="padding: 30px 0 10px 0; text-align: center;">
                      <a href="https://esi-flow.vercel.app/" style="display: inline-block; background-color: #0D57AB; color: white; text-decoration: none; padding: 14px 35px; border-radius: 8px; font-weight: 500; box-shadow: 0 4px 15px rgba(0,0,0,0.08); font-size: 15px;">
                        Access Dashboard
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
