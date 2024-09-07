const express = require('express')
const router = express.Router()

const appUserController = require('../../app/controllers/APIController/appUserController.js')

router.get('/getAll',appUserController.getALl)
router.get('/:id',appUserController.getById)
router.post('/create',appUserController.create)
router.post('/update/:id',appUserController.update)
router.post('/delete/:id',appUserController.delete)
router.get('/',appUserController.user)
router.post('/update-info',appUserController.updateUserInfo)



module.exports = router