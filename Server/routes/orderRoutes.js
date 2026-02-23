import express from 'express';
import nodemailer from 'nodemailer';
import { verifyToken } from '../middleware/verifyToken.js';

const router = express.Router();

// POST /api/order/confirm
router.post('/confirm', verifyToken, async (req, res) => {
    const { items, total, paymentMethod, address, userEmail, userName } = req.body;

    if (!items || !total || !paymentMethod || !address || !userEmail) {
        return res.status(400).json({ message: 'Missing required order details.' });
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

    const html = `
    <div style="font-family:'Inter',sans-serif;max-width:600px;margin:0 auto;background:#f0fdf4;padding:32px;border-radius:16px;">
        <div style="text-align:center;margin-bottom:28px;">
            <h1 style="color:#15803d;font-size:28px;margin:0;">🛒 Fast Delivery</h1>
            <p style="color:#6b7280;margin:6px 0 0;">Your order receipt</p>
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
            subject: `🧾 Your Order Receipt — Rs ${total} | Fast Delivery`,
            html,
        });

        res.json({ success: true, message: 'Bill sent to your email!' });
    } catch (err) {
        console.error('Email error:', err.message);
        res.status(500).json({ message: 'Order confirmed but email could not be sent.', error: err.message });
    }
});

export default router;
