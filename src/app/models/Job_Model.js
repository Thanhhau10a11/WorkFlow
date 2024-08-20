// models/Job.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');
const Stage = require('./Stage_Model');
const AppUser = require('./User_Model');

const Job = sequelize.define('Job', {
  IDJob: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  IDStage: {
    type: DataTypes.INTEGER,
    references: {
      model: Stage,
      key: 'IdStage'
    }
  },
  Status: {
    type: DataTypes.STRING,
    allowNull: true
  },
  IDUser: {
    type: DataTypes.INTEGER,
    references: {
      model: AppUser,
      key: 'IDUser'
    }
  },
  IDCreator: {
    type: DataTypes.INTEGER,
    references: {
      model: AppUser,
      key: 'IDUser'
    }
  },
  TimeComplete: {
    type: DataTypes.DATE,
    allowNull: true
  },
  TimeStart: {
    type: DataTypes.DATE,
    allowNull: true
  },
  DescriptionJob: {
    type: DataTypes.STRING,
    allowNull: true
  },
  NameJob: {
    type: DataTypes.STRING,
    allowNull: true
  },
  IDPriorityLevel: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  Priority: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'Job',
  timestamps: false
});

module.exports = Job;
