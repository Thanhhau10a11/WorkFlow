const express = require('express')
const router = express.Router()

const commonController = require('../../app/controllers/APIController/commonController.js')

router.get('/getJobStatistics', commonController.getJobStatistics)

module.exports = router