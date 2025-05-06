require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const {checkUser,requireAuth,requireRole}= require('./middlewares/authmiddlware');
const app = express();
const path = require("path");
const cors = require('cors');
require("./cornjobs/autoMaintenanceJob"); // Import the cron job

// Install cors if you haven't already: npm install cors
app.use(cors({
  origin: 'http://localhost:3000', // Your frontend URL
  credentials: true // Important for cookies 
}));


// Set EJS as the template engine
app.set("view engine", "ejs");

// Set the directory where EJS views are located
app.set("views", path.join(__dirname, "views"));

// Serve static files (CSS, images, etc.)
app.use(express.static(path.join(__dirname, "public")));


app.use(express.json());
app.use(cookieParser());
 
app.use(checkUser); 

// Import and use routes
app.use("/users", require("./routes/userRoutes"));
app.use("/requests", require("./routes/requestRoutes"));
app.use("/equipments", require("./routes/equipmentRoutes"));
app.use("/interventions", require("./routes/interventionRoutes"));
app.use("/notifications", require("./routes/notificationRoutes"));
app.use('/auth', require('./routes/authRoutes'));

//get the test.esj file
app.get('/', (req, res) => { 
    res.send('welcome back to out website');
});
app.get("/userss", (req, res) => {
    res.render("user"); // Ensure you have a 'test' view in your views folder
});

app.get("/dashboard", requireAuth, requireRole(["admin"]) , (req, res) => {
  res.json({ message: 'Welcome admin!' });
})

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
