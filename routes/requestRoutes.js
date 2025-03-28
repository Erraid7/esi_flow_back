const express = require("express");
const router = express.Router();
const requestController = require("../controllers/requestController");
const upload = require("../middlewares/upload");
const sendEmail = require("../middlewares/emailService"); 

// Request-related routes
router.get("/test", requestController.getRequestPage);
router.post("/",sendEmail, requestController.createRequest);
router.get("/", requestController.getAllRequests);
router.get("/:id", requestController.getRequestById);
router.put("/:id", requestController.updateRequest);
router.delete("/:id", requestController.deleteRequest);
//add form route get only 

//for uploading imges
router.post("/upload", upload.single("image"), requestController.uploadImage);


module.exports = router;
// Compare this snippet from routes/equipmentRoutes.js: