const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(403).json({ error: 'No token provided' });

    const token = authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) return res.status(403).json({ error: 'No token provided' });

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ error: 'Unauthorized' });
        req.user = decoded; // { userId, role }
        next();
    });
};

const isHR = (req, res, next) => {
    if (req.user && req.user.role === 'hr') {
        next();
    } else {
        res.status(403).json({ error: 'Requires HR role' });
    }
};

module.exports = { verifyToken, isHR };
