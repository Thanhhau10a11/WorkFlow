// models/AppUser.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const AppUser = sequelize.define('AppUser', {
  IDUser: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  Birthday: DataTypes.DATE,
  RequestCompleteTime: DataTypes.DATE,
  InfoFollower: DataTypes.STRING,
  RequestDescription: DataTypes.TEXT,
  Phone: DataTypes.STRING,
  Name: DataTypes.STRING,
  Username: DataTypes.STRING,
  Password: DataTypes.STRING
}, {
  tableName: 'appuser',
  timestamps: false
});

module.exports = AppUser;
