require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const {checkUser}= require('./middlewares/authmiddlware');
const app = express();
const path = require("path");

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
app.get('/', (req, res) => { 
    res.send('Welcome to my project');
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
