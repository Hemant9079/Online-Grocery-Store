import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (req, res, next) => {
    try {
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(req.body.password, salt);

        const newUser = new User({
            username: req.body.username,
            email: req.body.email,
            password: hash,
        });

        await newUser.save();
        res.status(200).json({ message: "User has been created." });
    } catch (err) {
        next(err);
    }
};

export const login = async (req, res, next) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) return res.status(404).json({ message: "User not found!" });

        const isPasswordCorrect = await bcrypt.compare(
            req.body.password,
            user.password
        );
        if (!isPasswordCorrect)
            return res.status(400).json({ message: "Wrong password or username!" });

        const token = jwt.sign(
            { id: user._id, isAdmin: user.isAdmin },
            process.env.JWT_SECRET
        );

        const { password, isAdmin, ...otherDetails } = user._doc;
        res
            .cookie("access_token", token, {
                httpOnly: true,
            })
            .status(200)
            .json({ details: { ...otherDetails }, isAdmin, token });
    } catch (err) {
        next(err);
    }
};
