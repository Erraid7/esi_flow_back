const express = require("express");
const router = express.Router();
const equipmentController = require("../controllers/authController");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { requireAuth, requireRole } = require("../middlewares/authmiddlware");

const SECRET_KEY = process.env.JWT_SECRET || "cook123";

// Register Route (For All Users)
router.get("/register", equipmentController.registerPage);

// Admin-Only: Create User (Technician/Simple User)
router.post("/register", equipmentController.registerUser);

// Login Route (For All Users)
router.get("/login", equipmentController.loginPage);

// Login Route
router.post("/login", equipmentController.loginUser);

// Logout Route (Clears the JWT Cookie)
router.post("/logout", equipmentController.logoutUser);

// Route for modify password
router.put("/modify-password", equipmentController.modifyPassword);

// 🔹 Protected Route Example (Only Authenticated Users Can Access)
router.get("/protected",requireAuth, requireRole(["admin"]), (req, res) => {
    res.json({ message: "Welcome! You have access.", user: req.user });
  });
  
  
  // Admin-Only Route Example
  router.get("/admin",requireAuth, requireRole(["admin"]),(req, res) => {
    res.send("Admin Page");
  });
  //add  a route for technician
  router.get("/technician",requireAuth, requireRole(["technician"]),(req, res) => {
    res.send("Technician Page");
  });
  
  
  //add a route for user
  router.get("/user",requireAuth, requireRole(["user"]),(req, res) => {
    res.send("User Page");
  });


module.exports = router