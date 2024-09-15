const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
    //console.log('Checking token...');
    //console.log('Request headers:', req.headers);
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    //console.log('Token received:', token);

    if (token == null) {
        return res.redirect('/login');
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        //console.log('Verifying token...');
        if (err) {
            //console.log("JWT Verification Error:", err);
            return res.redirect('/login');
        }

        req.user = user;
        //console.log("User authenticated:", req.user);
        next();
    });
}


module.exports = authenticateToken;
