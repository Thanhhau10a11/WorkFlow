const express = require('express')
const router = express.Router()

const testController = require('../../app/controllers/APIController/testController.js')

router.get('/jobs-with-stages', testController.getJobWithStage)
router.get('/stages-with-job', testController.getStageWithJob)
router.post('/addJobsToStage', testController.addJobsToStage)
router.post('/addJobsToStage2', testController.addJobsToStage2)


module.exports = router