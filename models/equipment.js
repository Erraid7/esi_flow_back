'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  const Equipment = sequelize.define("Equipment", {
    nom: { type: DataTypes.STRING, allowNull: false },
    type: { type: DataTypes.STRING, allowNull: false },
    localisation: { type: DataTypes.STRING, allowNull: false },
    etat: { type: DataTypes.ENUM("Fonctionnel", "En panne", "En maintenance"), allowNull: false, defaultValue: "Fonctionnel" },
  });

  return Equipment;
};
// The code above defines an Equipment model with the following fields: nom, type, localisation, and etat. The nom, type, localisation fields are required. The etat field is an ENUM with the values Fonctionnel, En panne, and En maintenance. The etat field has a default value of Fonctionnel. The model is then returned to be used in the application.