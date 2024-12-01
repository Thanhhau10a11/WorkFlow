class AppUserController {
    async index(req, res) {
        const email = req.query.email;
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }
        res.render('AppUser/UpdateInfo', { email, layout: false });
    }
}

module.exports = new AppUserController();
