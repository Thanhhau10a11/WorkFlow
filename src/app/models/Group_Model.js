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
  IDUser: DataTypes.INTEGER,
  IDLeader:DataTypes.INTEGER,
  Description :DataTypes.STRING,
}, {
  tableName: 'group',
  timestamps: true
});

module.exports = Group;
