// models/Workflow.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const Workflow = sequelize.define('Workflow', {
  IDWorkFlow: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  Name: DataTypes.STRING,
  Description: DataTypes.TEXT,
  IDFollower: DataTypes.INTEGER,
  IDCreator: DataTypes.INTEGER
}, {
  tableName: 'workflow',
  timestamps: false
});

module.exports = Workflow;
