const express = require("express");
const router = express.Router();
const requestController = require("../controllers/requestController");

// Request-related routes
router.post("/", requestController.createRequest);
router.get("/", requestController.getAllRequests);
router.get("/:id", requestController.getRequestById);
router.put("/:id", requestController.updateRequest);
router.delete("/:id", requestController.deleteRequest);

module.exports = router;
// Compare this snippet from routes/equipmentRoutes.js: