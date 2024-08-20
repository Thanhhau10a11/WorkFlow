const express = require('express')
const router = express.Router()

const userRegisterController = require('../../app/controllers/APIController/userRegisterController')

router.post('/',userRegisterController.register)

module.exports = router