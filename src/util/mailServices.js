// const nodemailer = require('nodemailer');
// const path = require('path');

// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: process.env.EMAIL,
//     pass: process.env.EMAIL_PASSWORD,
//   },
// });

// // Sử dụng dynamic import và lấy default từ module
// const setupEmailTemplates = async () => {
//   const hbsModule = await import('nodemailer-express-handlebars');
//   const hbs = hbsModule.default;  // Lấy default từ module

//   console.log(path.resolve('./src/resources/tempalates'));
//   transporter.use(
//     'compile',
//     hbs({
//       viewEngine: {
//         extName: '.hbs',
//         partialsDir: path.resolve('./src/resources/tempalates'),
//         defaultLayout: false,
//       },
//       viewPath: path.resolve('./src/resources/templates'),
//       extName: '.hbs',
//     })
//   );
// };

// // Hàm gửi email
// const sendEmail = async (to, subject, template, context) => {
//   try {
//     await setupEmailTemplates();
//     await transporter.sendMail({
//       from: '"WorkFlow WebSite" <email@gmail.com>',
//       to,
//       subject,
//       template,
//       context,
//     });
//     console.log('Email sent successfully!');
//   } catch (error) {
//     console.error('Error sending email:', error);
//   }
// };

// module.exports = sendEmail;

const path = require('path');
const createTransporter = require('../config/nodemailer/transporter'); // Đảm bảo đúng đường dẫn

// Import dynamic để xử lý templates
const setupEmailTemplates = async (transporter) => {
    const hbsModule = await import('nodemailer-express-handlebars');
    const hbs = hbsModule.default; // Lấy default từ module

    transporter.use(
        'compile',
        hbs({
            viewEngine: {
                extName: '.hbs',
                partialsDir: path.resolve('./src/resources/templates'), // Đảm bảo đúng thư mục template của bạn
                defaultLayout: false,
            },
            viewPath: path.resolve('./src/resources/templates'), // Đảm bảo đúng thư mục template của bạn
            extName: '.hbs',
        })
    );
};

// Hàm gửi email
const sendEmail = async (to, subject, template, context) => {
    try {
        // Lấy transporter từ cấu hình cơ sở dữ liệu
        const transporter = await createTransporter();

        // Setup templates cho transporter
        await setupEmailTemplates(transporter);

        // Gửi email
        await transporter.sendMail({
            from: '"WorkFlow WebSite" <no-reply@example.com>', // Thay đổi tùy theo yêu cầu
            to,
            subject,
            template,
            context,
        });

        console.log('Email sent successfully!');
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

module.exports = sendEmail;