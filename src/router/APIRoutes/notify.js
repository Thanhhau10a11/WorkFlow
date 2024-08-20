const express = require('express')
const router = express.Router()

const notifyController = require('../../app/controllers/APIController/notifyController.js')

router.get('/getAll',notifyController.getALl)
router.get('/:id',notifyController.getById)
router.post('/create',notifyController.create)
router.post('/update/:id',notifyController.update)
router.post('/delete/:id',notifyController.delete)


module.exports = router