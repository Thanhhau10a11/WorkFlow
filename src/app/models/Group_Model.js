// models/Group.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');
const AppUser = require('./User_Model');

const Group = sequelize.define('Group', {
  GroupID: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  GroupName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  IDUser: {
    type: DataTypes.INTEGER,
    references: {
      model: AppUser,
      key: 'IDUser'
    }
  }
}, {
  tableName: 'Group',
  timestamps: false
});

module.exports = Group;
