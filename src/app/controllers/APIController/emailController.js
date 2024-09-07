// const nodemailer = require('nodemailer');

// class MailController {
//    sendEmail(req, res) {
//         const email = req.params.email 
//         //const  email = req.body;
//         const name = 'WorkFlow Company'
//         const message = 'Bạn có lời mời tham gia'
//         // Tạo transporter sử dụng Gmail
//         let transporter = nodemailer.createTransport({
//             service: 'gmail',
//             auth: {
//                 user: process.env.EMAIL, 
//                 pass: process.env.EMAIL_PASSWORD
//             }
//         });

//         // Tạo nội dung email
//         let mailOptions = {
//             from: process.env.EMAIL,
//             to: email,
//             subject: 'Thông tin liên hệ từ ' + name, 
//             text: message + '\n\nĐược gửi bởi: ' + process.env.EMAIL
//         };

//         // Gửi email
//         transporter.sendMail(mailOptions)
//             .then(info => {
//                 console.log('Email sent: ' + info.response);
//                 res.status(200).json({message:"Success"})
//             })
//             .catch(error => {
//                 console.log(error);
//                 res.status(500).json({message:"Failed"})
//             });
//     }
// }

// module.exports = new MailController();
const crypto = require('crypto');
const { Op } = require('sequelize');
const { Invitation, AppUser, Workflow, Stage } = require('../../models/index');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

const transporter = require('../../../config/nodemailer/transporter');

class InvitationController {
    async inviteManager(req, res) {
        const { email, workflowId, stageId } = req.body;
        const token = crypto.randomBytes(20).toString('hex');
        const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); 

        try {
            let user = await AppUser.findOne({ where: { Username: email } });

            if (!user) {
                user = await AppUser.create({
                    email: email,
                    role: 'pending', 
                    password: 'password', 
                });
            }

            await Invitation.create({
                UserID: user.IDUser,
                WorkflowID: workflowId,
                StageID: stageId,
                EmailRecipient:email,
                Token: token,
                TokenExpiry: tokenExpiry,
                Status: 'pending'
            });

            const mailOptions = {
                from: process.env.EMAIL,
                to: email,
                subject: 'Invitation to Manage Stage',
                text: `You have been invited to manage a stage in a workflow. Please accept or decline the invitation by clicking the link below:
                http://localhost:3000/api/email/accept-invitation?token=${token}`
            };

            // Gửi email
            await transporter.sendMail(mailOptions);

            res.status(200).json({ message: 'Invitation sent successfully' });
        } catch (error) {
            console.error('Error inviting manager:', error);
            res.status(500).json({ message: 'Failed to send invitation' });
        }
    }

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
    
}

module.exports = new InvitationController();
