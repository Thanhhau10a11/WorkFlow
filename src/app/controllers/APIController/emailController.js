const nodemailer = require('nodemailer');

class MailController {
   sendEmail(req, res) {
        const email = req.params.email 
        //const  email = req.body;
        const name = 'WorkFlow Company'
        const message = 'Bạn có lời mời tham gia'
        // Tạo transporter sử dụng Gmail
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL, 
                pass: process.env.EMAIL_PASSWORD
            }
        });

        // Tạo nội dung email
        let mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: 'Thông tin liên hệ từ ' + name, 
            text: message + '\n\nĐược gửi bởi: ' + process.env.EMAIL
        };

        // Gửi email
        transporter.sendMail(mailOptions)
            .then(info => {
                console.log('Email sent: ' + info.response);
                res.status(200).json({message:"Success"})
            })
            .catch(error => {
                console.log(error);
                res.status(500).json({message:"Failed"})
            });
    }
}

module.exports = new MailController();
// const nodemailer = require('nodemailer');

// class MailController {
//    sendEmail(req, res) {
//         const workflowId = 1
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
//             subject: 'Mời tham gia Workflow',
//             text: `Bạn đã được mời tham gia workflow. Vui lòng chấp nhận hoặc từ chối lời mời qua liên kết sau: 
//             http://your-domain.com/join-workflow?workflowId=${workflowId}&action=accept`
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
//     joinWorkFLow (req,res){
//         const { workflowId, action, token } = req.query;

//         if (!workflowId || !action) {
//             return res.status(400).send('Thiếu thông tin.');
//         }

//         if (action === 'accept') {
//             try {
//                 // // Tạo tài khoản cho người quản lý (nếu chưa có) và thêm vào workflow
//                 // await createAccountForManager(req.query.email);
//                 // await addManagerToWorkflow(workflowId, req.query.email);

//                 // Thông báo cho người tạo
//                 //const creatorEmail = await getWorkflowCreatorEmail(workflowId);
//                 notifyCreator(creatorEmail, 'accept', req.query.email);

//                 res.send('Bạn đã chấp nhận lời mời. Tài khoản của bạn đã được tạo và bạn đã được thêm vào workflow.');
//             } catch (error) {
//                 console.error('Error processing acceptance:', error);
//                 res.status(500).send('Có lỗi xảy ra khi xử lý yêu cầu.');
//             }
//         } else if (action === 'decline') {
//             // Thông báo cho người tạo
//             const creatorEmail = await getWorkflowCreatorEmail(workflowId);
//             notifyCreator(creatorEmail, 'decline', req.query.email);

//             res.send('Bạn đã từ chối lời mời.');
//         } else {
//             res.status(400).send('Hành động không hợp lệ.');
//         }
//     }
// }

// module.exports = new MailController();
