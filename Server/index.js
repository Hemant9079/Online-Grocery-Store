import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();
import cookieParser from "cookie-parser";
import morgan from "morgan";
import helmet, { crossOriginResourcePolicy } from "helmet";

const app = express();
app.use(cors({
    credentials: true,
    origin: process.env.FRONTEND_URL
}))

app.use(express.json());
app.use(cookieParser());
app.use(morgan("common"));
app.use(helmet({
    crossOriginResourcePolicy: false
}));

app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 8080;

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("Connected to MongoDB");
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        })
    })
    .catch((err) => {
        console.log("Error connecting to MongoDB", err);
    });