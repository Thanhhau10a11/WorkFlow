const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const Notify = sequelize.define('Notify', {
  IDNotify: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  NotifyMessage: {
    type: DataTypes.STRING,
    allowNull: false
  },
  NotifyTitle: {
    type: DataTypes.STRING,
    allowNull: true
  },
  NotifyCreatedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'Notify',
  timestamps: false
});

module.exports = Notify;
