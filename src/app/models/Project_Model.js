// models/Project.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');
const Group = require('./Group_Model')

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
  GroupID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Group, 
      key: 'GroupID'
    }
  },
  isDefault: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
}
}, {
  tableName: 'project',
  timestamps: true
});

module.exports = Project;
