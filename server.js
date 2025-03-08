const express = require('express');
const { sequelize } = require('./models'); // Import Sequelize instance

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// Modify your sync code in server.js
sequelize.sync({ force: true }) // Use force: true for initial setup
  .then(() => console.log("✅ Database synced successfully"))
  .catch(err => console.error("❌ Database sync failed:", err));

// Routes
const userRoutes = require('./routes/users');
const equipmentRoutes = require('./routes/equipment');
const interventionRoutes = require('./routes/interventions');

app.use('/api/users', userRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/interventions', interventionRoutes);

// Only listen when running as main script
if (require.main === module) {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  }

module.exports = app;
// The code above imports the Sequelize instance from models/index.js and uses it to sync the database. The application then sets up routes for users, equipment, and interventions using the respective route files. Finally, the application listens on the specified port and logs a message to the console when the server is running.