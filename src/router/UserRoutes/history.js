const express = require('express')
const router = express.Router()

const HistoryController = require('../../app/controllers/UserController/HistoryController.js')

router.get('/', HistoryController.index)



module.exports = router