const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const AppUser = require('../../models/User_Model');
require('dotenv').config();


class UserLoginController {
    async login(req, res) {
        const { username, password } = req.body;

        try {
            const user = await AppUser.findOne({ where: { Username: username } });

            if (!user) {
                return res.status(400).json({ message: 'Tên tài khoản không tồn tại' });
            }

            const isPasswordValid = await bcrypt.compare(password, user.Password);

            if (!isPasswordValid) {
                return res.status(400).json({ message: 'Mật khẩu không đúng' });
            }

            const token = jwt.sign({ id: user.IDUser, username: user.UserName }, process.env.JWT_SECRET, { expiresIn: '3h' });
            // req.session.user = {
            //     IDUser: user.IDUser,
            //     Name: user.Name,
            //     Username: user.Username,
            //     Role:user.Role,
            //     token: token
            // };
            
             // Lưu thông tin người dùng và token vào cookie
             const userInfo = {
                IDUser: user.IDUser,
                Username: user.Username,
                Role: user.Role,
                token: token,
                Name:user.Name
            };

            // Lưu vào cookie (dưới dạng chuỗi JSON)
            res.cookie('user_info', JSON.stringify(userInfo), { 
                httpOnly: true, // Cookie chỉ có thể truy cập qua HTTP, không qua JavaScript
                maxAge: 3 * 60 * 60 * 1000, // Thời gian sống của cookie (3 giờ)
                sameSite: 'strict' // Chống tấn công CSRF
            });
           
            res.status(200).json({
                DOMAIN: process.env.DOMAIN,
                success: true,
                message: 'Đăng nhập thành công',
                IDUser: user.IDUser,
                Username: user.Username,
                Role:user.Role,
                token: token,
            });

        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ message: 'Đã xảy ra lỗi' });
        }
    }
}

module.exports = new UserLoginController();
