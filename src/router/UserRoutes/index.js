const express = require('express');
const router = express.Router();

const checkLogin = require('../../util/checkLogin.js')
const checkToken = require('../../util/authenticateToken.js')

const homeRouter = require('./home');
const workFLowRouter = require('./workFlow.js');
const AppUserRouter = require('./appUser.js');
const groupRouter = require('./group.js');


// Sử dụng các router
router.use('/workFlow',checkLogin,workFLowRouter)
router.use('/',checkLogin,homeRouter);
router.use('/appUser',checkLogin,AppUserRouter);
router.use('/group',checkLogin,groupRouter);

module.exports = router;