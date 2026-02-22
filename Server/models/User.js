import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        isAdmin: {
            type: Boolean,
            default: false,
        },
        cart: [
            {
                id: { type: Number, required: true },
                name: String,
                price: Number,
                imgUrl: String,
                quantity: { type: Number, default: 1 }
            }
        ]
    },
    { timestamps: true }
);

export default mongoose.model("User", UserSchema);
