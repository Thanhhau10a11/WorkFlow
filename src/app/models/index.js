const sequelize = require('../../config/db');
const AppUser = require('./User_Model');
const Dates = require('./Dates_Model');
const Group = require('./Group_Model');
const GroupMember = require('./GroupMember_Model'); 
const Job = require('./Job_Model');
const JobDates = require('./JobdDates_Model');
const JobNotify = require('./JobNotify_Model');
const Notify = require('./Notify_Model');
const Project = require('./Project_Model');
const Stage = require('./Stage_Model');
const UserNotify = require('./UserNotify_Model');
const Workflow = require('./WorkFlow_Model');
const Invitation = require('./Invitation_Model');
const JobStage = require('./JobStage_Model'); 
const Role = require('./Role_Model');
const UserRole = require('./UserRole_Model');
const RolePermission = require('./RolePermission_Model');

// Định nghĩa các mối quan hệ
Group.belongsToMany(AppUser, { through: GroupMember, as: 'Members', foreignKey: 'GroupID' });
AppUser.belongsToMany(Group, { through: GroupMember, as: 'Groups', foreignKey: 'IDUser' });

Job.belongsToMany(Dates, { through: JobDates, as: 'Dates', foreignKey: 'IDJob' });
Dates.belongsToMany(Job, { through: JobDates, as: 'Jobs', foreignKey: 'IDDate' });

Job.belongsToMany(Notify, { through: JobNotify, as: 'Notifies', foreignKey: 'IDJob' });
Notify.belongsToMany(Job, { through: JobNotify, as: 'Jobs', foreignKey: 'IDNotify' });

Project.hasMany(Job, { foreignKey: 'IDProject', as: 'JobsInProject' });
Job.belongsTo(Project, { foreignKey: 'IDProject' });

Group.hasMany(Project, { foreignKey: 'GroupID', as: 'Projects', onDelete: 'CASCADE' });
Project.belongsTo(Group, { foreignKey: 'GroupID', as: 'Group' });

Workflow.hasMany(Stage, { foreignKey: 'IDWorkFlow', as: 'Stages' });
Stage.belongsTo(Workflow, { foreignKey: 'IDWorkFlow', as: 'Workflow' });

// Định nghĩa quan hệ nhiều-nhiều giữa Job và Stage thông qua JobStage
Job.belongsToMany(Stage, { through: JobStage, as: 'Stages', foreignKey: 'IDJob' });
Stage.belongsToMany(Job, { through: JobStage, as: 'Jobs', foreignKey: 'IDStage' });

AppUser.belongsToMany(Notify, { through: UserNotify, as: 'ReceivedNotifies', foreignKey: 'IDUser' });
Notify.belongsToMany(AppUser, { through: UserNotify, as: 'Users', foreignKey: 'IDNotify' });

// Quan hệ một-nhiều giữa Group và Workflow
Group.hasMany(Workflow, { foreignKey: 'GroupID', as: 'GroupWorkFlow', onDelete: 'CASCADE' });
Workflow.belongsTo(Group, { foreignKey: 'GroupID', as: 'WorkFlowGroup' });

// Quan hệ một-nhiều giữa AppUser và Job cho người thực hiện công việc
AppUser.hasMany(Job, { foreignKey: 'IDUserPerform', as: 'PerformedJobs' });
Job.belongsTo(AppUser, { foreignKey: 'IDUserPerform', as: 'Performer' });

Role.belongsToMany(AppUser, { through: UserRole, foreignKey: 'RoleID', as: 'UsersRole' });
AppUser.belongsToMany(Role, { through: UserRole, foreignKey: 'IDUser', as: 'Roles' });

Role.hasMany(RolePermission, { foreignKey: 'IDRole', as: 'Permissions' });
RolePermission.belongsTo(Role, { foreignKey: 'IDRole' });

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
  JobStage ,
  Role,
  UserRole,
  RolePermission,
};  
