const express = require('express');
const { User } = require('../models');
const { requireAuth, checkUser,requireRole} = require("../middleware/midwarauth");
const router = express.Router();


// 🔹 Get all users
router.get('/', requireAuth, requireRole(["admin"]),async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// 🔹 Update user details
router.put('/:id',requireAuth, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    await user.update(req.body);
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
 
// 🔹 Delete a user
router.delete('/:id', requireAuth, requireRole(["admin"]) ,  async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    await user.destroy();
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});



module.exports = router;
