'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define("User", {
    nom: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    mot_de_passe: { type: DataTypes.STRING, allowNull: false },
    role: {
      type: DataTypes.ENUM('admin', 'technician', 'user'),
      allowNull: false
    }
  });

  return User;
};
// The code above defines a User model with the following fields: nom, email, mot_de_passe, and role. The nom, email, mot_de_passe fields are required and the email field must be unique. The role field is an ENUM with the values Admin, Technicien, and Personnel. The model is then returned to be used in the application.