const express = require("express");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/authuser.js/authUsers");
const { requireAuth, checkUser,requireRole} = require("./middleware/midwarauth");
require("dotenv").config();

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use("/users", require("./routes/users"));

// Middleware to check user before each request
app.use(checkUser);

// Authentication routes
app.use("/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to the home page");
});



// 🔹 Protected Route Example (Only Authenticated Users Can Access)
app.get("/protected",requireAuth, requireRole(["admin"]), (req, res) => {
  res.json({ message: "Welcome! You have access.", user: req.user });
});


// Admin-Only Route Example
app.get("/admin",requireAuth, requireRole(["admin"]),(req, res) => {
  res.send("Admin Page");
});
//add  a route for technician
app.get("/technician",requireAuth, requireRole(["technician"]),(req, res) => {
  res.send("Technician Page");
});


//add a route for user
app.get("/user",requireAuth, requireRole(["user"]),(req, res) => {
  res.send("User Page");
});


//for running the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

console.log("server connected to db");

