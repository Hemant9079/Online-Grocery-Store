import express from 'express';
import nodemailer from 'nodemailer';
import { verifyToken } from '../middleware/verifyToken.js';
import Order from '../models/Order.js';

const router = express.Router();

// POST /api/order/confirm
router.post('/confirm', verifyToken, async (req, res) => {
    const { items, total, paymentMethod, address, userEmail, userName } = req.body;

    if (!items || !total || !paymentMethod || !address || !userEmail) {
        return res.status(400).json({ message: 'Missing required order details.' });
    }

    // Save order to database
    let savedOrder;
    try {
        savedOrder = await Order.create({
            userId: req.user.id,
            userEmail,
            userName: userName || 'Customer',
            items,
            total,
            paymentMethod,
            address,
            status: 'Order Placed',
        });
    } catch (dbErr) {
        console.error('Order DB save error:', dbErr.message);
        return res.status(500).json({ message: 'Failed to save order.', error: dbErr.message });
    }

    // Build HTML email receipt
    const itemRows = items.map(item => `
        <tr>
            <td style="padding:10px;border-bottom:1px solid #e5e7eb;">${item.name}</td>
            <td style="padding:10px;border-bottom:1px solid #e5e7eb;text-align:center;">${item.quantity}</td>
            <td style="padding:10px;border-bottom:1px solid #e5e7eb;text-align:right;">Rs ${item.price * item.quantity}</td>
        </tr>
    `).join('');

    const paymentBadge = paymentMethod === 'online'
        ? `<span style="background:#dcfce7;color:#166534;padding:4px 12px;border-radius:20px;font-weight:600;">✅ Paid Online</span>`
        : `<span style="background:#fef9c3;color:#854d0e;padding:4px 12px;border-radius:20px;font-weight:600;">🚚 Pay on Delivery</span>`;

    const orderId = savedOrder._id.toString().slice(-8).toUpperCase();

    const html = `
    <div style="font-family:'Inter',sans-serif;max-width:600px;margin:0 auto;background:#f0fdf4;padding:32px;border-radius:16px;">
        <div style="text-align:center;margin-bottom:28px;">
            <h1 style="color:#15803d;font-size:28px;margin:0;">🛒 Fast Delivery</h1>
            <p style="color:#6b7280;margin:6px 0 0;">Your order receipt</p>
            <p style="color:#9ca3af;font-size:12px;margin:4px 0 0;">Order ID: #${orderId}</p>
        </div>

        <div style="background:#fff;border-radius:12px;padding:24px;margin-bottom:20px;box-shadow:0 1px 4px rgba(0,0,0,0.06);">
            <h2 style="color:#052e16;margin:0 0 16px;font-size:18px;">👤 Customer Details</h2>
            <p style="margin:4px 0;color:#374151;"><strong>Name:</strong> ${userName || 'Customer'}</p>
            <p style="margin:4px 0;color:#374151;"><strong>Email:</strong> ${userEmail}</p>
            <p style="margin:4px 0;color:#374151;"><strong>Delivery Address:</strong> ${address}</p>
        </div>

        <div style="background:#fff;border-radius:12px;padding:24px;margin-bottom:20px;box-shadow:0 1px 4px rgba(0,0,0,0.06);">
            <h2 style="color:#052e16;margin:0 0 16px;font-size:18px;">🧾 Order Summary</h2>
            <table style="width:100%;border-collapse:collapse;">
                <thead>
                    <tr style="background:#f0fdf4;">
                        <th style="padding:10px;text-align:left;color:#374151;font-size:13px;border-bottom:2px solid #bbf7d0;">Item</th>
                        <th style="padding:10px;text-align:center;color:#374151;font-size:13px;border-bottom:2px solid #bbf7d0;">Qty</th>
                        <th style="padding:10px;text-align:right;color:#374151;font-size:13px;border-bottom:2px solid #bbf7d0;">Amount</th>
                    </tr>
                </thead>
                <tbody>${itemRows}</tbody>
                <tfoot>
                    <tr>
                        <td colspan="2" style="padding:14px 10px;font-weight:700;font-size:16px;color:#052e16;">Total</td>
                        <td style="padding:14px 10px;font-weight:700;font-size:20px;color:#15803d;text-align:right;">Rs ${total}</td>
                    </tr>
                </tfoot>
            </table>
        </div>

        <div style="background:#fff;border-radius:12px;padding:20px;margin-bottom:20px;box-shadow:0 1px 4px rgba(0,0,0,0.06);">
            <h2 style="color:#052e16;margin:0 0 12px;font-size:18px;">💳 Payment Status</h2>
            ${paymentBadge}
        </div>

        <div style="background:#fff;border-radius:12px;padding:20px;margin-bottom:20px;box-shadow:0 1px 4px rgba(0,0,0,0.06);">
            <h2 style="color:#052e16;margin:0 0 12px;font-size:18px;">📦 Order Tracking</h2>
            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                <span style="background:#15803d;color:#fff;padding:4px 12px;border-radius:20px;font-size:13px;font-weight:600;">✅ Order Placed</span>
                <span style="color:#d1d5db;">→</span>
                <span style="background:#e5e7eb;color:#6b7280;padding:4px 12px;border-radius:20px;font-size:13px;">Processing</span>
                <span style="color:#d1d5db;">→</span>
                <span style="background:#e5e7eb;color:#6b7280;padding:4px 12px;border-radius:20px;font-size:13px;">Out for Delivery</span>
                <span style="color:#d1d5db;">→</span>
                <span style="background:#e5e7eb;color:#6b7280;padding:4px 12px;border-radius:20px;font-size:13px;">Delivered</span>
            </div>
        </div>

        <div style="text-align:center;margin-top:28px;">
            <p style="color:#6b7280;font-size:13px;">Thank you for shopping with Fast Delivery! 🥦</p>
            <p style="color:#6b7280;font-size:12px;">This is an automated receipt. Please do not reply to this email.</p>
        </div>
    </div>
    `;

    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        await transporter.sendMail({
            from: `"Fast Delivery 🛒" <${process.env.EMAIL_USER}>`,
            to: userEmail,
            subject: `🧾 Order Confirmed #${orderId} — Rs ${total} | Fast Delivery`,
            html,
        });

        res.json({ success: true, message: 'Order saved & bill sent to your email!', orderId: savedOrder._id });
    } catch (err) {
        console.error('Email error:', err.message);
        // Order is already saved — just notify that email failed
        res.json({ success: true, message: 'Order confirmed! (Email could not be sent)', orderId: savedOrder._id });
    }
});

// GET /api/order/history — get all orders for the logged-in user
router.get('/history', verifyToken, async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user.id })
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        console.error('Order history error:', err.message);
        res.status(500).json({ message: 'Failed to fetch order history.' });
    }
});

// PATCH /api/order/:id/status — update order status (dev tool)
router.patch('/:id/status', verifyToken, async (req, res) => {
    const { status } = req.body;
    const allowed = ['Order Placed', 'Processing', 'Out for Delivery', 'Delivered'];
    if (!status || !allowed.includes(status)) {
        return res.status(400).json({ message: 'Invalid status value.' });
    }
    try {
        const order = await Order.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            { status },
            { new: true }
        );
        if (!order) return res.status(404).json({ message: 'Order not found.' });
        res.json(order);
    } catch (err) {
        console.error('Status update error:', err.message);
        res.status(500).json({ message: 'Failed to update status.' });
    }
});

export default router;
