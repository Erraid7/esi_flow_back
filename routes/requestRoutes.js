const express = require("express");
const router = express.Router();
const requestController = require("../controllers/requestController");
const upload = require("../middlewares/upload");


// Request-related routes
router.post("/", requestController.createRequest);
router.get("/", requestController.getAllRequests);
router.get("/:id", requestController.getRequestById);
router.get("/user/:userId", requestController.getRequestsByUserId); // New route to get requests by user ID
router.put("/:id", requestController.updateRequest);
router.delete("/:id", requestController.deleteRequest);// Trigger periodic maintenance check
router.post("/auto/periodic", requestController.handlePeriodicRequests);

// Trigger seasonal maintenance check
router.post("/auto/seasonal", requestController.handleSeasonalRequests);
//add form route get only 

//for uploading imges
router.post("/upload", upload.single("image"), requestController.uploadImage);
 

module.exports = router;
// Compare this snippet from routes/equipmentRoutes.js: