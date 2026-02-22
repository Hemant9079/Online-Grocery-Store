import User from "../models/User.js";

// GET /api/cart  — fetch logged-in user's cart
export const getCart = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("cart");
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json({ cart: user.cart });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

// PUT /api/cart  — replace logged-in user's cart
export const updateCart = async (req, res) => {
    try {
        // Accept { cart: [...] } OR a raw array
        const cart = Array.isArray(req.body) ? req.body : req.body?.cart;

        if (!Array.isArray(cart))
            return res.status(400).json({ message: "cart must be an array" });

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { cart },
            { new: true }
        ).select("cart");

        res.json({ message: "Cart updated", cart: user.cart });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};
