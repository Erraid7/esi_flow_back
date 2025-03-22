const { equipment } = require("../models");

// Create Equipment
exports.createEquipment = async (req, res) => {
  try {
    const newEquipment = await equipment.create(req.body);
    res.status(201).json(newEquipment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get All Equipment
exports.getAllEquipment = async (req, res) => {
  try {
    const equipments = await equipment.findAll();
    res.json(equipments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Equipment by ID
exports.getEquipmentById = async (req, res) => {
  try {
    const equipmentData = await equipment.findByPk(req.params.id);
    equipmentData ? res.json(equipmentData) : res.status(404).json({ message: "Equipment not found" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update Equipment
exports.updateEquipment = async (req, res) => {
  try {
    const updated = await equipment.update(req.body, { where: { id: req.params.id } });
    updated[0] ? res.json({ message: "Equipment updated" }) : res.status(404).json({ message: "Equipment not found" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete Equipment
exports.deleteEquipment = async (req, res) => {
  try {
    const deleted = await equipment.destroy({ where: { id: req.params.id } });
    deleted ? res.json({ message: "Equipment deleted" }) : res.status(404).json({ message: "Equipment not found" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
