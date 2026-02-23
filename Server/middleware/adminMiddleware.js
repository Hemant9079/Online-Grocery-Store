export const adminMiddleware = (req, res, next) => {
    // Must be used after verifyToken
    if (!req.user || !req.user.isAdmin) {
        return res.status(403).json({ message: 'Access denied. Admins only.' });
    }
    next();
};
