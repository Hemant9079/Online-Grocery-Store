import User from "../models/User.js";

export const getCart = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        res.status(200).json(user.cart);
    } catch (err) {
        next(err);
    }
};

export const updateCart = async (req, res, next) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: { cart: req.body } },
            { new: true }
        );
        res.status(200).json(user.cart);
    } catch (err) {
        next(err);
    }
};
