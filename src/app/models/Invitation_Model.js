const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db'); // Đảm bảo đường dẫn đúng với cấu hình của bạn

const Invitation = sequelize.define('Invitation', {
  ID: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  UserID: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  EmailRecipient: {
    type: DataTypes.STRING,
    allowNull: false
  },
  WorkflowID: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  StageID: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  Token: {
    type: DataTypes.STRING,
    allowNull: false
  },
  TokenExpiry: {
    type: DataTypes.DATE,
    allowNull: false
  },
  Status: {
    type: DataTypes.ENUM('pending', 'accepted', 'declined'),
    defaultValue: 'pending',
    allowNull: false
  }
}, {
  tableName: 'invitation',
  timestamps: true // Tạo các trường createdAt và updatedAt
});

module.exports = Invitation;
