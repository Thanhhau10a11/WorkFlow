const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
    //console.log('Checking token...');
    //console.log('Request headers:', req.headers);
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    console.log(token)
    //console.log('Token received:', token);

    if (token == null) {
        console.log("Khong pass vì token nulllll")
        return res.redirect('/login');
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        console.log('Verifying token...');
        if (err) {
            //console.log("JWT Verification Error:", err);
            console.log("Khong pass vi co loiii :", err)
            return res.redirect('/login');
        }

        req.user = user;
        //console.log("User authenticated:", req.user);
        next();
    });
}


module.exports = authenticateToken;








// const jwt = require('jsonwebtoken');

// function authenticateToken(req, res, next) {
//     const authHeader = req.headers['authorization'];
//     const token = authHeader && authHeader.split(' ')[1] || req.query.token;

//     if (token == null) {
//         return res.redirect('/login');
//     }

//     jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
//         if (err) {
//             return res.redirect('/login');
//         }
//         console.log("Passsssssssssssssssssssssssssssssssssssssssss")
//         req.user = user;
//         next();
//     });
// }

// module.exports = authenticateToken;

// function authenticateToken(req, res, next) {
//    console.log("Da vaooooooooooooooooooooooooooooooooooooooooooo")
//    next();
// }

// module.exports = authenticateToken;
