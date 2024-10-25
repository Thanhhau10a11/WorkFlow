const express = require('express')
const router = express.Router()

const workFlowController = require('../../app/controllers/APIController/workFlowController.js')
const authorize = require('../../util/authorize.js')


router.get('/getAll',  authorize(['admin']),workFlowController.getALl)
router.get('/:id', workFlowController.getById)
router.get('/:GroupID/WorkFlows', workFlowController.getWorkflowsInGroup)

router.post('/create',  authorize(['admin','LeaderGroup']),workFlowController.create)
router.post('/createWorkFLow', authorize(['admin','LeaderGroup']), workFlowController.createForGroup)
router.post('/update/:id',authorize(['admin','LeaderGroup']), workFlowController.update)
router.post('/delete/:id',authorize(['admin','LeaderGroup']), workFlowController.delete)
router.post('/saveWorkFLow',authorize(['admin','LeaderGroup']), workFlowController.saveWorkFLow)
router.post('/saveStages/:id',authorize(['admin','LeaderGroup']), workFlowController.saveStageByWorkFlowID)



module.exports = router