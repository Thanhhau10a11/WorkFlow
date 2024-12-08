// // models/Workflow.js
// const { DataTypes } = require('sequelize');
// const sequelize = require('../../config/db');

// const Workflow = sequelize.define('Workflow', {
//   IDWorkFlow: {
//     type: DataTypes.INTEGER,
//     autoIncrement: true,
//     primaryKey: true
//   },
//   Name: DataTypes.STRING,
//   Description: DataTypes.TEXT,
//   IDFollower: DataTypes.INTEGER,
//   IDCreator: DataTypes.INTEGER
// }, {
//   tableName: 'workflow',
//   timestamps: false
// });

// module.exports = Workflow;
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const Workflow = sequelize.define('workflow', {
  IDWorkFlow: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  Name: DataTypes.STRING,
  Description: DataTypes.TEXT,
  IDFollower: DataTypes.INTEGER,
  IDCreator: DataTypes.INTEGER,
  GroupID: { 
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'group', 
      key: 'GroupID'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE' 
  }
}, {
  tableName: 'workflow',
  timestamps: true
});

module.exports = Workflow;
