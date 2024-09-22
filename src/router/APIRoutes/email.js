const express = require('express')
const router = express.Router()

const emailController = require('../../app/controllers/APIController/emailController.js')

router.post('/sendEmailNoti',emailController.sendEmail)
router.post('/:email',emailController.inviteManager)
router.get('/accept-invitation', emailController.acceptInvitation);
router.post('/inviteGroup/:email',emailController.inviteGroup)
router.get('/inviteGroup/accept-invitation', emailController.acceptGroup);


module.exports = router