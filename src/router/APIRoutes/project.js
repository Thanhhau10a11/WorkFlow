const express = require('express')
const router = express.Router()

const projectController = require('../../app/controllers/APIController/projectController.js')
const authorize = require('../../util/authorize.js')


router.get('/getAll', authorize(['admin']),projectController.getALl)
router.get('/getProjectInGroup/:GroupID', projectController.getProjectInGroup)
router.get('/getJobsInGroup/:ProjectID', projectController.getJobsInGroup)
router.get('/:id', projectController.getById)
router.post('/create', authorize(['admin','LeaderGroup']),projectController.create)
router.post('/createByIdGroup/:GroupID/:IDCreator', authorize(['admin','LeaderGroup']),projectController.createByIDGroup)
router.post('/updateProgress/:ProjectID',projectController.updateProjectProgress)
router.post('/update/:id', authorize(['admin','LeaderGroup']),projectController.update)
router.post('/delete/:id', authorize(['admin','LeaderGroup']),projectController.delete)
router.post('/addJobsToProject',  authorize(['admin','LeaderGroup']),projectController.addJobsToProject)


module.exports = router