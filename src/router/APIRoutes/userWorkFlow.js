const express = require('express')
const router = express.Router()

const userWorkFlowController = require('../../app/controllers/APIController/userWorkFlowController.js')
const authorize = require('../../util/authorize.js')

router.get('/:id',authorize(['admin']), userWorkFlowController.getByUserId)
router.get('/getByGroupID/:id', userWorkFlowController.getByGroupId)
router.get('/detail/:id', userWorkFlowController.getStagesByWorkFlowID)
router.post('/saveStageOrder',authorize(['admin','LeaderGroup']), userWorkFlowController.saveStageOrder)
router.post('/create/:id', userWorkFlowController.createForUser)
router.post('/update/:id/:userId', authorize(['admin','LeaderGroup']),userWorkFlowController.updateByUserId)
router.post('/delete/:id/:userId',authorize(['admin','LeaderGroup']), userWorkFlowController.deleteByUserId)


module.exports = router