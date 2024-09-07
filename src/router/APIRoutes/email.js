const express = require('express')
const router = express.Router()

const emailController = require('../../app/controllers/APIController/emailController.js')

router.post('/:email',emailController.inviteManager)
router.get('/accept-invitation', emailController.acceptInvitation);

module.exports = router