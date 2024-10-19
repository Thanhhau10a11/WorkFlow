const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Tạo thư mục upload nếu chưa tồn tại
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Cấu hình nơi lưu trữ file và cách đặt tên file
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Thư mục lưu file
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Tạo tên file duy nhất
    }
});

// Thiết lập bộ lọc tệp để chỉ cho phép các tệp có định dạng nhất định
const fileFilter = (req, file, cb) => {
    console.log(file.mimetype);
    // Thêm các định dạng file phổ biến
    const allowedTypes = /jpeg|jpg|png|pdf|gif|doc|docx|xls|xlsx|ppt|pptx|txt|zip|rar|text\/plain/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    console.log(`extname: ${extname}, mimetype: ${mimetype}`);
    if (extname && mimetype) {
        return cb(null, true);  // File hợp lệ
    } else {
        cb(new Error('File type not supported!'));  // File không hợp lệ
    }
};


// Khởi tạo multer
const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 5 }, // Giới hạn kích thước file 5MB
    fileFilter: fileFilter
});

module.exports = upload; // Xuất upload để sử dụng trong router
