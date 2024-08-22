class HomeController {
    index(req,res) {
        res.render('home',{layout: 'main.hbs'});
    }
}

module.exports= new HomeController