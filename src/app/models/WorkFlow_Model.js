// models/WorkFlow.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');
const AppUser = require('./User_Model');

const WorkFlow = sequelize.define('WorkFlow', {
  IDWorkFlow: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  Name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  Description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  IDUser: {
    type: DataTypes.INTEGER,
    references: {
      model: AppUser,
      key: 'IDUser'
    }
  }
}, {
  tableName: 'WorkFlow',
  timestamps: false
});

module.exports = WorkFlow;
