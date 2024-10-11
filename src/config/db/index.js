
const { Sequelize } = require('sequelize');
require('dotenv').config(); 
// Tạo kết nối Sequelize

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'mysql',
  port: process.env.DB_PORT || 3306, 
  logging: false 
});

// Kiểm tra kết nối và đồng bộ hóa cơ sở dữ liệu
sequelize.authenticate()
  .then(() => {
    console.log('Kết nối đến cơ sở dữ liệu MySQL thành công.');
    // Đồng bộ hóa cơ sở dữ liệu
    return sequelize.sync({ force: false,alter:true}); // Hoặc sử dụng { force: true } nếu muốn xóa và tạo lại bảng { alter: true } khong tao lai
  })
  .then(() => {
    console.log('Cơ sở dữ liệu đã được đồng bộ hóa.');
  })
  .catch(err => {
    console.error('Lỗi đồng bộ hóa cơ sở dữ liệu:', err);
  });

module.exports = sequelize;
