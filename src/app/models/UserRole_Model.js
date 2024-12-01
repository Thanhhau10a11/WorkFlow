// models/UserRole.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');
const AppUser = require('./User_Model');
const Role = require('./Role_Model');

const UserRole = sequelize.define('UserRole', {
    IDUser: {
        type: DataTypes.INTEGER,
        references: {
            model: AppUser,
            key: 'IDUser'
        }
    },
    RoleID: {
        type: DataTypes.INTEGER,
        references: {
            model: Role,
            key: 'RoleID'
        }
    }
}, {
    tableName: 'UserRoles',
    timestamps: false
});

module.exports = UserRole;
