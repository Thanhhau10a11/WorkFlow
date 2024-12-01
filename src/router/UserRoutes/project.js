const express = require('express')
const router = express.Router()

const ProjectController = require('../../app/controllers/UserController/Project.js')

router.post('/create/:GroupID', ProjectController.createProject)

router.get('/detail/:ProjectID',ProjectController.detail)


module.exports = router