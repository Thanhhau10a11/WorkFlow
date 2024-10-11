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
  Role:DataTypes.STRING,
  RequestDescription: DataTypes.TEXT,
  Phone: DataTypes.STRING,
  Name: DataTypes.STRING,
  Username: {
    type: DataTypes.STRING(191),
    //unique: true,
    allowNull: false,
  },
  Password: DataTypes.STRING
}, {
  tableName: 'AppUser',
  timestamps: false
});

module.exports = AppUser;
