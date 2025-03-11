'use strict';
const { Model } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define("User", {
        nom: { type: DataTypes.STRING, allowNull: false },
        email: { type: DataTypes.STRING, allowNull: false, unique: true },
        mot_de_passe: { type: DataTypes.STRING, allowNull: false },
        phone: { 
            type: DataTypes.STRING, 
            allowNull: false, 
            unique: true, 
            validate: { 
                isNumeric: true, // Ensures only numbers
                len: [8, 15]     // Adjust length as needed
            }
        },
        bio: {
            type: DataTypes.TEXT, // Allows long text
            allowNull: true, // Optional field
        },
        role: {
            type: DataTypes.ENUM('admin', 'technician', 'user'),
            allowNull: false
        }
    });

    return User;
};
