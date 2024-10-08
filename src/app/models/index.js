// const sequelize = require('../../config/db');
// const AppUser = require('./User_Model');
// const Dates = require('./Dates_Model');
// const Group = require('./Group_Model');
// const Job = require('./Job_Model');
// const JobDates = require('./JobdDates_Model'); 
// const JobNotify = require('./JobNotify_Model');
// const Notify = require('./Notify_Model');
// const Project = require('./Project_Model');
// const Stage = require('./Stage_Model');
// const UserNotify = require('./UserNotify_Model');
// const Workflow = require('./WorkFlow_Model');

// // Định nghĩa các mối quan hệ
// AppUser.hasMany(Group, { as: 'Groups', foreignKey: 'IDUser' });
// Group.belongsTo(AppUser, { as: 'User', foreignKey: 'IDUser' });

// Job.belongsToMany(Dates, { through: JobDates, as: 'Dates', foreignKey: 'IDJob' });
// Dates.belongsToMany(Job, { through: JobDates, as: 'Jobs', foreignKey: 'IDDate' });

// Job.belongsToMany(Notify, { through: JobNotify, as: 'Notifies', foreignKey: 'IDJob' });
// Notify.belongsToMany(Job, { through: JobNotify, as: 'Jobs', foreignKey: 'IDNotify' });

// Project.hasMany(Job, { foreignKey: 'IDProject' });
// Job.belongsTo(Project, { foreignKey: 'IDProject' });

// Workflow.hasMany(Stage, { foreignKey: 'IDWorkFlow', as: 'Stages' });
// Stage.belongsTo(Workflow, { foreignKey: 'IDWorkFlow', as: 'Workflow' });

// AppUser.belongsToMany(Notify, { through: UserNotify, as: 'ReceivedNotifies', foreignKey: 'IDUser' });
// Notify.belongsToMany(AppUser, { through: UserNotify, as: 'Users', foreignKey: 'IDNotify' });

// module.exports = {
//   sequelize,
//   AppUser,
//   Dates,
//   Group,
//   Job,
//   JobDates,
//   JobNotify,
//   Notify,
//   Project,
//   Stage,
//   UserNotify,
//   Workflow
// };
const sequelize = require('../../config/db');
const AppUser = require('./User_Model');
const Dates = require('./Dates_Model');
const Group = require('./Group_Model');
const Job = require('./Job_Model');
const JobDates = require('./JobdDates_Model');
const JobNotify = require('./JobNotify_Model');
const Notify = require('./Notify_Model');
const Project = require('./Project_Model');
const Stage = require('./Stage_Model');
const UserNotify = require('./UserNotify_Model');
const Workflow = require('./WorkFlow_Model');

// Định nghĩa các mối quan hệ
AppUser.hasMany(Group, { as: 'Groups', foreignKey: 'IDUser' });
Group.belongsTo(AppUser, { as: 'User', foreignKey: 'IDUser' });

Job.belongsToMany(Dates, { through: JobDates, as: 'Dates', foreignKey: 'IDJob' });
Dates.belongsToMany(Job, { through: JobDates, as: 'Jobs', foreignKey: 'IDDate' });

Job.belongsToMany(Notify, { through: JobNotify, as: 'Notifies', foreignKey: 'IDJob' });
Notify.belongsToMany(Job, { through: JobNotify, as: 'Jobs', foreignKey: 'IDNotify' });

Project.hasMany(Job, { foreignKey: 'IDProject' });
Job.belongsTo(Project, { foreignKey: 'IDProject' });

Workflow.hasMany(Stage, { foreignKey: 'IDWorkFlow', as: 'Stages' });
Stage.belongsTo(Workflow, { foreignKey: 'IDWorkFlow', as: 'Workflow' });

Stage.hasMany(Job, { foreignKey: 'IDStage', as: 'Jobs' });
Job.belongsTo(Stage, { foreignKey: 'IDStage', as: 'Stage' });

AppUser.belongsToMany(Notify, { through: UserNotify, as: 'ReceivedNotifies', foreignKey: 'IDUser' });
Notify.belongsToMany(AppUser, { through: UserNotify, as: 'Users', foreignKey: 'IDNotify' });

module.exports = {
  sequelize,
  AppUser,
  Dates,
  Group,
  Job,
  JobDates,
  JobNotify,
  Notify,
  Project,
  Stage,
  UserNotify,
  Workflow
};
