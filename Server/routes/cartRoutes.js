import express from "express";
import { getCart, updateCart } from "../controllers/cartController.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/", verifyToken, getCart);
router.put("/", verifyToken, updateCart);

export default router;
