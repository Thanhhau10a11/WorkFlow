const express = require('express');
const router = express.Router();

const checkToken = require('../../util/authenticateToken')

const userLogginRouter = require('./userLoggin');
const userRegisterRouter = require('./userRegister');
const appUserRouter = require('./appUser');
const notifyRouter = require('./notify');
const workFlowRouter = require('./workFlow');
const stageRouter = require('./stage');
const jobRouter = require('./job');
const projectRouter = require('./project');
const groupRouter = require('./group');
const userWorkFlowRouter = require('./userWorkFlow');
const emailRouter = require('./email');

// Sử dụng các router

router.use('/login', userLogginRouter);
router.use('/register',userRegisterRouter);
router.use('/appUser',checkToken,appUserRouter);
router.use('/notify',checkToken,notifyRouter);
router.use('/workFlow',checkToken,workFlowRouter);
router.use('/stage',checkToken,stageRouter);
router.use('/job',checkToken,jobRouter);
router.use('/project',checkToken,projectRouter);
router.use('/group',checkToken,groupRouter);
router.use('/userWorkFlow',checkToken,userWorkFlowRouter);
router.use('/email',checkToken,emailRouter);


module.exports = router;