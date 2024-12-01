const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const EmailConfig = sequelize.define('EmailConfig', {
  EmailID: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  Email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  Password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  Host: {
    type: DataTypes.STRING,
    defaultValue: 'smtp.gmail.com',
  },
  Port: {
    type: DataTypes.INTEGER,
    defaultValue: 587,
  },
  Secure: {
    type: DataTypes.BOOLEAN,
    defaultValue: false, // false: không dùng SSL/TLS
  },
}, {
  tableName: 'email_config',
  timestamps: true,
});

module.exports = EmailConfig;
