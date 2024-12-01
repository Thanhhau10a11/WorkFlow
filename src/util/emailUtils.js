// const nodemailer = require('nodemailer');
// const transporter = require('../config/nodemailer/transporter');

// // Hàm gửi email
// async function sendEmail(to, subject, text) {
//     const mailOptions = {
//         from: process.env.EMAIL,
//         to: to,
//         subject: subject,
//         text: text,
//     };

//     try {
//         await transporter.sendMail(mailOptions);
//         console.log('Email sent successfully');
//         return true;
//     } catch (error) {
//         console.error('Error sending email:', error);
//         return false;
//     }
// }


// module.exports = {
//     sendEmail,
// };

const createTransporter = require('../config/nodemailer/transporter');

// Hàm gửi email
async function sendEmail(to, subject, text) {
    try {
        // Tạo transporter từ cấu hình trong cơ sở dữ liệu
        const transporter = await createTransporter();

        const mailOptions = {
            from: `"Hệ thống quản lý" <no-reply@example.com>`, 
            to: to,
            subject: subject,
            text: text,
        };

        // Gửi email
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully');
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
}

module.exports = {
    sendEmail,
};
