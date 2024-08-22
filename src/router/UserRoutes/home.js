const express = require('express')
const router = express.Router()

const HomeController = require('../../app/controllers/UserController/HomeController.js')

router.get('/',HomeController.index)



module.exports = router