const { EmailConfig } = require('../../models/index'); // Import model EmailConfig
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

class EmailConfigController {
    // API: Lấy cấu hình email
    async getEmailConfig(req, res) {
        try {
            const emailConfig = await EmailConfig.findOne();
            if (!emailConfig) {
                return res.status(404).json({ message: 'Không tìm thấy cấu hình email.' });
            }
            res.status(200).json(emailConfig);
        } catch (error) {
            console.error('Lỗi khi lấy cấu hình email:', error);
            res.status(500).json({ message: 'Lỗi khi lấy cấu hình email.' });
        }
    }

    // API: Cập nhật hoặc tạo cấu hình email
    async upsertEmailConfig(req, res) {
        const { Email, Password, Host, Port, Secure } = req.body;

        if (!Email || !Password || !Host || !Port) {
            return res.status(400).json({ message: 'Thông tin cấu hình email không đầy đủ.' });
        }

        try {
            // Mã hóa mật khẩu trước khi lưu
           // const hashedPassword = bcrypt.hashSync(Password, 10);

            const [emailConfig, created] = await EmailConfig.upsert({
                Email,
                //Password: hashedPassword,
                Password:Password,
                Host,
                Port,
                Secure,
            });

            const message = created 
                ? 'Cấu hình email đã được tạo thành công.'
                : 'Cấu hình email đã được cập nhật thành công.';

            res.status(200).json({ message, emailConfig });
        } catch (error) {
            console.error('Lỗi khi lưu cấu hình email:', error);
            res.status(500).json({ message: 'Lỗi khi lưu cấu hình email.' });
        }
    }

    // API: Xóa cấu hình email
    async deleteEmailConfig(req, res) {
        const { id } = req.params;

        try {
            const result = await EmailConfig.destroy({ where: { EmailID: id } });

            if (!result) {
                return res.status(404).json({ message: 'Cấu hình email không tồn tại.' });
            }

            res.status(200).json({ message: 'Cấu hình email đã được xóa thành công.' });
        } catch (error) {
            console.error('Lỗi khi xóa cấu hình email:', error);
            res.status(500).json({ message: 'Lỗi khi xóa cấu hình email.' });
        }
    }
    async testEmailConfig(req, res) {
        try {
          // Lấy cấu hình email đầu tiên trong cơ sở dữ liệu
          const config = await EmailConfig.findOne(); 
      
          if (!config) {
            return res.status(400).json({ message: 'No email configuration found' });
          }
      
          // Tạo transporter với cấu hình lấy từ cơ sở dữ liệu
          const transporter = nodemailer.createTransport({
            host: config.Host, 
            port: config.Port,  
            secure: config.Secure,  
            auth: {
              user: config.Email,  
              pass: config.Password,  
            },
          });
      
          // Kiểm tra kết nối với email server
          await transporter.verify();
          res.status(200).json({ message: 'Connection successful' });
        } catch (error) {
          console.error('Error testing email connection:', error);
          res.status(500).json({ message: 'Error testing email connection' });
        }
    }
}

module.exports = new EmailConfigController();
