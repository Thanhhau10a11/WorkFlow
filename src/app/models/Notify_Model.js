// models/Notify.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const Notify = sequelize.define('Notify', {
  IDNotify: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  NotifyMessage: DataTypes.STRING,
  NotifyTitle: DataTypes.STRING,
  NotifyCreatedAt: DataTypes.DATE
}, {
  tableName: 'notify',
  timestamps: false
});

module.exports = Notify;
