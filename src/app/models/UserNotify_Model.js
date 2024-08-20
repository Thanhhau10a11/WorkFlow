// models/UserNotify.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');
const AppUser = require('./AppUser');
const Notify = require('./Notify_Model');

const UserNotify = sequelize.define('UserNotify', {
  IDUser: {
    type: DataTypes.INTEGER,
    references: {
      model: AppUser,
      key: 'IDUser'
    },
    primaryKey: true
  },
  IDNotify: {
    type: DataTypes.INTEGER,
    references: {
      model: Notify,
      key: 'IDNotify'
    },
    primaryKey: true
  }
}, {
  tableName: 'UserNotify',
  timestamps: false
});

module.exports = UserNotify;
