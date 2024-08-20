// models/Stage.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');
const WorkFlow = require('./WorkFlow_Model');

const Stage = sequelize.define('Stage', {
  IdStage: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  NameStage: {
    type: DataTypes.STRING,
    allowNull: false
  },
  DescriptionStatus: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  IDWorkFlow: {
    type: DataTypes.INTEGER,
    references: {
      model: WorkFlow,
      key: 'IDWorkFlow'
    }
  }
}, {
  tableName: 'Stage',
  timestamps: false
});

module.exports = Stage;
