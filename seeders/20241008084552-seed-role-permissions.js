// seeders/20230101000000-seed-role-permissions.js

'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const permissions = [
      // Quyền cho Admin
      { IDRole: 1, action: 'manage', subject: 'all' }, // Admin có toàn quyền
      // { IDRole: 1, action: 'create', subject: 'Group' },
      // { IDRole: 1, action: 'add', subject: 'User' },
      // { IDRole: 1, action: 'create', subject: 'Project' },
      // { IDRole: 1, action: 'create', subject: 'Workflow' },
      // { IDRole: 1, action: 'manage', subject: 'Stage' },
      // { IDRole: 1, action: 'manage', subject: 'Job' },

      // Quyền cho LeaderGroup
      { IDRole: 2, action: 'manage', subject: 'Group' }, // Toàn quyền trong Group
      { IDRole: 2, action: 'manage', subject: 'Project' },
      { IDRole: 2, action: 'manage', subject: 'Workflow' },
      { IDRole: 2, action: 'manage', subject: 'User' },

      // Quyền cho User
      { IDRole: 3, action: 'read', subject: 'Stage' }, // Chỉ có thể xem Stage đã được phân công
      { IDRole: 3, action: 'read', subject: 'Job' },   // Chỉ có thể xem Job đã được phân công
      { IDRole: 3, action: 'read', subject: 'Project' }, // Có thể xem Project
      { IDRole: 3, action: 'read', subject: 'Workflow' }, // Có thể xem Workflow
      { IDRole: 3, action: 'complete', subject: 'Job' }, // Đánh dấu hoàn thành Job
      { IDRole: 3, action: 'complete', subject: 'Stage' }  // Chỉ có thể xem Job đã được phân công
    ];

    await queryInterface.bulkInsert('RolePermissions', permissions);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('RolePermissions', null, {});
  }
};
