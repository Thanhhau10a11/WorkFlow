const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const AppUser = require('../models/User_Model'); 

class UserLoginController {
    index(req,res) {
        res.render('login', { layout: 'login.hbs' });
    }
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

            const token = jwt.sign({ id: user.IDUser, username: user.UserName }, process.env.JWT_SECRET, { expiresIn: '1h' });

            res.status(200).json({
                message: 'Đăng nhập thành công',
                token: token
            });

        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ message: 'Đã xảy ra lỗi' });
        }
    }
}

module.exports = new UserLoginController();
