const express = require('express')
const router = express.Router()

const userWorkFlowController = require('../../app/controllers/APIController/userWorkFlowController.js')

router.get('/:id', userWorkFlowController.getByUserId)
router.get('/getByGroupID/:id', userWorkFlowController.getByGroupId)
router.get('/detail/:id', userWorkFlowController.getStagesByWorkFlowID)
router.post('/saveStageOrder', userWorkFlowController.saveStageOrder)
router.post('/create/:id', userWorkFlowController.createForUser)
router.post('/update/:id/:userId', userWorkFlowController.updateByUserId)
router.post('/delete/:id/:userId', userWorkFlowController.deleteByUserId)


module.exports = router