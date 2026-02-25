import express from 'express';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
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
        console.error("Error in add product:", err); // Added debug log
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

// ── GET /api/admin/orders ─────────────────────────────────────────────────
router.get('/orders', ...adminGuard, async (_req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 }).limit(200);
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// ── PATCH /api/admin/orders/:id/status ── update status + notify customer ──
router.patch('/orders/:id/status', ...adminGuard, async (req, res) => {
    const { status } = req.body;
    const allowed = ['Order Placed', 'Processing', 'Out for Delivery', 'Delivered'];
    if (!status || !allowed.includes(status))
        return res.status(400).json({ message: 'Invalid status value.' });

    try {
        const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!order) return res.status(404).json({ message: 'Order not found.' });

        // Send notification email for meaningful status changes
        const notify = {
            'Processing':       { emoji: '⚙️',  label: 'Being Processed',       color: '#3b82f6', detail: 'We\'re preparing your items right now.' },
            'Out for Delivery': { emoji: '🚚',  label: 'Out for Delivery',       color: '#f97316', detail: 'Your order is on its way! Our delivery partner is heading to you.' },
            'Delivered':        { emoji: '✅',  label: 'Delivered',              color: '#16a34a', detail: 'Your order has been delivered. Enjoy your groceries!' },
        };

        const emailUser = process.env.EMAIL_USER;
        const emailPass = process.env.EMAIL_PASS;
        const isEmailConfigured = emailUser && emailPass && emailPass !== 'your_gmail_app_password';

        if (notify[status] && isEmailConfigured) {
            const { emoji, label, color, detail } = notify[status];
            const orderId = order._id.toString().slice(-8).toUpperCase();
            const itemRows = order.items.map(item => `
                <tr>
                    <td style="padding:9px 10px;border-bottom:1px solid #f1f5f9;color:#374151;">${item.name}</td>
                    <td style="padding:9px 10px;border-bottom:1px solid #f1f5f9;text-align:center;color:#374151;">×${item.quantity}</td>
                    <td style="padding:9px 10px;border-bottom:1px solid #f1f5f9;text-align:right;color:#374151;font-weight:600;">₹${item.price * item.quantity}</td>
                </tr>`).join('');

            const html = `
            <div style="font-family:'Inter',Arial,sans-serif;max-width:600px;margin:0 auto;background:#f8fafc;padding:0;border-radius:16px;overflow:hidden;">
                <!-- Header -->
                <div style="background:linear-gradient(135deg,#15803d,#16a34a);padding:32px 28px;text-align:center;">
                    <h1 style="color:#fff;font-size:26px;margin:0;letter-spacing:-0.5px;">🛒 Fast Delivery</h1>
                    <p style="color:rgba(255,255,255,0.85);margin:6px 0 0;font-size:14px;">Order Status Update</p>
                </div>

                <!-- Status Badge -->
                <div style="background:#fff;padding:28px 28px 0;text-align:center;">
                    <div style="display:inline-block;background:${color}18;border:2px solid ${color};border-radius:50px;padding:10px 28px;margin-bottom:16px;">
                        <span style="font-size:22px;">${emoji}</span>
                        <span style="font-size:17px;font-weight:700;color:${color};margin-left:8px;">${label}</span>
                    </div>
                    <p style="color:#374151;font-size:15px;margin:0 0 8px;">Hi <strong>${order.userName || 'Customer'}</strong>,</p>
                    <p style="color:#64748b;font-size:14px;margin:0 0 24px;">${detail}</p>
                </div>

                <!-- Order Details -->
                <div style="background:#fff;padding:0 28px 24px;">
                    <div style="background:#f8fafc;border-radius:10px;padding:16px 20px;margin-bottom:16px;">
                        <p style="margin:0 0 4px;font-size:13px;color:#94a3b8;font-weight:600;letter-spacing:0.05em;">ORDER ID</p>
                        <p style="margin:0;font-size:16px;color:#052e16;font-weight:700;">#${orderId}</p>
                    </div>

                    <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
                        <thead>
                            <tr style="background:#f0fdf4;">
                                <th style="padding:10px;text-align:left;font-size:12px;color:#6b7280;border-bottom:2px solid #bbf7d0;">ITEM</th>
                                <th style="padding:10px;text-align:center;font-size:12px;color:#6b7280;border-bottom:2px solid #bbf7d0;">QTY</th>
                                <th style="padding:10px;text-align:right;font-size:12px;color:#6b7280;border-bottom:2px solid #bbf7d0;">AMOUNT</th>
                            </tr>
                        </thead>
                        <tbody>${itemRows}</tbody>
                        <tfoot>
                            <tr>
                                <td colspan="2" style="padding:12px 10px;font-weight:700;color:#052e16;font-size:15px;">Total</td>
                                <td style="padding:12px 10px;font-weight:800;color:#15803d;font-size:18px;text-align:right;">₹${order.total}</td>
                            </tr>
                        </tfoot>
                    </table>

                    <div style="background:#f8fafc;border-radius:10px;padding:14px 18px;">
                        <p style="margin:0 0 4px;font-size:12px;color:#94a3b8;font-weight:600;">DELIVERY ADDRESS</p>
                        <p style="margin:0;color:#374151;font-size:14px;">${order.address}</p>
                    </div>
                </div>

                <!-- Footer -->
                <div style="background:#f0fdf4;padding:20px 28px;text-align:center;border-top:1px solid #dcfce7;">
                    <p style="color:#6b7280;font-size:13px;margin:0;">Thank you for shopping with Fast Delivery! 🥦</p>
                    <p style="color:#94a3b8;font-size:11px;margin:4px 0 0;">This is an automated message. Please do not reply.</p>
                </div>
            </div>`;

            try {
                const transporter = nodemailer.createTransport({ service: 'gmail', auth: { user: emailUser, pass: emailPass } });
                await transporter.sendMail({
                    from: `"Fast Delivery 🛒" <${emailUser}>`,
                    to: order.userEmail,
                    subject: `${emoji} Order #${orderId} — ${label} | Fast Delivery`,
                    html,
                });
                console.log(`✅ Status email sent to ${order.userEmail} [${status}]`);
            } catch (mailErr) {
                console.error('Status email error:', mailErr.message);
            }
        } else if (notify[status] && !isEmailConfigured) {
            console.log(`⚠️  Email not configured — skipping status notification for order ${order._id}`);
        }

        res.json({ success: true, order });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

export default router;
