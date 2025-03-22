const { user } = require("../models");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { requireAuth, requireRole } = require("../middlewares/authmiddlware");
const registerPage = (req, res) => {
    res.send("Register Page");
};

const registerUser = async (req, res) => {
    const {  full_name, email, password, phone, bio, role,profession } = req.body;

    if (!full_name || !email || !password || !phone || !bio || !role || !profession) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        const existingUser = await user.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await user.create({
            full_name,
            email,
            password: hashedPassword,
            phone,
            bio,
            role,
            profession,
        });

        res.status(201).json({ message: "User created successfully", user: newUser });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const loginPage = (req, res) => {
    res.send("Login Page");
};

const loginUser = async (req, res) => {
    const { email, phone, password } = req.body;

    if ((!email && !phone) || !password) {
        return res.status(400).json({ message: "Email or phone and password are required" });
    }

    try {
        const User = await user.findOne({ where: { [email ? 'email' : 'phone']: email || phone } });
        if (!user) {
            return res.status(400).json({ message: "Invalid email/phone or password" });
        }

        const isMatch = await bcrypt.compare(password, User.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email/phone or password" });
        }

        const token = jwt.sign({ id: User.id, role: User.role }, process.env.JWT_SECRET, {
            expiresIn: "2h",
        });

        res.cookie("jwt", token, {
            httpOnly: true,
            maxAge: 2 * 60 * 60 * 1000,
        });

        res.status(200).json({ message: "Login successful", role: User.role });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const logoutUser = (req, res) => {
    res.cookie("jwt", "", { maxAge: 1 });
    res.status(200).json({ message: "Logged out successfully" });
};

const modifyPassword = async (req, res) => {
    const { email, phone, password } = req.body;

    if ((!email && !phone) || !password) {
        return res.status(400).json({ message: "Email or phone and password are required" });
    }

    try {
        const User = await user.findOne({ where: { [email ? 'email' : 'phone']: email || phone } });
        if (!User) {
            return res.status(400).json({ message: "Invalid email/phone or password" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await User.update({ password: hashedPassword });
        res.status(200).json({ message: "Password modified successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = {
    registerPage,
    registerUser,
    loginPage,
    loginUser,
    logoutUser,
    modifyPassword,
};
