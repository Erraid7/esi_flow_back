const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// User-related routes
router.post("/register", userController.registerUser);
router.post("/login", userController.loginUser);
router.get("/profile", userController.getUserProfile);
router.get("/", userController.getAllUsers);

module.exports = router;

