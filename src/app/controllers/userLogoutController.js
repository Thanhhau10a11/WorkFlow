
const axios = require('axios');

class userLogoutController {
    index(req, res) {
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).json({ message: 'Lỗi khi logout' });
            }

            // Sau khi hủy session, chuyển hướng về trang login
            res.redirect('/login');
        });
    }
}

module.exports = new userLogoutController();
