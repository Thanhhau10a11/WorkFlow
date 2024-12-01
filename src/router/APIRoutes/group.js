const express = require('express')
const router = express.Router()

const groupController = require('../../app/controllers/APIController/groupController.js')
const checkToken = require('../../util/authenticateToken.js');
const authorize = require('../../util/authorize.js')

//router.get('/getDetailAllGroup/:id',authorize(['admin']), groupController.getDetailAllGroup)
router.get('/getDetailAllGroup/:id', groupController.getDetailAllGroup)
router.get('/getAll', authorize(['admin']),checkToken, groupController.getALl)
router.get('/:id', groupController.getById)
router.get('/get/:id', groupController.getGroupsByIDUser)
router.get('/getMember/:id', groupController.getMemberByGroupID)
router.get('/getDetailInGroup/:GroupID', groupController.getDatailInGroup)
router.post('/removeMember/:GroupID/:IDUser',authorize(['admin']), groupController.removeMember)
router.post('/create',authorize(['admin']), groupController.create)
router.post('/update/:id',authorize(['admin']), groupController.update)
router.post('/delete/:id', authorize(['admin']),groupController.delete)
router.post('/addMember',authorize(['admin']), groupController.addMember)




module.exports = router