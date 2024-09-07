const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const AppUser = require('../../models/User_Model'); 

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

            req.session.user = {
                IDUser: user.IDUser,
                Name: user.Name,
                Username : user.Username,
            };
             console.log(req.session.user)


            const token = jwt.sign({ id: user.IDUser, username: user.UserName }, process.env.JWT_SECRET, { expiresIn: '1h' });

            res.status(200).json({
                success:true,
                message: 'Đăng nhập thành công',
                IDUser:user.IDUser,
                token: token
            });

        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ message: 'Đã xảy ra lỗi' });
        }
    }
}

module.exports = new UserLoginController();
