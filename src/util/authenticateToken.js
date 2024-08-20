const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.status(401).json({ message: 'Không có token' });

    jwt.verify(token, 'your_jwt_secret_key', (err, user) => {
        if (err) return res.status(403).json({ message: 'Token không hợp lệ' });

        req.user = user;
        next();
    });
}

module.exports = authenticateToken;
