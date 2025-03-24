const { request, user, equipment } = require("../models");

// Create a Request
exports.createRequest = async (req, res) => {
  try {
    const newRequest = await request.create(req.body);
    res.status(201).json(newRequest);
  } catch (error) {
    res.status(500).json({ error: error.message });
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
          attributes: ["id", "full_name", "email", "role"]
        },
        {
          model: equipment,
          as: "equipment",
          attributes: ["id", "type", "category", "localisation"]
        }
      ]
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
    requestData ? res.json(requestData) : res.status(404).json({ message: "Request not found" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update Request
exports.updateRequest = async (req, res) => {
  try {
    const updated = await request.update(req.body, { where: { id: req.params.id } });
    updated[0] ? res.json({ message: "Request updated" }) : res.status(404).json({ message: "Request not found" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete Request
exports.deleteRequest = async (req, res) => {
  try {
    const deleted = await request.destroy({ where: { id: req.params.id } });
    deleted ? res.json({ message: "Request deleted" }) : res.status(404).json({ message: "Request not found" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
