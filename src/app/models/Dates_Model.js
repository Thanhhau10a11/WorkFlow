// models/Dates.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const Dates = sequelize.define('dates', {
  IDDate: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  Date: DataTypes.DATE
}, {
  tableName: 'dates',
  timestamps: false
});

module.exports = Dates;
