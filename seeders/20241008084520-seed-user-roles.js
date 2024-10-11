'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Lấy ID của người dùng từ bảng AppUsers
    const users = await queryInterface.sequelize.query(
      'SELECT IDUser FROM AppUsers WHERE username IN (\'admin\', \'LeaderGroup\', \'user\')'
    );

    const userRoles = [
      { IDUser: users[0][0].IDUser, RoleID: 1, createdAt: new Date(), updatedAt: new Date() }, // Admin user
      { IDUser: users[0][1].IDUser, RoleID: 2, createdAt: new Date(), updatedAt: new Date() }, // LeaderGroup user
      { IDUser: users[0][2].IDUser, RoleID: 3, createdAt: new Date(), updatedAt: new Date() }, // User
    ];

    await queryInterface.bulkInsert('UserRoles', userRoles, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('UserRoles', null, {});
  }
};
