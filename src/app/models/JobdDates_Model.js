// models/JobDates.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const JobDates = sequelize.define('jobdates', {
  IDJob: {
    type: DataTypes.INTEGER,
    primaryKey: true
  },
  IDDate: {
    type: DataTypes.INTEGER,
    primaryKey: true
  }
}, {
  tableName: 'jobdates',
  timestamps: false
});

module.exports = JobDates;
