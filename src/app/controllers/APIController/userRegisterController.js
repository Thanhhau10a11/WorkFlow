const bcrypt = require('bcryptjs');
const AppUser = require('../../models/User_Model'); 

class UserRegisterController {
    async register(req, res) {
        const { name, username, password, password_confirmation } = req.body;

        if (password !== password_confirmation) {
            return res.status(400).json({ message: "Mật khẩu không khớp" });
        }

        try {
            const existingUser = await AppUser.findOne({ where: { Username: username } });
            
            if (existingUser) {
                return res.status(400).json({ message: 'Tên tài khoản đã tồn tại' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            await AppUser.create({ Name: name,Username: username, Password: hashedPassword });

            res.status(200).json({
                success:true,
                message: 'Đăng ký thành công',
            });

        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ message: 'Đã xảy ra lỗi' });
        }
    }
}

module.exports = new UserRegisterController();
