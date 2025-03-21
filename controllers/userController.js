const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { user } = require("../models");

// Register User
exports.registerUser = async (req, res) => {
  try {
    const { full_name, email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await user.create({ full_name, email, password: hashedPassword, role });
    res.status(201).json({ message: "User registered successfully", user: newUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Login User
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const existingUser = await user.findOne({ where: { email } });

    if (!existingUser || !(await bcrypt.compare(password, existingUser.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: existingUser.id, role: existingUser.role }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get User Profile
exports.getUserProfile = async (req, res) => {
  try {
    const userData = await user.findByPk(req.user.id, { attributes: { exclude: ["password"] } });
    res.json(userData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get All Users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await user.findAll({ attributes: { exclude: ["password"] } });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
