
const axios = require('axios');

class UserRegisterController {
    index(req, res) {
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).json({ message: 'Lỗi khi logout' });
            }
            
            res.redirect('/login');
        });
    }
}

module.exports = new UserRegisterController();
