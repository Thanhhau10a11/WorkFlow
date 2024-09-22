const nodemailer = require('nodemailer');
const path = require('path');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Sử dụng dynamic import và lấy default từ module
const setupEmailTemplates = async () => {
  const hbsModule = await import('nodemailer-express-handlebars');
  const hbs = hbsModule.default;  // Lấy default từ module

  console.log(path.resolve('./src/resources/tempalates'));
  transporter.use(
    'compile',
    hbs({
      viewEngine: {
        extName: '.hbs',
        partialsDir: path.resolve('./src/resources/tempalates'),
        defaultLayout: false,
      },
      viewPath: path.resolve('./src/resources/templates'),
      extName: '.hbs',
    })
  );
};

// Hàm gửi email
const sendEmail = async (to, subject, template, context) => {
  try {
    await setupEmailTemplates();

    await transporter.sendMail({
      from: '"WorkFlow WebSite" <email@gmail.com>',
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
