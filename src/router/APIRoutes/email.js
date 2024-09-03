const express = require('express')
const router = express.Router()

const emailController = require('../../app/controllers/APIController/emailController.js')

router.post('/:email',emailController.sendEmail)
//router.get('/join-workflow',emailController.joinWorkFLow)

// router.get('/getAll',emailController.getALl)
// router.get('/:id',emailController.getById)
// router.post('/create',emailController.create)
// router.post('/update/:id',emailController.update)
// router.post('/delete/:id',emailController.delete)


module.exports = router