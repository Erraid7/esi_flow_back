// models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    nom: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    mot_de_passe: { type: String, required: true },
    role: { type: String, enum: ['Admin', 'Technicien', 'Personnel'], required: true },
    date_inscription: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
