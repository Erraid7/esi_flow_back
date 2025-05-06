const { equipment } = require("../models");



exports.createEquipment = async (req, res) => {
  try {
    const pictureUrl = req.file?.path;
    // Parse seasonal_maintenance_months safely
    let seasonalMaintenanceMonths = null;
    if (req.body.seasonal_maintenance_months) {
      try {
        const parsed = JSON.parse(req.body.seasonal_maintenance_months);
        seasonalMaintenanceMonths = Array.isArray(parsed)
          ? parsed.map(Number)
          : [Number(parsed)];
      } catch (err) {
        // Handle bad format
        seasonalMaintenanceMonths = [Number(req.body.seasonal_maintenance_months)];
      }
    }

    // Parse maintenance_history if provided
    let maintenanceHistory = null;
    if (req.body.maintenance_history) {
      try {
        const parsed = JSON.parse(req.body.maintenance_history);
        maintenanceHistory = Array.isArray(parsed)
          ? parsed.map(Number)
          : [Number(parsed)];
      } catch (err) {
        maintenanceHistory = [];
      }
    }

    // Parse automatic maintenance interval
    const automaticMaintenanceInterval = req.body.automatic_maintenance_interval
      ? Number(req.body.automatic_maintenance_interval)
      : null;
    // Create the equipment
    const newEquipment = await equipment.create({
      ...req.body,
      picture: pictureUrl,
      automatic_maintenance_interval: automaticMaintenanceInterval,
      seasonal_maintenance_months: seasonalMaintenanceMonths,
      maintenance_history: maintenanceHistory
    });

    res.status(201).json(newEquipment);
  } catch (error) {
    console.error("Error creating equipment:", error);
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
    equipmentData
      ? res.json(equipmentData)
      : res.status(404).json({ message: "Equipment not found" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update Equipment
exports.updateEquipment = async (req, res) => {
  try {
    const updated = await equipment.update(req.body, {
      where: { id: req.params.id },
    });
    updated[0]
      ? res.json({ message: "Equipment updated" })
      : res.status(404).json({ message: "Equipment not found" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete Equipment
exports.deleteEquipment = async (req, res) => {
  try {
    const deleted = await equipment.destroy({ where: { id: req.params.id } });
    deleted
      ? res.json({ message: "Equipment deleted" })
      : res.status(404).json({ message: "Equipment not found" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
