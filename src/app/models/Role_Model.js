const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const Role = sequelize.define('role', {
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
    tableName: 'roles',
    timestamps: false
});

module.exports = Role;
