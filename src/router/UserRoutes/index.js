const express = require('express');
const router = express.Router();

const checkLogin = require('../../util/checkLogin.js')

const homeRouter = require('./home');
const workFLowRouter = require('./workFlow.js');

// Sử dụng các router

router.use('/workFlow',checkLogin,workFLowRouter)
router.use('/',checkLogin,homeRouter);


module.exports = router;