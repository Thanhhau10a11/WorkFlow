// models/JobNotify.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');
const Job = require('./Job_Model');
const Notify = require('./Notify_Model');

const JobNotify = sequelize.define('JobNotify', {
  IDJob: {
    type: DataTypes.INTEGER,
    references: {
      model: Job,
      key: 'IDJob'
    },
    primaryKey: true
  },
  IDNotify: {
    type: DataTypes.INTEGER,
    references: {
      model: Notify,
      key: 'IDNotify'
    },
    primaryKey: true
  }
}, {
  tableName: 'JobNotify',
  timestamps: false
});

module.exports = JobNotify;
