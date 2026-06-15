import jwt from "jsonwebtoken";

const authenticateToken = (req, res, next) => {
    // Look for the Authorization header: "Bearer <token>"
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: "Access denied. No token provided." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Attach the decoded user data (like user id) to the request object
        req.user = decoded;
        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        return res.status(403).json({ error: "Invalid token." });
    }
};

export default authenticateToken;
