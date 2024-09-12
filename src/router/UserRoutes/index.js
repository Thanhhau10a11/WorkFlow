const express = require('express');
const router = express.Router();

const checkLogin = require('../../util/checkLogin.js')

const homeRouter = require('./home');
const workFLowRouter = require('./workFlow.js');
const AppUserRouter = require('./appUser.js');
const groupRouter = require('./group.js');


// Sử dụng các router
router.use('/workFlow',checkLogin,workFLowRouter)
router.use('/',checkLogin,homeRouter);
router.use('/appUser',AppUserRouter);
router.use('/group',groupRouter);

module.exports = router;