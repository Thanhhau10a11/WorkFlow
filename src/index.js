const express = require('express');
const http = require('http'); // Tạo server HTTP
const socketIO = require('socket.io');
const path = require('path');
const morgan = require('morgan');
const { engine } = require('express-handlebars');
require('dotenv').config();
const app = express();
const port = 3000;

const { sequelize } = require('./app/models/index');


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(morgan('combined'));


// Sử dụng bodyParser và cookieParser middleware  
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.engine("hbs", engine({
  extname: '.hbs',
  helpers: {
    sum: (a, b) => a + b,
    formatPrice: (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price),
    totalPrice: (items) => {
      if (Array.isArray(items)) {
        return items.reduce((total, item) => total + item.totalPrice, 0);
      }
      return 0;
    },
    formatDate: (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });
    },
    eq: function (a, b) {
      return a === b;
    },
    gt: function (a, b) {
      return a > b;
    },
    lt: function (a, b) {
      return a < b;
    },
    gte: function (a, b) {
      return a >= b;
    },
    range: function (n) {
      return Array.from({ length: n }, (v, k) => k + 1);
    },
    add: function (a, b) {
      return a + b;
    },
    subtract: function (a, b) {
      return a - b;
    },
    and: function () {
      return Array.prototype.every.call(arguments, Boolean);
    },
    json: function (context) {
      return JSON.stringify(context);
    },
    isSelected: function (recipientID, username) {
      return recipientID === username ? 'selected' : '';
    }
  }
}));


app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "resources", "views"));

// Import router
const router = require('./router/APIRoutes');
const routerLoggin = require('./router/userLoggin');
const routerLogout = require('./router/userLogout');
const routerRegister = require('./router/userRegister');
const UserRouter = require('./router/UserRoutes');
const username = require('./util/exportUserName');

// Sử dụng router
app.use(username);
app.use('/api', router);
app.use('/login', routerLoggin);
app.use('/logout', routerLogout);
app.use('/register', routerRegister);
app.use('/uploads', express.static(path.join(__dirname,"..", 'uploads')));
app.use('/', UserRouter);

// Tạo HTTP server và khởi tạo Socket.IO
const server = http.createServer(app);
const io = socketIO(server);

// Lưu Socket.IO vào app.locals để có thể truy cập trong các file khác
app.locals.io = io;

// Cấu hình sự kiện kết nối
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

   // Tham gia phòng riêng dựa trên userId
   socket.on('joinRoom', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`User ${userId} joined room user_${userId}`);
  });
  
  // Lắng nghe các sự kiện cần thiết từ client (nếu có)
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Khởi động server
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
