const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = require('./user')(sequelize, DataTypes);
const Equipment = require('./equipment')(sequelize, DataTypes);
const Intervention = require('./intervention')(sequelize, DataTypes);
const Notification = require('./notification')(sequelize, DataTypes);

// 🔹 One-to-Many: A User (Technician) can have multiple Interventions
User.hasMany(Intervention, { foreignKey: 'technicienId', onDelete: 'CASCADE' });
Intervention.belongsTo(User, { foreignKey: 'technicienId' });

// 🔹 One-to-Many: An Equipment can have multiple Interventions
Equipment.hasMany(Intervention, { foreignKey: 'equipementId', onDelete: 'CASCADE' });
Intervention.belongsTo(Equipment, { foreignKey: 'equipementId' });

// 🔹 One-to-Many: A User (Any) can receive multiple Notifications
User.hasMany(Notification, { foreignKey: 'utilisateurId', onDelete: 'CASCADE' });
Notification.belongsTo(User, { foreignKey: 'utilisateurId' });

module.exports = {
  sequelize,
  User,
  Equipment,
  Intervention,
  Notification
};
