require("dotenv").config();
const express = require("express");
const app = express();

app.use(express.json());

// Import and use routes
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/requests", require("./routes/requestRoutes"));
app.use("/api/equipments", require("./routes/equipmentRoutes"));
app.use("/api/interventions", require("./routes/interventionRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
