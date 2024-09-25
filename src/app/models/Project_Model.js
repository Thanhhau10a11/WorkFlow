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
  IDCreator: DataTypes.INTEGER,
  InfoProject: DataTypes.TEXT,
  NameProject: DataTypes.STRING,
  Comment: DataTypes.STRING,
}, {
  tableName: 'project',
  timestamps: false
});

module.exports = Project;
