const express = require("express");
const router = express.Router();
const equipmentController = require("../controllers/equipmentController");
const upload = require("../middlewares/upload");

// Equipment-related routes
router.post("/",   upload.single("picture")  , equipmentController.createEquipment);
router.get("/", equipmentController.getAllEquipment);
router.get("/:id", equipmentController.getEquipmentById);
router.put("/:id", equipmentController.updateEquipment);
router.delete("/:id", equipmentController.deleteEquipment);

module.exports = router;
// Compare this snippet from controllers/equipmentController.js: