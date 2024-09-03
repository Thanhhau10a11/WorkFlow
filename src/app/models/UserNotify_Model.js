// models/UserNotify.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const UserNotify = sequelize.define('UserNotify', {
  IDUser: {
    type: DataTypes.INTEGER,
    primaryKey: true
  },
  IDNotify: {
    type: DataTypes.INTEGER,
    primaryKey: true
  }
}, {
  tableName: 'usernotify',
  timestamps: false
});

module.exports = UserNotify;
