// models/UserNotify.js
const { DataTypes } = require('sequelize');
const AppUser = require('../models/User_Model');
const Notify = require('../models/Notify_Model'); 
const sequelize = require('../../config/db');

const UserNotify = sequelize.define('UserNotify', {
  IDUser: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: AppUser, 
      key: 'IDUser' 
    }
  },
  IDNotify: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: Notify, 
      key: 'IDNotify' 
    }
  }
}, {
  tableName: 'usernotify',
  timestamps: false
});

module.exports = UserNotify;
