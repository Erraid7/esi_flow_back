const { request, user, equipment } = require("../models");
const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinaryConfig = require("../config/cloudinary");
const sendEmail = require("../middlewares/emailService"); // Import email middleware

// Create a Request
exports.createRequest = async (req, res) => {
  try {
    // Extract requester ID from JWT (assuming it's stored in req.user.id)
    // const requesterId = req.user.id;
    const requesterId = 1;

    // Validate and extract fields from the request body
    const {
      equipment_id,
      title,
      description,
      localisation,
      priority,
      picture,
    } = req.body;

    if (!equipment_id) {
      return res.status(400).json({ message: "Equipment ID is required" });
    }
    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }
    if (!description) {
      return res.status(400).json({ message: "Description is required" });
    }
    if (!localisation) {
      return res.status(400).json({ message: "Localisation is required" });
    }
    if (!priority || !["low", "medium", "high"].includes(priority)) {
      return res
        .status(400)
        .json({ message: "Valid priority (low, medium, high) is required" });
    }
    if (!picture) {
      return res.status(400).json({ message: "Picture is required" });
    }
    // Create the new request
    const newRequest = await request.create({
      requester_id: requesterId,
      equipment_id,
      title,
      description,
      localisation,
      priority,
      picture,
    });

    res.status(201).json(newRequest);
  } catch (error) {
    console.error("Error creating request:", error); // Log full error
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

// Route to render the request page
exports.getRequestPage = (req, res) => {
  res.render("test"); // Ensure you have a 'requestPage' view in your views folder
};
// Get All Requests
exports.getAllRequests = async (req, res) => {
  try {
    const requests = await request.findAll({
      include: [
        {
          model: user,
          as: "requester", // Alias must match the model association
          attributes: ["id", "full_name", "email", "role"],
        },
        {
          model: equipment,
          as: "equipment",
          attributes: ["id", "type", "category", "localisation"],
        },
      ],
    });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Request by ID
exports.getRequestById = async (req, res) => {
  try {
    const requestData = await request.findByPk(req.params.id);
    requestData
      ? res.json(requestData)
      : res.status(404).json({ message: "Request not found" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update Request
exports.updateRequest = async (req, res) => {
  try {
    const updated = await request.update(req.body, {
      where: { id: req.params.id },
    });
    updated[0]
      ? res.json({ message: "Request updated" })
      : res.status(404).json({ message: "Request not found" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete Request
exports.deleteRequest = async (req, res) => {
  try {
    const deleted = await request.destroy({ where: { id: req.params.id } });
    deleted
      ? res.json({ message: "Request deleted" })
      : res.status(404).json({ message: "Request not found" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const imageUrl = req.file.path; // Cloudinary returns the image URL

    res.json({ message: "Image uploaded successfully", imageUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Image upload failed" });
  }
};
