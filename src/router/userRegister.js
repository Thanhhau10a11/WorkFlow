const express = require('express')
const router = express.Router()

const userRegisterController = require('../app/controllers/userRegisterController')

//router.post('/',userRegisterController.register)
router.get('/',userRegisterController.index)


module.exports = router