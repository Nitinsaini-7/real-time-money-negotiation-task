// middleware/auth.js
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

module.exports = function (req, res, next) {
    // Get token from header
    const token = req.header('x-auth-token');

    // Check if not token
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    // Verify token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded.user; // Attach user information (e.g., user ID) to the request object
        next(); // Move to the next middleware/route handler
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};