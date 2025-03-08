'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  const Intervention = sequelize.define("Intervention", {
    equipementId: { type: DataTypes.INTEGER, allowNull: false },
    technicienId: { type: DataTypes.INTEGER, allowNull: false },
    statut: { type: DataTypes.ENUM("En attente", "En cours", "Terminé"), allowNull: false, defaultValue: "En attente" },
    priorite: { type: DataTypes.ENUM("Faible", "Moyenne", "Haute", "Critique"), allowNull: false },
    date_creation: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    date_cloture: { type: DataTypes.DATE, allowNull: true },
    rapport: { type: DataTypes.TEXT, allowNull: true },
  });

  return Intervention;
};
// The code above defines an Intervention model with the following fields: equipementId, technicienId, statut, priorite, date_creation, date_cloture, and rapport. The equipementId and technicienId fields are required. The statut field is an ENUM with the values En attente, En cours, and Terminé. The priorite field is an ENUM with the values Faible, Moyenne, Haute, and Critique. The date_creation field has a default value of the current date and time. The date_cloture and rapport fields are optional. The model is then returned to be used in the application.