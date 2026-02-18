import Product from "../models/Product.js";

export const getAllProducts = async (req, res, next) => {
    try {
        const products = await Product.find();
        res.status(200).json(products);
    } catch (err) {
        next(err);
    }
};

export const seedProducts = async (req, res, next) => {
    try {
        const products = req.body; // Expecting an array of products
        await Product.deleteMany({}); // Clear existing products
        await Product.insertMany(products);
        res.status(200).json({ message: "Products seeded successfully" });
    } catch (err) {
        next(err);
    }
};
