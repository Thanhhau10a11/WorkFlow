const express = require('express')
const router = express.Router()

const workFlowController = require('../../app/controllers/UserController/workFlowController.js')

router.get('/', workFlowController.index)
router.get('/create/:GroupID', workFlowController.createWorkFLow)
router.get('/detail/:id', workFlowController.detailWorkFlow)



module.exports = router