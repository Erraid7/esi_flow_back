const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { user } = require('../models');
const { requireAuth,requireRole} = require("../middlewares/authmiddlware");

// User-related routes
router.post("/" ,  requireAuth, requireRole(["admin"]) , userController.createUser);
router.get("/" , requireAuth, requireRole(["admin"]) ,userController.getAllUsers);
router.get("/:id", requireAuth, requireRole(["admin"]) ,userController.getUserById);
router.put("/:id",  requireAuth, requireRole(["admin"]),userController.updateUser);
router.delete("/:id",  requireAuth, requireRole(["admin"]) ,userController.deleteUser);

module.exports = router;