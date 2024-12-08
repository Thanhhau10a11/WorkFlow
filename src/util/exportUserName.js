// function exportUserName(req, res, next) {
//     if (req.user) {
//         res.locals.Name = req.user.Name;
//     } else {
//         res.locals.Name = null;
//     }
//     next();
// }

// module.exports = exportUserName;

function exportUserName(req, res, next) {
    if (req.cookies.user_info) {
        res.locals.Name = JSON.parse(req.cookies.user_info).Name;
        console.log("AAAAAAAAAAAAAAA",JSON.parse(req.cookies.user_info).Name)
    } else {
        res.locals.Name = null;
    }
    next();
}

module.exports = exportUserName;