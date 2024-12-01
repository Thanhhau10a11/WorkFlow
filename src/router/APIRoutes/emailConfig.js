const express = require('express')
const router = express.Router()

const emailConfigController = require('../../app/controllers/APIController/emailConfigController.js')

const authToken = require('../../util/authenticateToken.js')

router.get('/', authToken, emailConfigController.getEmailConfig);
router.get('/test', authToken, emailConfigController.testEmailConfig);

router.post('/', emailConfigController.upsertEmailConfig);
router.post('/:id', emailConfigController.deleteEmailConfig);

module.exports = router