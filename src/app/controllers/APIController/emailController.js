
const crypto = require('crypto');
const { Op } = require('sequelize');
const { Invitation, AppUser, Workflow, Stage, Group, GroupMember } = require('../../models/index');
const bcrypt = require('bcryptjs');
const {sendEmail} = require('../../../util/emailUtils')

const sendEmailNoti = require('../../../util/mailServices')

class InvitationController {
    // đang được thay thế bằng api khác
    async inviteManager(req, res) {
        const { email, workflowId, stageId } = req.body;
        const token = crypto.randomBytes(20).toString('hex');
        const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); 

        try {
            let user = await AppUser.findOne({ where: { Username: email } });

            await Invitation.create({
                UserID: user.IDUser,
                WorkflowID: workflowId,
                StageID: stageId,
                EmailRecipient: email,
                Token: token,
                TokenExpiry: tokenExpiry,
                Status: 'pending'
            });

            // Gọi hàm tiện ích để gửi email
            const emailSent = await sendEmail(
                email,
                'Invitation to Manage Stage',
                `You have been invited to manage a stage in a workflow. Please accept or decline the invitation by clicking the link below:
                http://localhost:3000/api/email/accept-invitation?token=${token}`
            );

            if (emailSent) {
                res.status(200).json({ message: 'Invitation sent successfully' });
            } else {
                res.status(500).json({ message: 'Failed to send email' });
            }
        } catch (error) {
            console.error('Error inviting manager:', error);
            res.status(500).json({ message: 'Failed to send invitation' });
        }
    }
    //đang được thay thế bằng api khác 
    async acceptInvitation(req, res) {
        const { token } = req.query;
    
        try {
            const invitation = await Invitation.findOne({
                where: {
                    Token: token,
                    TokenExpiry: { [Op.gt]: new Date() },
                    Status: 'pending'
                },
                include: [
                    { model: Workflow, as: 'Workflow' },
                    { model: Stage, as: 'Stage' }
                ]
            });
    
            if (!invitation) {
                return res.status(400).json({ message: 'Invalid or expired invitation' });
            }
    
            invitation.Status = 'accepted';
            await invitation.save();
    
            let user = await AppUser.findOne({
                where: {
                    Username: invitation.EmailRecipient // Sử dụng email từ lời mời để tìm người dùng
                }
            });
    
            if (!user) {
                const defaultPassword = process.env.DEFAULT_PASSWORD; 
                const hashedPassword = await bcrypt.hash(defaultPassword, 10); 
    
                user = await AppUser.create({
                    Username: invitation.EmailRecipient, // Sử dụng email từ lời mời
                    Password: hashedPassword, // Mật khẩu đã mã hóa
                    // role: 'manager', // Gán vai trò nếu cần
                    // Thêm thông tin khác nếu cần
                });
            }
    
            // const stage = invitation.Stage;
            // await StageUser.create({
            //     userId: user.id,
            //     stageId: stage.id,
            //     role: 'manager' 
            // });
    
           // res.redirect('http://localhost:3000/'); 
           res.redirect(`http://localhost:3000/appUser/update-info?email=${encodeURIComponent(invitation.EmailRecipient)}&token=${token}`);
    
        } catch (error) {
            console.error('Error accepting invitation:', error); 
            res.status(500).json({ message: 'Failed to accept invitation' });
        }
    }
    async inviteGroup(req,res) {
        const { email, token } = req.body;
        
        try {
            const emailSent = await sendEmail(
                email,
                'Invitation to Group',
                `You have been invited to Group. Please accept or decline the invitation by clicking the link below:
                http://localhost:3000/api/email/inviteGroup/accept-invitation?token=${token}`
            );

            if (emailSent) {
                res.status(200).json({ message: 'Invitation sent successfully' });
            } else {
                res.status(500).json({ message: 'Failed to send email' });
            }
        } catch (error) {
            console.error('Error inviting to group:', error);
            res.status(500).json({ message: 'Failed to invite to group' });
        }
    }
    async acceptGroup(req, res) {
        const { token } = req.query;
    
        try {
            const invitation = await GroupMember.findOne({
                where: {
                    Token: token,
                    TokenExpiry: { [Op.gt]: new Date() }, 
                    //Status: 'pending'
                }
            });
    
            if (!invitation) {
                return res.status(400).json({ message: 'Invalid or expired invitation' });
            }
    
            const email = invitation.Email;
            invitation.Status = 'accepted';
            await invitation.save();
    
            res.redirect(`http://localhost:3000/appUser/update-info?email=${encodeURIComponent(email)}`);
        } catch (error) {
            console.error('Error accepting invitation:', error);
            res.status(500).json({ message: 'Failed to accept invitation' });
        }
    }




    async sendEmail(req, res) {
        const { email, type, username, stageName, groupName, token } = req.body;
    
        try {
            let subject, template, context;
    
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
                    inviteLink: `http://localhost:3000/api/email/inviteGroup/accept-invitation?token=${token}` 
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
