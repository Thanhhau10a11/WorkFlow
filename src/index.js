const http = require('http');
const path = require('path');
const express = require('express');
const morgan = require('morgan');
const { engine } = require('express-handlebars');
require('dotenv').config();
const app = express();
const port = 3000;

const { sequelize } = require('./app/models/index');

// Cài đặt session-store với connect-session-sequelize  
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);

// Tạo session store với Sequelize  
const sessionStore = new SequelizeStore({
  db: sequelize,
  checkExpirationInterval: 15 * 60 * 1000, // Kiểm tra và xóa session cũ mỗi 15 phút  
  expiration: 24 * 60 * 60 * 1000 // Thời gian sống của session (24 giờ)  
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(morgan('combined'));

// Cấu hình session  
app.use(session({
  store: sessionStore,
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 10800000 }  // Thời gian sống của cookie session 3 giờ  
}));

sequelize.sync()
  .then(() => {
    console.log('Models synchronized with the database');
    return sessionStore.sync(); // Đồng bộ bảng session  
  })
  .then(() => console.log('Session store synchronized with the database'))
  .catch(err => console.error('Unable to synchronize the database:', err));

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
    
  }
}));

app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "resources", "views"));

const router = require('./router/APIRoutes');
const routerLoggin = require('./router/userLoggin');
const routerLogout=require('./router/userLogout');
const routerRegister = require('./router/userRegister');
const UserRouter = require('./router/UserRoutes');
const username = require('./util/exportUserName');
//const appUserController = require('./app/controllers/UserController/AppUserController')

app.use(username);
app.use('/api', router);
app.use('/login', routerLoggin);
app.use('/logout', routerLogout);
app.use('/register', routerRegister);
app.use('/uploads', express.static(path.join(__dirname,"..", 'uploads')));

//app.get('/update-info',appUserController.index)
app.use('/', UserRouter);

http.createServer(app).listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});  