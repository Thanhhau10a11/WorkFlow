// models/JobStage.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');
const Job = require('./Job_Model');
const Stage = require('./Stage_Model');

const JobStage = sequelize.define('JobStage', {
  IDJob: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,  // Đánh dấu cột này là khóa chính
    references: {
      model: Job,
      key: 'IDJob'
    }
  },
  IDStage: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,  // Đánh dấu cột này là khóa chính
    references: {
      model: Stage,
      key: 'IdStage'
    }
  }
}, {
  tableName: 'jobstage',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['IDJob', 'IDStage'] // Đảm bảo rằng chỉ mục duy nhất phản ánh khóa chính kết hợp
    }
  ]
});

module.exports = JobStage;
