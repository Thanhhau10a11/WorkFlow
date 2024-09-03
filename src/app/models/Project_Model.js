// models/Project.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const Project = sequelize.define('Project', {
  IdProject: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  Progress: DataTypes.STRING,
  IDUser: DataTypes.INTEGER,
  InfoProject: DataTypes.TEXT,
  NameProjectComment: DataTypes.STRING
}, {
  tableName: 'project',
  timestamps: false
});

module.exports = Project;
