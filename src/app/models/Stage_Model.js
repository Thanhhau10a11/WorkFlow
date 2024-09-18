// models/Stage.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const Stage = sequelize.define('Stage', {
  IdStage: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  NameStage: DataTypes.STRING,
  DescriptionStatus: DataTypes.TEXT,
  IDWorkFlow: DataTypes.INTEGER,
  previousStage: DataTypes.INTEGER,
  nextStage: DataTypes.INTEGER,
  reviewer: DataTypes.STRING,
  statusStage: DataTypes.STRING,
  approximateTime: DataTypes.DATE,
  timecompletedState: DataTypes.DATE,
  IDRecipient: DataTypes.INTEGER,
  EmailRecipient:DataTypes.STRING
}, {
  tableName: 'stage',
  timestamps: true
});

module.exports = Stage;
