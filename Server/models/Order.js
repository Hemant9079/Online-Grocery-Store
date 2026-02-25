import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userName: {
      type: String,
    },
    userEmail: {
      type: String,
    },
    items: {
      type: Array, // Or define a sub-schema for items
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    address: {
        type: Object, // Could be String or Object depending on implementation
        required: true
    },
    status: {
      type: String,
      default: "Pending", // Pending, Processing, Shipped, Delivered, Cancelled
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
