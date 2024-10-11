const express = require('express')
const router = express.Router()

const JobController = require('../../app/controllers/UserController/JobController.js')

router.get('/', JobController.index)



module.exports = router