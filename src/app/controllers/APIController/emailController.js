
const crypto = require('crypto');
const { Op } = require('sequelize');
const { Invitation, AppUser, Workflow, Stage, Group, GroupMember } = require('../../models/index');
const bcrypt = require('bcryptjs');
const { sendEmail } = require('../../../util/emailUtils')
const jwt = require('jsonwebtoken')

const sendEmailNoti = require('../../../util/mailServices')

class InvitationController {


    // async acceptGroup(req, res) {
    //     const { token } = req.query;

    //     try {
    //         const invitation = await GroupMember.findOne({
    //             where: {
    //                 Token: token,
    //                 TokenExpiry: { [Op.gt]: new Date() }, 
    //                 //Status: 'pending'
    //             }
    //         });

    //         if (!invitation) {
    //             return res.status(400).json({ message: 'Invalid or expired invitation' });
    //         }

    //         const email = invitation.Email;
    //         invitation.Status = 'accepted';
    //         await invitation.save();

    //         res.redirect(`http://localhost:3000/appUser/update-info?email=${encodeURIComponent(email)}`);
    //     } catch (error) {
    //         console.error('Error accepting invitation:', error);
    //         res.status(500).json({ message: 'Failed to accept invitation' });
    //     }
    // }
    async acceptGroup(req, res) {
        const { token } = req.query;

        if (!token) {
            console.log("Không có token trong query");
            return res.status(400).json({ message: 'Token không được cung cấp' });
        }

        try {
            const invitation = await GroupMember.findOne({
                where: {
                    Token: token,
                    TokenExpiry: { [Op.gt]: new Date() },
                }
            });

            if (!invitation) {
                console.log("Lời mời không hợp lệ hoặc đã hết hạn");
                return res.status(400).json({ message: 'Invalid or expired invitation' });
            }
            const user = await AppUser.findOne({ where: { IDUser: invitation.IDUser } });

            const email = user.Username;
            invitation.Status = 'accepted';
            await invitation.save();

            const authToken = jwt.sign({ email: email }, process.env.JWT_SECRET, { expiresIn: '24h' });

            //res.redirect(`http://localhost:3000/appUser/update-info?email=${encodeURIComponent(email)}&token=${authToken}`);
            res.redirect(`${process.env.DOMAIN}/appUser/update-info?email=${encodeURIComponent(email)}&token=${authToken}`);
        } catch (error) {
            console.error('Error accepting invitation:', error);
            res.status(500).json({ message: 'Failed to accept invitation' });
        }
    }
    // async sendEmail(req, res) {
    //     const { email, type, username, stageName, groupName, token } = req.body;

    //     try {
    //         let subject, template, context;

    //         if (type === 'stage') {
    //             subject = 'Thông báo nhận stage';
    //             template = 'stageNotification';
    //             context = { username, stageName };
    //         } else if (type === 'group') {
    //             subject = 'Thông báo thêm vào group';
    //             template = 'groupNotification';
    //             context = { username, groupName };
    //         } else if (type === 'invite') {  
    //             subject = 'Thông báo thêm vào group';
    //             template = 'inviteGroup';
    //             context = { 
    //                 username, 
    //                 groupName, 
    //                 inviteLink: `http://localhost:3000/api/email/inviteGroup/accept-invitation?token=${token}` 
    //             };
    //         } else {
    //             return res.status(400).json({ message: 'Loại email không hợp lệ.' });
    //         }

    //         await sendEmailNoti(email, subject, template, context);
    //         res.status(200).json({ message: 'Email đã được gửi thành công!' });
    //     } catch (error) {
    //         console.error('Lỗi khi gửi email:', error);
    //         res.status(500).json({ message: 'Lỗi khi gửi email.' });
    //     }
    // }
    async sendEmail(req, res) {
        const { email, type, username, stageName, groupName, token } = req.body;

        try {
            let subject, template, context;

            // Tạo token JWT

            if (type === 'stage') {
                subject = 'Thông báo nhận stage';
                template = 'stageNotification';
                context = { username, stageName };
            } else if (type === 'group') {
                subject = 'Thông báo thêm vào group';
                template = 'groupNotification';
                context = { username, groupName };
            } else if (type === 'invite') {
                subject = 'Thông báo thêm vào group';
                template = 'inviteGroup';
                context = {
                    username,
                    groupName,
                    //inviteLink: `http://localhost:3000/api/email/accept-invitation?token=${token}`
                    inviteLink: `${process.env.DOMAIN}/api/email/accept-invitation?token=${token}`
                };
            } else {
                return res.status(400).json({ message: 'Loại email không hợp lệ.' });
            }

            await sendEmailNoti(email, subject, template, context);
            res.status(200).json({ message: 'Email đã được gửi thành công!' });
        } catch (error) {
            console.error('Lỗi khi gửi email:', error);
            res.status(500).json({ message: 'Lỗi khi gửi email.' });
        }
    }
}

module.exports = new InvitationController();
