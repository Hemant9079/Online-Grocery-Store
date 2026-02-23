import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema({
    id: { type: Number },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    imgUrl: { type: String },
    quantity: { type: Number, required: true, min: 1 },
});

const OrderSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        userEmail: { type: String, required: true },
        userName: { type: String },
        items: [OrderItemSchema],
        total: { type: Number, required: true },
        paymentMethod: {
            type: String,
            enum: ['online', 'cod'],
            required: true,
        },
        address: { type: String, required: true },
        status: {
            type: String,
            enum: ['Order Placed', 'Processing', 'Out for Delivery', 'Delivered'],
            default: 'Order Placed',
        },
    },
    { timestamps: true }
);

export default mongoose.model('Order', OrderSchema);
