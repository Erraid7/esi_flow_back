const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { requireAuth,requireRole} = require("../middlewares/authmiddlware");

// User-related routes
router.get("/" ,userController.getAllUsers);
router.get("/:id",userController.getUserById);
router.delete("/:id" ,userController.deleteUser);


module.exports = router;
 