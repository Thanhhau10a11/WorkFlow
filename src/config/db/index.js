
const { Sequelize } = require('sequelize');

// Tạo kết nối Sequelize
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'mysql',
  port: process.env.DB_PORT || 3306, 
  logging: false // Tắt logging SQL query (có thể bật lên để debug)
});

// Kiểm tra kết nối
sequelize.authenticate()
  .then(() => {
    console.log('Kết nối đến cơ sở dữ liệu MySQL thành công.');
  })
  .catch(err => {
    console.error('Lỗi kết nối đến cơ sở dữ liệu:', err);
  });

module.exports = sequelize;
