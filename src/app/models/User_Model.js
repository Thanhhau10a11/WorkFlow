const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db'); 

const AppUser = sequelize.define('AppUser', {
  IDUser: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  Birthday: {
    type: DataTypes.DATE,
    allowNull: true
  },
  RequestCompleteTime: {
    type: DataTypes.DATE,
    allowNull: true
  },
  InfoFollower: {
    type: DataTypes.STRING,
    allowNull: true
  },
  RequestDescription: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  Phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  Name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  Username: {
    type: DataTypes.STRING,
    allowNull: false
  },
  Password: {
    type: DataTypes.STRING,
    allowNull: false
  },
}, {
  tableName: 'AppUser',
  timestamps: false // Tắt tự động thêm cột createdAt và updatedAt
});

module.exports = AppUser;
