const express = require('express')
const router = express.Router()

const groupController = require('../../app/controllers/APIController/groupController.js')

router.get('/getAll',groupController.getALl)
router.get('/:id',groupController.getById)
router.post('/create',groupController.create)
router.post('/update/:id',groupController.update)
router.post('/delete/:id',groupController.delete)


module.exports = router