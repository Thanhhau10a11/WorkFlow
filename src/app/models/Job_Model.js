const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const Job = sequelize.define('Job', {
  IDJob: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  Status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'pending', 
    validate: {
      isIn: [['pending', 'completed', 'canceled']] 
    }
  },
  IDUserAssign: DataTypes.INTEGER,
  IDCreator: DataTypes.INTEGER,
  TimeComplete: DataTypes.DATE,
  TimeStart: DataTypes.DATE,
  DescriptionJob: DataTypes.STRING,
  approximateTime: DataTypes.DATE,
  NameJob: DataTypes.STRING,
  IDPriorityLevel: DataTypes.INTEGER,
  Priority: DataTypes.STRING,
  IDListFollower: DataTypes.STRING,
  IDProject: DataTypes.INTEGER
}, {
  tableName: 'job',
  timestamps: false
});

module.exports = Job;
