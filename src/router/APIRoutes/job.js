const express = require('express')
const router = express.Router()

const jobController = require('../../app/controllers/APIController/jobController.js');
const authorize = require('../../util/authorize.js')

router.get('/getAll', jobController.getALl)
router.get('/getAllJobs', authorize(['admin', 'LeaderGroup', 'user']),jobController.getAllJobs)
router.get('/:id', jobController.getById)
router.get('/', jobController.getById)
router.post('/create', jobController.create)
router.post('/update/:id', jobController.update)
router.post('/delete/:id', jobController.delete)
router.post('/markJobComplete/:JobID', jobController.markJobComplete)
router.post('/createForGroup', jobController.createJobForGroup)


module.exports = router