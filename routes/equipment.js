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

module.exports = router;
