class configEmailController {
    async index(req, res) {
        res.render('Email/home');
    }
}

module.exports = new configEmailController();
