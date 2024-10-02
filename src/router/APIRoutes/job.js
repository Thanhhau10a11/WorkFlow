const express = require('express')
const router = express.Router()

const jobController = require('../../app/controllers/APIController/jobController.js')

router.get('/getAll', jobController.getALl)
router.get('/:id', jobController.getById)
router.post('/create', jobController.create)
router.post('/update/:id', jobController.update)
router.post('/delete/:id', jobController.delete)
router.post('/markJobComplete/:JobID', jobController.markJobComplete)

module.exports = router