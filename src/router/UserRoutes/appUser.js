const express = require('express')
const router = express.Router()

const AppUserController = require('../../app/controllers/UserController/AppUserController.js')
const authenLogin = require('../../util/checkLogin.js')

router.get('/update-info',AppUserController.index)

module.exports = router