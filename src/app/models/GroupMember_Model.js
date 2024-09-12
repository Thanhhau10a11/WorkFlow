// const { DataTypes } = require('sequelize');
// const sequelize = require('../../config/db');
// const AppUser = require('./User_Model');
// const Group = require('./Group_Model');

// const GroupMember = sequelize.define('GroupMember', {
//   IDUser: {
//     type: DataTypes.INTEGER,
//     allowNull: false,
//     references: {
//       model: AppUser,
//       key: 'IDUser'  // Chỉnh lại key từ 'Username' thành 'IDUser'
//     }
//   },
//   GroupID: {
//     type: DataTypes.INTEGER,
//     allowNull: false,
//     references: {
//       model: Group,
//       key: 'GroupID'
//     }
//   },
//   Status: {
//     type: DataTypes.ENUM('pending', 'accepted', 'declined'),
//     defaultValue: 'pending',
//     allowNull: false
//   },
//   Token: {
//     type: DataTypes.STRING,
//     allowNull: false
//   },
//   TokenExpiry: {
//     type: DataTypes.DATE,
//     allowNull: false
//   }
// }, {
//   tableName: 'GroupMember',
//   timestamps: false,
//   indexes: [
//     {
//       unique: true,
//       fields: ['IDUser', 'GroupID'] 
//     }
//   ]
// });

// // Đặt khóa chính cho mô hình
// GroupMember.primaryKey = ['IDUser', 'GroupID'];

// module.exports = GroupMember;
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');
const AppUser = require('./User_Model');
const Group = require('./Group_Model');

const GroupMember = sequelize.define('GroupMember', {
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
  tableName: 'GroupMember',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['IDUser', 'GroupID'] // Đảm bảo rằng chỉ mục duy nhất phản ánh khóa chính kết hợp
    }
  ]
});

module.exports = GroupMember;
