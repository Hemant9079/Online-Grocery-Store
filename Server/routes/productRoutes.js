import express from "express";
import {
    getAllProducts,
    seedProducts,
} from "../controllers/productController.js";
import Product from "../models/Product.js";

const router = express.Router();

router.get("/", getAllProducts);
router.post("/seed", seedProducts);

// Public: returns all admin-added products from DB
router.get("/dynamic", async (_req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

export default router;
