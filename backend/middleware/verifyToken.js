// middleware/verifyToken.js - This is a good place for file comments
const jwt = require('jsonwebtoken');

const verifyToken = function(req, res, next) {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Access denied' });

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (err) {
        res.status(400).json({ error: 'Invalid token' });
    }
};

module.exports = verifyToken; // Exports the function directly