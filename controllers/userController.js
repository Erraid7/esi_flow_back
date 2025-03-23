const { user } = require("../models");
const jwt = require("jsonwebtoken"); // Ensure this line is present
require("dotenv").config();
// Create a New User
exports.createUser = async (req, res) => {
  try {
    const newUser = await user.create(req.body);
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get All Users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await user.findAll();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get User by ID
exports.getUserById = async (req, res) => {
  try {
    const userData = await user.findByPk(req.params.id);
    userData ? res.json(userData) : res.status(404).json({ message: "User not found" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update User
exports.updateUser = async (req, res) => {
  try {
    const updated = await user.update(req.body, { where: { id: req.params.id } });
    updated[0] ? res.json({ message: "User updated" }) : res.status(404).json({ message: "User not found" });
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
