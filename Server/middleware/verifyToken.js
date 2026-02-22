import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
    // Accept token from cookie OR Authorization header
    const token =
        req.cookies?.token ||
        (req.headers.authorization?.startsWith("Bearer ")
            ? req.headers.authorization.split(" ")[1]
            : null);

    if (!token)
        return res.status(401).json({ message: "Access denied. No token provided." });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch {
        res.status(403).json({ message: "Invalid or expired token." });
    }
};
