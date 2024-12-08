const express = require('express');
const router = express.Router();

const checkToken = require('../../util/authenticateToken.js')
const checkLogin = require('../../util/checkLogin.js')

const homeRouter = require('./home');
const workFLowRouter = require('./workFlow.js');
const AppUserRouter = require('./appUser.js');
const groupRouter = require('./group.js');
const projectRouter = require('./project.js');
const jobRouter = require('./job.js');
const configEmailRouter = require('./email.js');
const historyRouter = require('./history.js');



// Sử dụng các router
router.use('/workFlow',checkLogin,  workFLowRouter)
router.use('/group',checkLogin,  groupRouter);
router.use('/appUser', AppUserRouter);
router.use('/',checkLogin, homeRouter);
router.use('/job',checkLogin,  jobRouter);
router.use('/project',checkLogin,  projectRouter);
router.use('/configEmail',checkLogin,  configEmailRouter);
router.use('/history',checkLogin,  historyRouter);


module.exports = router;