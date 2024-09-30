const express = require('express')
const router = express.Router()

const projectController = require('../../app/controllers/APIController/projectController.js')

router.get('/getAll', projectController.getALl)
router.get('/getProjectInGroup/:GroupID', projectController.getProjectInGroup)
router.get('/getJobsInGroup/:ProjectID', projectController.getJobsInGroup)
router.get('/:id', projectController.getById)
router.post('/create', projectController.create)
router.post('/createByIdGroup/:GroupID/:IDCreator', projectController.createByIDGroup)
router.post('/updateProgress/:ProjectID',projectController.updateProjectProgress)
router.post('/update/:id', projectController.update)
router.post('/delete/:id', projectController.delete)
router.post('/addJobsToProject', projectController.addJobsToProject)


module.exports = router