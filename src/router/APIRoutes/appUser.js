const express = require('express')
const router = express.Router()

const appUserController = require('../../app/controllers/APIController/appUserController.js')

router.get('/getAll',appUserController.getALl)
router.get('/:id',appUserController.getById)
router.post('/create',appUserController.create)
router.post('/update/:id',appUserController.update)
router.post('/delete/:id',appUserController.delete)
router.get('/',appUserController.user)


module.exports = router