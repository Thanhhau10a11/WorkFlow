class HomeController {
    index(req,res) {
        res.render('Job/home',{layout: 'main.hbs'});
    }
}

module.exports= new HomeController