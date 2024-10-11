'use strict';

const bcrypt = require('bcrypt');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const users = [
      { 
        username: 'admin', 
        password: await bcrypt.hash('password', 10), 
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
      { 
        username: 'leader', 
        password: await bcrypt.hash('password', 10), 
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
      { 
        username: 'user', 
        password: await bcrypt.hash('password', 10), 
        createdAt: new Date(), 
        updatedAt: new Date() 
      },
    ];

    await queryInterface.bulkInsert('AppUsers', users, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('AppUsers', null, {});
  }
};
