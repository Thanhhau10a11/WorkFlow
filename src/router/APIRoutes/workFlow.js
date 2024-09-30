const express = require('express')
const router = express.Router()

const workFlowController = require('../../app/controllers/APIController/workFlowController.js')

router.get('/getAll', workFlowController.getALl)
router.get('/:id', workFlowController.getById)
router.post('/create', workFlowController.create)
router.post('/update/:id', workFlowController.update)
router.post('/delete/:id', workFlowController.delete)
router.post('/saveWorkFLow', workFlowController.saveWorkFLow)
router.post('/saveStages/:id', workFlowController.saveStageByWorkFlowID)



module.exports = router