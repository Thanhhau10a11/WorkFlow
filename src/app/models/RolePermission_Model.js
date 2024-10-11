const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');
const Role = require('./Role_Model');

const RolePermission = sequelize.define('RolePermission', {
    IDRole: {
        type: DataTypes.INTEGER,
        references: {
            model: Role,
            key: 'RoleID',  
        },
    },
    Permission: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    Subject: {  
        type: DataTypes.STRING,
        allowNull: false, 
    },
}, {
    tableName: 'RolePermissions',
    timestamps: false,
});

module.exports = RolePermission;
