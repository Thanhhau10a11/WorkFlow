const express = require('express')
const router = express.Router()

const appUserController = require('../../app/controllers/APIController/appUserController.js')
const checkToken = require('../../util/authenticateToken')

const authorize = require('../../util/authorize.js');
router.get('/getAll',checkToken,authorize(['admin']), appUserController.getALl)
router.get('/:id',checkToken ,appUserController.getById)
router.post('/create', checkToken,appUserController.create)
router.post('/update/:id',checkToken, appUserController.update)
router.post('/delete/:id', checkToken,appUserController.delete)
router.get('/', checkToken,appUserController.user)
router.post('/update-info', appUserController.updateUserInfo)



module.exports = router