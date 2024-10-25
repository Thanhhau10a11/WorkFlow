const express = require('express')
const router = express.Router()

const stageController = require('../../app/controllers/APIController/stageController.js')
const authorize = require('../../util/authorize.js')

router.get('/getAll',authorize(['admin']), stageController.getALl)
router.get('/:id',authorize(['admin']), stageController.getById)
router.post('/create', authorize(['admin']),stageController.create)
router.post('/update/:id',authorize(['admin']), stageController.update)
router.post('/delete/:id', authorize(['admin']),stageController.delete)


module.exports = router