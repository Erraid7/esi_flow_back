const express = require("express");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/authuser.js/authUsers");
const { requireAuth, checkUser } = require("./middleware/midwarauth");
require("dotenv").config();

const app = express();

app.use(express.json());
app.use(cookieParser());

// Middleware to check user before each request
app.use(checkUser);

// Authentication routes
app.use("/auth", authRoutes);

// 🔹 Protected Route Example (Only Authenticated Users Can Access)
app.get("/protected", requireAuth, (req, res) => {
  res.json({ message: "Welcome! You have access.", user: req.user });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

console.log("server connected to db");

