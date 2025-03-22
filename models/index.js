const { Sequelize, DataTypes } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    logging: false,
  }
);

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import models
db.user = require("./user")(sequelize, DataTypes);
db.request = require("./request")(sequelize, DataTypes);
db.equipment = require("./equipment")(sequelize, DataTypes);
db.notification = require("./notification")(sequelize, DataTypes);
db.intervention = require("./intervention")(sequelize, DataTypes);

// Model relationships (associations)
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;
