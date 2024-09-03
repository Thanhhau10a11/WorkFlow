class WorkFlowController {
    index(req,res) {
        res.render('workFlow',{layout: 'main.hbs'});
    }
}

module.exports= new WorkFlowController