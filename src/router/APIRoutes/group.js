const express = require('express')
const router = express.Router()

const groupController = require('../../app/controllers/APIController/groupController.js')

router.get('/getAll',groupController.getALl)
router.get('/:id',groupController.getById)
router.get('/get/:id',groupController.getGroupsByIDUser)
router.get('/getMember/:id',groupController.getMemberByGroupID)
router.post('/create',groupController.create)
router.post('/update/:id',groupController.update)
router.post('/delete/:id',groupController.delete)
router.post('/addMember',groupController.addMember)




module.exports = router