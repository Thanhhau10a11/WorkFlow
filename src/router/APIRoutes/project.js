const express = require('express')
const router = express.Router()

const projectController = require('../../app/controllers/APIController/projectController.js')

router.get('/getAll',projectController.getALl)
router.get('/:id',projectController.getById)
router.post('/create',projectController.create)
router.post('/update/:id',projectController.update)
router.post('/delete/:id',projectController.delete)


module.exports = router