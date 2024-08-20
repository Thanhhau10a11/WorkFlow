const express = require('express')
const router = express.Router()

const stageController = require('../../app/controllers/APIController/stageController.js')

router.get('/getAll',stageController.getALl)
router.get('/:id',stageController.getById)
router.post('/create',stageController.create)
router.post('/update/:id',stageController.update)
router.post('/delete/:id',stageController.delete)


module.exports = router