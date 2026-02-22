import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// POST /api/auth/register
export const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        console.log("Register attempt:", { username, email });

        if (!username || !email || !password)
            return res.status(400).json({ message: "All fields are required" });

        const existing = await User.findOne({ $or: [{ email }, { username }] });
        if (existing) {
            const field = existing.email === email ? "Email" : "Username";
            return res.status(409).json({ message: `${field} already registered` });
        }

        const hashed = await bcrypt.hash(password, 10);
        const user = await User.create({ username, email, password: hashed });

        console.log("✅ User registered:", user._id);
        res.status(201).json({ message: "User registered successfully", userId: user._id });
    } catch (err) {
        console.error("❌ Register error:", err.message, err.code);

        // MongoDB duplicate key (race condition fallback)
        if (err.code === 11000) {
            const field = Object.keys(err.keyPattern || {})[0] || "field";
            return res.status(409).json({ message: `${field} already exists` });
        }

        res.status(500).json({ message: "Server error", error: err.message });
    }
};

// POST /api/auth/login
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password)
            return res.status(400).json({ message: "Email and password required" });

        const user = await User.findOne({ email });
        if (!user)
            return res.status(401).json({ message: "Invalid credentials" });

        const match = await bcrypt.compare(password, user.password);
        if (!match)
            return res.status(401).json({ message: "Invalid credentials" });

        const token = jwt.sign(
            { id: user._id, isAdmin: user.isAdmin },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res
            .cookie("token", token, {
                httpOnly: true,
                maxAge: 7 * 24 * 60 * 60 * 1000,
                sameSite: "lax",
            })
            .json({
                message: "Login successful",
                user: { id: user._id, username: user.username, email: user.email, isAdmin: user.isAdmin },
                token,
            });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};
