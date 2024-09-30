const express = require('express')
const router = express.Router()

const GroupController = require('../../app/controllers/UserController/GroupController.js')
const authenLogin = require('../../util/checkLogin.js')

router.get('/', GroupController.index)
router.get('/create', GroupController.formCreate)
router.post('/create', GroupController.create)
router.get('/detail/:id', GroupController.detail)
router.get('/addMember/:id', GroupController.formAddMember)

router.post('/removeMember/:GroupID/:IDUser', GroupController.removeMember)

//router.post('/addMember',GroupController.addMember)

module.exports = router