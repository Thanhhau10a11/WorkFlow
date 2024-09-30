const express = require('express')
const router = express.Router()

const emailController = require('../../app/controllers/APIController/emailController.js')

const authToken = require('../../util/authenticateToken.js')

router.post('/sendEmailNoti', authToken, emailController.sendEmail)
router.get('/accept-invitation', emailController.acceptGroup);


module.exports = router