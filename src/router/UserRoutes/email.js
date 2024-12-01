const express = require('express')
const router = express.Router()

const configEmailController = require('../../app/controllers/UserController/configEmailController.js')

router.get('/', configEmailController.index)

module.exports = router