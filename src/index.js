const http = require('http');
const path = require('path')
const express = require('express')
const morgan = require('morgan')
const { engine } = require('express-handlebars')
require('dotenv').config();
const app = express()
const port = 3000

app.use(express.json())
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")))
app.use(morgan('combined'))


const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');


//sesion
const session = require('express-session');

app.use(session({
    secret: 'admin',
    resave: true,
    saveUninitialized: false
}));

// Sử dụng bodyParser và cookieParser middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser()); // Sử dụng cookie-parser middleware

//const db = require('./config/db')

// db.query('SELECT * FROM AppUser', (error, results, fields) => {
//   if (error) throw error;
//   console.log('Kết quả truy vấn:', results);
// });

//template engine
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
    }
  }
}));



app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "resources","views"));

const router = require('./router/APIRoutes')
const routerLoggin = require('./router/userLoggin')
const routerRegister = require('./router/userRegister')
app.use('/api', router);
app.use('/login', routerLoggin);
app.use('/register', routerRegister);


// app.get('/', function (req, res) {
//   res.render('home')
// })

//app.listen(port,()=> console.log(`App listening at port ${port}`))
http.createServer(app).listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});