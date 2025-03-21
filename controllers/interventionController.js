const { intervention } = require("../models");

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
