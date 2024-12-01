// const nodemailer = require('nodemailer');

// const transporter = nodemailer.createTransport({
//     service: 'gmail', 
//     auth: {
//         user: process.env.EMAIL, 
//         pass: process.env.EMAIL_PASSWORD
//     }
// });

// module.exports = transporter;
const nodemailer = require('nodemailer');
const {EmailConfig} = require('../../app/models/index'); 

async function createTransporter() {
    try {
        const emailConfig = await EmailConfig.findOne();

        if (!emailConfig) {
            throw new Error('Không tìm thấy cấu hình email.');
        }

        // Tạo transporter với cấu hình đã lưu
        const transporter = nodemailer.createTransport({
            host: emailConfig.Host,
            port: emailConfig.Port,
            secure: emailConfig.Secure, // true cho SSL, false cho không SSL
            auth: {
                user: emailConfig.Email,
                pass: emailConfig.Password
            }
        });

        return transporter;
    } catch (error) {
        console.error('Lỗi khi tạo transporter:', error);
        throw new Error('Không thể tạo transporter');
    }
}

module.exports = createTransporter;
