function exportUserName(req, res, next) {
    console.log(req.session.user)
    if (req.session && req.session.user && req.session.user.Name) {
        res.locals.Name = req.session.user.Name;
    } else {
        res.locals.Name = null;
    }
    next();
}

module.exports = exportUserName;