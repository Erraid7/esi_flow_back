const express = require('express');
const { Equipment } = require('../models');
const router = express.Router();

// 🔹 Get all equipment
router.get('/', async (req, res) => {
  try {
    const equipment = await Equipment.findAll();
    res.json(equipment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔹 Add new equipment
router.post('/', async (req, res) => {
  try {
    const equipment = await Equipment.create(req.body);
    res.status(201).json(equipment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 🔹 Update equipment details
router.put('/:id', async (req, res) => {
  try {
    const equipment = await Equipment.findByPk(req.params.id);
    if (!equipment) return res.status(404).json({ error: "Equipment not found" });

    await equipment.update(req.body);
    res.json(equipment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 🔹 Delete an equipment
router.delete('/:id', async (req, res) => {
  try {
    const equipment = await Equipment.findByPk(req.params.id);
    if (!equipment) return res.status(404).json({ error: "Equipment not found" });

    await equipment.destroy();
    res.json({ message: "Equipment deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
