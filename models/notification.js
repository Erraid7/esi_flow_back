'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define("Notification", {
    utilisateurId: { type: DataTypes.INTEGER, allowNull: false },
    message: { type: DataTypes.STRING, allowNull: false },
    type: { type: DataTypes.ENUM("Email", "SMS", "Interface"), allowNull: false },
    date_envoi: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  });

  return Notification;
};