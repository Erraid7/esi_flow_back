const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

const { requireAuth, requireRole } = require("../middlewares/authmiddlware");

const SECRET_KEY = process.env.JWT_SECRET || "cook123";



// Admin-Only: Create User (Technician/Simple User)
router.post("/register", authController.registerUser);

// Login Route
router.post("/login", authController.loginUser);

// Logout Route (Clears the JWT Cookie)
router.post("/logout", authController.logoutUser);
//add router for edit user
router.put("/edit-user/:id", authController.editUser);

// Route for modify password
router.put("/modify-password", authController.modifyPassword);

// Admin-Only Route Example
router.get("/admin", requireAuth, requireRole(["admin"]), (req, res) => {
  res.send("Admin Page");
});


router.post("/forgot-password", authController.forgotPassword)
router.post("/verify-reset-code", authController.verifyResetCode)
router.post("/resend-reset-code", authController.resendResetCode)
router.post("/reset-password", authController.resetPassword)



module.exports = router;