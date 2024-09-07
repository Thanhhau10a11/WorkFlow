const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');
const AppUser = require('./User_Model');
const Group = require('./Group_Model');

const GroupMember = sequelize.define('GroupMember', {
  GroupID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Group,
      key: 'GroupID'
    }
  },
  Email: {
    type: DataTypes.STRING(191), 
    allowNull: false,
    references: {
      model: AppUser,
      key: 'Email'
    }
  }
}, {
  tableName: 'GroupMember',
  timestamps: false
});

// Đặt khóa chính cho bảng
GroupMember.primaryKey = ['GroupID', 'Email'];

// Xuất mô hình
module.exports = GroupMember;
