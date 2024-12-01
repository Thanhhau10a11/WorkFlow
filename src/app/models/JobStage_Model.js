const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');
const Job = require('./Job_Model');
const Stage = require('./Stage_Model');

const JobStage = sequelize.define('JobStage', {
  ID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true
  },
  IDJob: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Job,
      key: 'IDJob'
    },
    onUpdate: 'CASCADE',
  },
  IDStage: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Stage,
      key: 'IDStage'
    },
    onUpdate: 'CASCADE',
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'processing',
    validate: {
      isIn: [['processing', 'pending', 'completed', 'submitted', 'canceled', 'archived']]
    }
  },
  progress: {
    type: DataTypes.INTEGER,  
    allowNull: false,        
    defaultValue: 0          
  },
  signatoryId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  attachmentFile: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  attachmentLink: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  submissionDescription: { // Thêm thuộc tính mô tả nộp
    type: DataTypes.TEXT,
    allowNull: true, // Có thể không có mô tả
  },
}, {
  tableName: 'jobstage',
  timestamps: true,
});

module.exports = JobStage;
