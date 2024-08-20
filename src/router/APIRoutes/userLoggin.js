const express = require('express')
const router = express.Router()

const userLoggingController = require('../../app/controllers/APIController/userLoggingController')

router.post('/',userLoggingController.login)

module.exports = router