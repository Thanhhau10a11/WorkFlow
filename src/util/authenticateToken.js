// const jwt = require('jsonwebtoken');

// function authenticateToken(req, res, next) {
//     //console.log('Checking token...');
//     //console.log('Request headers:', req.headers);
//     const authHeader = req.headers['authorization'];
//     const token = authHeader && authHeader.split(' ')[1];

//     console.log(token)

//     if (token == null) {
//         console.log("Khong pass vì token nulllll")
//         return res.redirect('/login');
//     }

//     jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
//         console.log('Verifying token...');
//         if (err) {
//             console.log("Khong pass vi co loiii :", err)
//             return res.redirect('/login');
//         }
//         req.user = user;
//         next();
//     });
// }


// module.exports = authenticateToken;



const jwt = require('jsonwebtoken');
const AppUser = require('../app/models/User_Model'); // Điều chỉnh đường dẫn nếu cần
const Role = require('../app/models/Role_Model'); // Điều chỉnh đường dẫn nếu cần

async function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    // const token = authHeader && authHeader.split(' ')[1];
    const token = (authHeader && authHeader.split(' ')[1]) || req.query.token;
    console.log(token)

    if (!token) {
        return res.redirect('/login');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await AppUser.findByPk(decoded.id, {
            include: {
                model: Role,
                as: 'Roles',
                through: { attributes: [] } 
            }
        });

        if (!user) {
            return res.redirect('/login');
        }

        req.user = {
            IDUser: user.IDUser,
            Name: user.Name,
            Username: user.Username,
            roles: user.Roles.map(role => role.RoleName) ,
            Token : token
        };

         // Lưu thông tin vào cookie
         res.cookie('userData', JSON.stringify(req.user), {
            httpOnly: true,  // Không cho phép truy cập từ JavaScript
            secure: process.env.NODE_ENV === 'production',  // Chỉ gửi qua HTTPS
            maxAge: 3600000  // Cookie hết hạn sau 1 giờ
        });

        next();
    } catch (err) {
        console.log("Token không hợp lệ hoặc đã hết hạn:", err);
        return res.redirect('/login');
    }
}

module.exports = authenticateToken;  





