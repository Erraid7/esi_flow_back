const express = require('express');
const { Intervention, User, Equipment } = require('../models');
const router = express.Router();

// 🔹 Get all interventions with Technician & Equipment details
router.get('/', async (req, res) => {
  try {
    const interventions = await Intervention.findAll({
      include: [User, Equipment]
    });
    res.json(interventions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔹 Create an intervention
router.post('/', async (req, res) => {
  try {
    const intervention = await Intervention.create(req.body);
    res.status(201).json(intervention);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 🔹 Update intervention status
router.put('/:id', async (req, res) => {
  try {
    const intervention = await Intervention.findByPk(req.params.id);
    if (!intervention) return res.status(404).json({ error: "Intervention not found" });

    await intervention.update(req.body);
    res.json(intervention);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
