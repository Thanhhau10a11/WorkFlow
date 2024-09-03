// models/Group.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const Group = sequelize.define('Group', {
  GroupID: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  GroupName: DataTypes.STRING,
  IDUser: DataTypes.INTEGER
}, {
  tableName: 'group',
  timestamps: false
});

module.exports = Group;
