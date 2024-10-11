// seeders/20231008120000-seed-roles.js

'use strict';

const { Role } = require('../src/app/models/index'); 
const sequelize = require('../config/config.json'); 

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const roles = [
      { RoleName: "admin" },
      { RoleName: "LeaderGroup" },
      { RoleName: "user" }
    ];

    for (const role of roles) {
      try {
        const existingRole = await Role.findOne({ where: { RoleName: role.RoleName } });
        if (existingRole) {
          console.log(`Role ${role.RoleName} already exists.`);
          continue; 
        }

        await Role.create(role);
        console.log(`Role ${role.RoleName} created.`);
      } catch (error) {
        console.error('Error creating role:', error);
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    const roles = ["admin", "LeaderGroup", "user"];
    try {
      await Role.destroy({
        where: {
          RoleName: roles
        }
      });
      console.log('Roles removed successfully.');
    } catch (error) {
      console.error('Error removing roles:', error);
    }
  }
};
