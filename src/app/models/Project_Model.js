// models/Project.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');
const Job = require('./Job_Model');

const Project = sequelize.define('Project', {
  IdProject: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  Progress: {
    type: DataTypes.STRING,
    allowNull: true
  },
  IDUser: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  IDJob: {
    type: DataTypes.INTEGER,
    references: {
      model: Job,
      key: 'IDJob'
    }
  },
  InfoProject: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  NameProjectComment: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'Project',
  timestamps: false
});

module.exports = Project;
