import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        price: { type: Number, required: true, min: 0 },
        imgUrl: { type: String, required: true },
        category: {
            type: String,
            required: true,
            enum: ['Dairy', 'Snacks', 'ColdDrinks', 'Wine', 'Smoking', 'Snakes'], // Keep Snakes for backward compat if needed, add Snacks
        },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    },
    { timestamps: true }
);

export default mongoose.model('Product', ProductSchema);
