// function checkLoggedIn(req, res, next) {
//     if (req.session.user) {
//         next();
//     } else {
//         res.redirect('/login');
//     }
// }

// module.exports = checkLoggedIn;


function checkAuth(req, res, next) {
    // Kiểm tra xem cookie có tồn tại không và có chứa thông tin người dùng
    const userInfo = req.cookies.user_info;

    if (!userInfo) {
        // Nếu không có cookie, chuyển hướng đến trang đăng nhập
        return res.redirect('/login');  // Bạn có thể thay '/login' bằng đường dẫn tới trang đăng nhập của bạn
    }

    try {
        // Giải mã cookie và kiểm tra token
        const user = JSON.parse(userInfo);
        // Lưu thông tin người dùng vào request object để sử dụng ở các route khác
        req.user = user;

        // Nếu có cookie hợp lệ, tiếp tục xử lý yêu cầu
        next();
    } catch (error) {
        console.error('Cookie không hợp lệ:', error.message);
        return res.status(400).send('Dữ liệu cookie không hợp lệ');
    }
}

module.exports = checkAuth;
