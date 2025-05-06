const { user } = require("../models");
const jwt = require("jsonwebtoken"); // Ensure this line is present
require("dotenv").config();


// Get All Users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await user.findAll();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
};}

// Get User by ID
exports.getUserById = async (req, res) => {
  try {
    const userData = await user.findByPk(req.params.id);
    userData ? res.json(userData) : res.status(404).json({ message: "User not found" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Delete User
exports.deleteUser = async (req, res) => {
  try {
    const deleted = await user.destroy({ where: { id: req.params.id } });
    deleted ? res.json({ message: "User deleted" }) : res.status(404).json({ message: "User not found" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
