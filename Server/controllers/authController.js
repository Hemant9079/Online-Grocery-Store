import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
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

        const isProduction = process.env.NODE_ENV === "production";
        res
            .cookie("token", token, {
                httpOnly: true,
                maxAge: 7 * 24 * 60 * 60 * 1000,
                sameSite: isProduction ? "None" : "lax",
                secure: isProduction,
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

// POST /api/auth/forgot-password
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: "Email is required" });

        const user = await User.findOne({ email });
        // Always return same message so we don't leak whether an email is registered
        if (!user) {
            return res.json({ message: "If that email is registered, you will receive a reset link." });
        }

        const resetToken = jwt.sign(
            { id: user._id, purpose: "password-reset" },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
        const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

        // ── Check if email is properly configured ──
        const emailUser = process.env.EMAIL_USER;
        const emailPass = process.env.EMAIL_PASS;
        const isEmailConfigured =
            emailUser && emailPass &&
            emailPass !== "your_gmail_app_password" &&
            emailPass.trim() !== "";

        if (!isEmailConfigured) {
            // DEV fallback: print the reset link to the server console
            console.log("\n⚠️  EMAIL NOT CONFIGURED — Password reset link for", email, ":\n");
            console.log("👉 ", resetUrl, "\n");
            console.log("To enable real emails, set EMAIL_USER and a valid Gmail App");
            console.log("Password in Server/.env  (see README for instructions)\n");
            return res.json({ message: "If that email is registered, you will receive a reset link." });
        }

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: emailUser,
                pass: emailPass,
            },
        });

        // Verify credentials before attempting to send
        await transporter.verify();

        await transporter.sendMail({
            from: `"Fast Delivery Support" <${emailUser}>`,
            to: email,
            subject: "Password Reset Request — Fast Delivery",
            html: `
                <div style="font-family:Inter,sans-serif;max-width:480px;margin:auto;padding:24px;border:1px solid #e2e8f0;border-radius:12px;">
                    <h2 style="color:#16a34a;margin-top:0;">Reset Your Password</h2>
                    <p>Hello <strong>${user.username}</strong>,</p>
                    <p>You requested a password reset. Click the button below — the link expires in <strong>1 hour</strong>.</p>
                    <a href="${resetUrl}" style="display:inline-block;background:#16a34a;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0;">Reset Password</a>
                    <p style="color:#64748b;font-size:0.85rem;">If you didn't request this, you can safely ignore this email.</p>
                    <hr style="border:none;border-top:1px solid #e2e8f0;margin:16px 0;"/>
                    <p style="color:#94a3b8;font-size:0.78rem;">Fast Delivery · Online Grocery Store</p>
                </div>
            `,
        });

        res.json({ message: "If that email is registered, you will receive a reset link." });
    } catch (err) {
        console.error("Forgot password error:", err.message);
        // Surface a helpful message for common Gmail auth errors
        if (err.code === "EAUTH" || (err.message && err.message.includes("Invalid login"))) {
            return res.status(500).json({
                message: "Email service authentication failed. Please check your EMAIL_USER and EMAIL_PASS in the server .env file.",
            });
        }
        res.status(500).json({ message: "Failed to send reset email. Please try again later.", error: err.message });
    }
};

// POST /api/auth/reset-password
export const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        if (!token || !newPassword)
            return res.status(400).json({ message: "Token and new password are required" });

        if (newPassword.length < 6)
            return res.status(400).json({ message: "Password must be at least 6 characters" });

        // Decode first (without verifying) to get the user id
        const decoded = jwt.decode(token);
        if (!decoded || !decoded.id || decoded.purpose !== "password-reset")
            return res.status(400).json({ message: "Invalid reset token" });

        const user = await User.findById(decoded.id);
        if (!user) return res.status(400).json({ message: "User not found" });

        // Verify token signature + expiry
        jwt.verify(token, process.env.JWT_SECRET);

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.json({ message: "Password reset successfully! You can now log in." });
    } catch (err) {
        if (err.name === "TokenExpiredError")
            return res.status(400).json({ message: "Reset link has expired. Please request a new one." });
        if (err.name === "JsonWebTokenError")
            return res.status(400).json({ message: "Invalid or tampered reset token." });
        console.error("Reset password error:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

// POST /api/auth/google-login
export const googleLogin = async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) return res.status(400).json({ message: "Token is required" });

        // Verify the access token with Google UserInfo endpoint
        const googleRes = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!googleRes.ok) throw new Error("Invalid Google Token");

        const info = await googleRes.json();
        const { sub: googleId, email, name, picture } = info;

        let user = await User.findOne({ email });

        if (user) {
            // Link googleId if this email was registered manually before
            if (!user.googleId) {
                user.googleId = googleId;
                user.profilePicture = picture;
                await user.save();
            }
        } else {
            // Create a new user for first-time Google login
            const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
            const hashedPassword = await bcrypt.hash(randomPassword, 10);
            user = await User.create({
                username: name || email.split("@")[0],
                email,
                password: hashedPassword,
                googleId,
                profilePicture: picture,
            });
        }

        const jwtToken = jwt.sign(
            { id: user._id, isAdmin: user.isAdmin },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        const isProduction = process.env.NODE_ENV === "production";
        res.cookie("token", jwtToken, {
                httpOnly: true,
                maxAge: 7 * 24 * 60 * 60 * 1000,
                sameSite: isProduction ? "None" : "lax",
                secure: isProduction,
            })
            .json({
                message: "Google login successful",
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    isAdmin: user.isAdmin,
                    profilePicture: user.profilePicture
                },
                token: jwtToken,
            });

    } catch (err) {
        console.error("Google Login Error:", err);
        res.status(500).json({ message: "Google login failed", error: err.message });
    }
};
