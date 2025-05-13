const express = require("express");
const router = express.Router();
const interventionController = require("../controllers/interventionController");
const upload = require("../middlewares/upload");
// Intervention-related routes
router.post("/", interventionController.createIntervention);
router.get("/", interventionController.getAllInterventions);
router.get("/:id", interventionController.getInterventionById);
router.get("/technician/:technicianId", interventionController.getInterventionsByTechnicianId); // New route to get interventions by technician ID
router.put("/:id", interventionController.updateIntervention);
router.delete("/:id", interventionController.deleteIntervention);
router.post("/from-request/:requestId", upload.single("image"), interventionController.createInterventionFromRequest); // New route to create intervention from request

module.exports = router;
// Compare this snippet from controllers/notificationController.js: