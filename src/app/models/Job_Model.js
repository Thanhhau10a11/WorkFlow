const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const Job = sequelize.define('job', {
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
  // IDUserPerform: { // Người thực hiện công việc
  //   type: DataTypes.INTEGER,
  //   allowNull: false,
  // },

  //tam thoi cho null de pass qua project
  IDUserPerform: { // Người thực hiện công việc
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  IDCreator: DataTypes.INTEGER,
  TimeComplete: DataTypes.DATE,
  TimeStart: DataTypes.DATE,
  DescriptionJob: DataTypes.STRING,
  approximateTime: DataTypes.DATE,
  NameJob: DataTypes.STRING,
  IDPriorityLevel: DataTypes.INTEGER,
  Priority: DataTypes.STRING,
  IDListFollower: DataTypes.STRING,
  IDProject: DataTypes.INTEGER,
  IDWorkFLow: DataTypes.INTEGER,
  GroupID: DataTypes.INTEGER,
}, {
  tableName: 'job',
  timestamps: false
});

module.exports = Job;
