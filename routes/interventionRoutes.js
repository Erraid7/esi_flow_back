const express = require("express");
const router = express.Router();
const interventionController = require("../controllers/interventionController");

// Intervention-related routes
router.post("/", interventionController.createIntervention);
router.get("/", interventionController.getAllInterventions);
router.get("/:id", interventionController.getInterventionById);
router.put("/:id", interventionController.updateIntervention);
router.delete("/:id", interventionController.deleteIntervention);

module.exports = router;
// Compare this snippet from controllers/notificationController.js: