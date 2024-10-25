const express = require('express')
const router = express.Router()

const userLogoutController = require('../app/controllers/userLogoutController')

router.get('/', userLogoutController.index)


module.exports = router