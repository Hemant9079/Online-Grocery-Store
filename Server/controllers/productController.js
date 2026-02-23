// GET /api/products  — placeholder; products are managed on frontend
export const getAllProducts = async (req, res) => {
    res.json({ message: "Products are served from the frontend data file." });
};

// POST /api/products/seed
export const seedProducts = async (req, res) => {
    res.json({ message: "Seed endpoint ready." });
};
