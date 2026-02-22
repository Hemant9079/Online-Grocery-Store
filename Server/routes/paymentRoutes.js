import express from "express";
import Razorpay from "razorpay";

const router = express.Router();

// POST /api/payment/create-order
router.post("/create-order", async (req, res) => {
    try {
        const { amount } = req.body; // amount in Rs

        if (!amount || amount <= 0)
            return res.status(400).json({ message: "Invalid amount" });

        // Instantiate lazily so dotenv.config() has already run
        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        const options = {
            amount: Math.round(amount * 100), // convert to paisa
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);
        res.json(order);
    } catch (err) {
        console.error("❌ Razorpay error:", err);
        res.status(500).json({ message: "Payment order creation failed", error: err.message });
    }
});

export default router;

