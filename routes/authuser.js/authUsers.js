const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { User } = require("../../models");
require("dotenv").config();

const SECRET_KEY = process.env.JWT_SECRET || "cook123";

// Register Route (For All Users)
router.get("/register", async (req, res) => {
    res.send("Register Page");
}); 

// Admin-Only: Create User (Technician/Simple User)
router.post("/register", async (req, res) => {
  const { nom, email, mot_de_passe, phone, bio, role } = req.body;

  if (!nom || !email || !mot_de_passe || !phone || !bio ||!role) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    // Hash the password
    const hashedPassword = await bcrypt.hash(mot_de_passe, 10);
    // Create new user
    const newUser = await User.create({
      nom,
      email,
      mot_de_passe: hashedPassword,
      phone,
      bio,
      role,
    });
    res
      .status(201)
      .json({ message: "User created successfully", user: newUser });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Login Route (For All Users)
router.get("/login", async (req, res) => {
  res.send("Login Page");
});

// 🔹 Login Route
router.post("/login", async (req, res) => {
  const { email, phone, mot_de_passe } = req.body;

  if ((!email && !phone) || !mot_de_passe) {
    return res.status(400).json({ message: "Email or phone and password are required" });
  }

  try {
    const user = await User.findOne({ where: { [email ? 'email' : 'phone']: email || phone } });
    if (!user) {
      return res.status(400).json({ message: "Invalid email/phone or password" });
    }

    const isMatch = await bcrypt.compare(mot_de_passe, user.mot_de_passe);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email/phone or password" });
    }

    // Generate JWT
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "2h",
    });

    // Store JWT in cookie
    res.cookie("jwt", token, {
      httpOnly: true,
      maxAge: 2 * 60 * 60 * 1000, // 2 hours
    });

    res.status(200).json({ message: "Login successful", role: user.role });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});


// 🔹 Logout Route (Clears the JWT Cookie)
router.post("/logout", (req, res) => {
  res.cookie("jwt", "", { maxAge: 1 }); // Expire cookie immediately
  res.status(200).json({ message: "Logged out successfully" });
});
 //route for modidy password
router.put("/modify-password", async (req, res) => {
  const { email, phone, mot_de_passe } = req.body;

  if ((!email && !phone) || !mot_de_passe) {
    return res.status(400).json({ message: "Email or phone and password are required" });
  }

  try {
    const user = await User.findOne({ where: { [email ? 'email' : 'phone']: email || phone } });
    if (!user) {
      return res.status(400).json({ message: "Invalid email/phone or password" });
    }

    const hashedPassword = await bcrypt.hash(mot_de_passe, 10);
    await user.update({ mot_de_passe: hashedPassword });
    res.status(200).json({ message: "Password modified successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }});


module.exports = router;
