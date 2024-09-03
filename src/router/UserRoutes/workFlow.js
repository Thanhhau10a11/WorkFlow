const express = require('express')
const router = express.Router()

const workFlowController = require('../../app/controllers/UserController/workFlowController.js')

router.get('/',workFlowController.index)



module.exports = router