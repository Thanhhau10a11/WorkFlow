const express = require('express');
const router = express.Router();

const checkLogin = require('../../util/checkLogin.js')

const homeRouter = require('./home');

// Sử dụng các router

router.use('/',checkLogin,homeRouter);


module.exports = router;