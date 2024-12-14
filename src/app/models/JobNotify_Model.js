// models/JobNotify.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const JobNotify = sequelize.define('jobnotify', {
  IDJob: {
    type: DataTypes.INTEGER,
    primaryKey: true
  },
  IDNotify: {
    type: DataTypes.INTEGER,
    primaryKey: true
  }
}, {
  tableName: 'jobnotify',
  timestamps: false
});

module.exports = JobNotify;
