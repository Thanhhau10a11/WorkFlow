// // models/JobStage.js
// const { DataTypes } = require('sequelize');
// const sequelize = require('../../config/db'); 
// const Job = require('./Job_Model');
// const Stage = require('./Stage_Model');
// const User = require('./User_Model'); 

// const JobStage = sequelize.define('JobStage', {
//   ID: {
//     type: DataTypes.INTEGER,
//     allowNull: false,
//     primaryKey: true,
//     autoIncrement: true
//   },
//   IDJob: {
//     type: DataTypes.INTEGER,
//     allowNull: false,
//     references: {
//       model: Job,
//       key: 'IDJob'
//     },
//     onUpdate: 'CASCADE',
//     onDelete: 'CASCADE'
//   },
//   IDStage: {
//     type: DataTypes.INTEGER,
//     allowNull: false,
//     references: {
//       model: Stage,
//       key: 'IDStage'
//     },
//     onUpdate: 'CASCADE',
//     onDelete: 'CASCADE'
//   },
  
//   status: {
//     type: DataTypes.STRING,
//     allowNull: false,
//     defaultValue: 'pending', 
//     validate: {
//       isIn: [['pending', 'completed','submitted', 'canceled']] 
//     }
//   },
//   completedAt: {
//     type: DataTypes.DATE,
//     allowNull: true
//   },
//   signatoryId: {
//     type: DataTypes.INTEGER,
//   },
//   description: {
//     type: DataTypes.TEXT,
//     allowNull: true
//   }
// }, {
//   tableName: 'jobstage',
//   timestamps: true 
// }
// );


// module.exports = JobStage;
// models/JobStage.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db'); 
const Job = require('./Job_Model');
const Stage = require('./Stage_Model');

const JobStage = sequelize.define('JobStage', {  
  ID: {  
    type: DataTypes.INTEGER,  
    allowNull: false,  
    primaryKey: true,  
    autoIncrement: true  
  },  
  IDJob: {  
    type: DataTypes.INTEGER,  
    allowNull: false,  
    references: {  
      model: Job,  
      key: 'IDJob'  
    },  
    onUpdate: 'CASCADE',  
  },  
  IDStage: {  
    type: DataTypes.INTEGER,  
    allowNull: false,  
    references: {  
      model: Stage,  
      key: 'IDStage'  
    },  
    onUpdate: 'CASCADE',  
  },  
  status: {  
    type: DataTypes.STRING,  
    allowNull: false,  
    defaultValue: 'pending',   
    validate: {  
      isIn: [['pending', 'completed', 'submitted', 'canceled']]   
    }  
  },  
  completedAt: {  
    type: DataTypes.DATE,  
    allowNull: true  
  },  
  signatoryId: {  
    type: DataTypes.INTEGER,  
    allowNull: true  
  },  
  description: {  
    type: DataTypes.TEXT,  
    allowNull: true  
  }  
}, {  
  tableName: 'jobstage',  
  timestamps: true,  
});

module.exports = JobStage;
