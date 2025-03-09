'use strict';
const { Model } = require('sequelize');
const bcrypt = require('bcryptjs');

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
