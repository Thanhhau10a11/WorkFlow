
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');
const AppUser = require('./User_Model');
const Group = require('./Group_Model');

const GroupMember = sequelize.define('groupmember', {
  IDUser: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,  // Đánh dấu cột này là khóa chính
    references: {
      model: AppUser,
      key: 'IDUser'
    }
  },
  GroupID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,  // Đánh dấu cột này là khóa chính
    references: {
      model: Group,
      key: 'GroupID'
    }
  },
  Status: {
    type: DataTypes.ENUM('pending', 'accepted', 'declined'),
    defaultValue: 'pending',
    allowNull: false
  },
  Token: {
    type: DataTypes.STRING,
    allowNull: false
  },
  TokenExpiry: {
    type: DataTypes.DATE,
    allowNull: false
  }
}, {
  tableName: 'groupmember',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['IDUser', 'GroupID'] // Đảm bảo rằng chỉ mục duy nhất phản ánh khóa chính kết hợp
    }
  ]
});

module.exports = GroupMember;
