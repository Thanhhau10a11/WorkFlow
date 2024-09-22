const sequelize = require('../../config/db');
const AppUser = require('./User_Model');
const Dates = require('./Dates_Model');
const Group = require('./Group_Model');
const GroupMember = require('./GroupMember_Model'); // Import model mới
const Job = require('./Job_Model');
const JobDates = require('./JobdDates_Model');
const JobNotify = require('./JobNotify_Model');
const Notify = require('./Notify_Model');
const Project = require('./Project_Model');
const Stage = require('./Stage_Model');
const UserNotify = require('./UserNotify_Model');
const Workflow = require('./WorkFlow_Model');
const Invitation = require('./Invitation_Model');
const JobStage = require('./JobStage_Model'); // Import model JobStage

// Định nghĩa các mối quan hệ
Group.belongsToMany(AppUser, { through: GroupMember, as: 'Members', foreignKey: 'GroupID' });
AppUser.belongsToMany(Group, { through: GroupMember, as: 'Groups', foreignKey: 'IDUser' });

Job.belongsToMany(Dates, { through: JobDates, as: 'Dates', foreignKey: 'IDJob' });
Dates.belongsToMany(Job, { through: JobDates, as: 'Jobs', foreignKey: 'IDDate' });

Job.belongsToMany(Notify, { through: JobNotify, as: 'Notifies', foreignKey: 'IDJob' });
Notify.belongsToMany(Job, { through: JobNotify, as: 'Jobs', foreignKey: 'IDNotify' });

Project.hasMany(Job, { foreignKey: 'IDProject' });
Job.belongsTo(Project, { foreignKey: 'IDProject' });

Workflow.hasMany(Stage, { foreignKey: 'IDWorkFlow', as: 'Stages' });
Stage.belongsTo(Workflow, { foreignKey: 'IDWorkFlow', as: 'Workflow' });

// Định nghĩa quan hệ nhiều-nhiều giữa Job và Stage thông qua JobStage
Job.belongsToMany(Stage, { through: JobStage, as: 'Stages', foreignKey: 'IDJob' });
Stage.belongsToMany(Job, { through: JobStage, as: 'Jobs', foreignKey: 'IDStage' });

AppUser.belongsToMany(Notify, { through: UserNotify, as: 'ReceivedNotifies', foreignKey: 'IDUser' });
Notify.belongsToMany(AppUser, { through: UserNotify, as: 'Users', foreignKey: 'IDNotify' });

module.exports = {
  sequelize,
  Invitation,
  AppUser,
  Dates,
  Group,
  GroupMember,
  Job,
  JobDates,
  JobNotify,
  Notify,
  Project,
  Stage,
  UserNotify,
  Workflow,
  JobStage // Xuất khẩu model JobStage
};
