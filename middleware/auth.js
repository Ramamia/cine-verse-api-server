import jwt from "jsonwebtoken";

const authenticateToken = (req, res, next) => {
    // listen we need to check if they have a token in the headers yk
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: "Access denied. No token provided." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // okay so we attach the user info to the request so we know who it is
        req.user = decoded;
        next(); 
    } catch (error) {
        return res.status(403).json({ error: "Invalid token." });
    }
};

export default authenticateToken;
