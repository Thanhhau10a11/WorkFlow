
const axios = require('axios');

class userLogoutController {
    index(req, res) {
        res.clearCookie('user_info', {
            httpOnly: true,
            sameSite: 'strict',
        });

        res.redirect('/login');
    }
}

module.exports = new userLogoutController();
