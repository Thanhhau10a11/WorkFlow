const express = require('express')
const router = express.Router()

const userLoggingController = require('../app/controllers/userLoggingController')

router.get('/',userLoggingController.index)
//router.post('/',userLoggingController.login)


module.exports = router