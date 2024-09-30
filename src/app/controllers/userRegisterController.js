
const axios = require('axios');

class UserRegisterController {
    index(req, res) {
        res.render('login', { layout: 'login.hbs' });
    }
    async register(req, res) {
        const { name, username, password, password_confirmation } = req.body;

        if (password !== password_confirmation) {
            return res.status(400).json({ message: 'Mật khẩu không khớp' });
        }

        try {
            const existingUser = await axios.get(`https://api.yourserver.com/users/${username}`);
            if (existingUser.data.exists) {
                return res.status(400).json({ message: 'Tên tài khoản đã tồn tại' });
            }

            await axios.post('https://api.yourserver.com/users/register', {
                name,
                username,
                password
            });

            res.status(201).json({ message: 'Đăng ký thành công' });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ message: 'Đã xảy ra lỗi' });
        }
    }
}

module.exports = new UserRegisterController();
