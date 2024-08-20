const express = require('express');
const router = express.Router();


const userLogginRouter = require('./userLoggin');
const userRegisterRouter = require('./userRegister');
const appUserRegisterRouter = require('./appUser');
const notifyRouter = require('./notify');
const workFlowRouter = require('./workFlow');
const stageRouter = require('./stage');
const jobRouter = require('./job');
const projectRouter = require('./project');
const groupRouter = require('./group');

// Sử dụng các router

router.use('/login', userLogginRouter);
router.use('/register', userRegisterRouter);
router.use('/appUser',appUserRegisterRouter);
router.use('/notify',notifyRouter);
router.use('/workFlow',workFlowRouter);
router.use('/stage',stageRouter);
router.use('/job',jobRouter);
router.use('/project',projectRouter);
router.use('/group',groupRouter);


module.exports = router;