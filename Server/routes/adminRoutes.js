import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Product from '../models/Product.js';
import { verifyToken } from '../middleware/verifyToken.js';
import { adminMiddleware } from '../middleware/adminMiddleware.js';

const router = express.Router();

// ── Admin-only guard shorthand ──────────────────────────────────────────────
const adminGuard = [verifyToken, adminMiddleware];

// ── POST /api/auth/admin-register ──────────────────────────────────────────
// Creates an admin account protected by ADMIN_SECRET env var
router.post('/admin-register', async (req, res) => {
    try {
        const { username, email, password, adminSecret } = req.body;
        if (adminSecret !== process.env.ADMIN_SECRET) {
            return res.status(403).json({ message: 'Invalid admin secret key.' });
        }
        if (!username || !email || !password)
            return res.status(400).json({ message: 'All fields are required.' });

        const existing = await User.findOne({ $or: [{ email }, { username }] });
        if (existing) return res.status(409).json({ message: 'Email or username already exists.' });

        const hashed = await bcrypt.hash(password, 10);
        const user = await User.create({ username, email, password: hashed, isAdmin: true });
        res.status(201).json({ message: 'Admin account created.', userId: user._id });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// ── GET /api/admin/products ─────────────────────────────────────────────────
router.get('/products', ...adminGuard, async (_req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// ── POST /api/admin/products ────────────────────────────────────────────────
router.post('/products', ...adminGuard, async (req, res) => {
    try {
        const { name, price, imgUrl, category } = req.body;
        if (!name || !price || !imgUrl || !category)
            return res.status(400).json({ message: 'All fields are required.' });

        const product = await Product.create({
            name,
            price: Number(price),
            imgUrl,
            category,
            createdBy: req.user.id,
        });
        res.status(201).json({ message: 'Product added.', product });
    } catch (err) {
        if (err.name === 'ValidationError')
            return res.status(400).json({ message: err.message });
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// ── DELETE /api/admin/products/:id ─────────────────────────────────────────
router.delete('/products/:id', ...adminGuard, async (req, res) => {
    try {
        const deleted = await Product.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Product not found.' });
        res.json({ message: 'Product deleted.' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

export default router;
