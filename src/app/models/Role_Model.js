const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const Role = sequelize.define('Role', {
    RoleID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        unique:true,
        primaryKey: true
    },
    RoleName: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: 'Roles',
    timestamps: false
});

module.exports = Role;
