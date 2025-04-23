const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { user } = require('../models');
const { requireAuth,requireRole} = require("../middlewares/authmiddlware");

// User-related routes
router.post("/"  , userController.createUser);
router.get("/" ,userController.getAllUsers);
router.get("/:id",userController.getUserById);
router.put("/:id",userController.updateUser);
router.delete("/:id" ,userController.deleteUser);


module.exports = router;
 