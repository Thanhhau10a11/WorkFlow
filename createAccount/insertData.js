//node createAccount/insertData
'use strict';

const { sequelize } = require('../src/app/models/index'); 
const bcrypt = require('bcryptjs');
const { AppUser, UserRole, Role, RolePermission } = require('../src/app/models/index'); 

const seedData = async () => {
  try {
    await sequelize.authenticate(); 
    console.log('Connection has been established successfully.');

    // Đồng bộ hóa các mô hình với cơ sở dữ liệu
    await sequelize.sync(); // Thêm dòng này

    // Tạo người dùng
    const users = [
      {
        Username: 'admin@gmail.com', // Sửa trường username thành Username nếu trường trong model là như vậy
        Password: await bcrypt.hash('adminpassword', 10), // Sửa trường password thành Password
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        Username: 'LeaderGroup@gmail.com',
        Password: await bcrypt.hash('leaderpassword', 10),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        Username: 'user@gmail.com',
        Password: await bcrypt.hash('userpassword', 10),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    // Thêm người dùng vào bảng AppUser
    const createdUsers = await AppUser.bulkCreate(users, { returning: true });
    console.log('Users created successfully.');

    // Tạo quyền
    const roles = [
      { RoleName: 'admin', createdAt: new Date(), updatedAt: new Date() },
      { RoleName: 'LeaderGroup', createdAt: new Date(), updatedAt: new Date() },
      { RoleName: 'user', createdAt: new Date(), updatedAt: new Date() },
    ];

    // Thêm quyền vào bảng Role
    const createdRoles = await Role.bulkCreate(roles, { returning: true });
    console.log('Roles created successfully.');

    // Tạo mối quan hệ giữa người dùng và quyền
    const userRoles = [
      { IDUser: createdUsers[0].IDUser, RoleID: createdRoles[0].RoleID, createdAt: new Date(), updatedAt: new Date() }, // Admin user
      { IDUser: createdUsers[1].IDUser, RoleID: createdRoles[1].RoleID, createdAt: new Date(), updatedAt: new Date() }, // LeaderGroup user
      { IDUser: createdUsers[2].IDUser, RoleID: createdRoles[2].RoleID, createdAt: new Date(), updatedAt: new Date() }, // Regular user
    ];

    // Thêm quyền người dùng vào bảng UserRole
    await UserRole.bulkCreate(userRoles);
    console.log('User roles created successfully.');

    // Tạo quyền cho bảng RolePermission
    const rolePermissions = [
      { IDRole: createdRoles[0].RoleID, Permission: 'manage', createdAt: new Date(), updatedAt: new Date() }, // Admin
      { IDRole: createdRoles[1].RoleID, Permission: 'manage', createdAt: new Date(), updatedAt: new Date(), Subject: 'Group' },
      { IDRole: createdRoles[1].RoleID, Permission: 'manage', createdAt: new Date(), updatedAt: new Date(), Subject: 'Project' },
      { IDRole: createdRoles[1].RoleID, Permission: 'manage', createdAt: new Date(), updatedAt: new Date(), Subject: 'Workflow' },
      { IDRole: createdRoles[1].RoleID, Permission: 'manage', createdAt: new Date(), updatedAt: new Date(), Subject: 'User' },
      { IDRole: createdRoles[2].RoleID, Permission: 'read', createdAt: new Date(), updatedAt: new Date(), Subject: 'Stage' },
      { IDRole: createdRoles[2].RoleID, Permission: 'read', createdAt: new Date(), updatedAt: new Date(), Subject: 'Job' },
      { IDRole: createdRoles[2].RoleID, Permission: 'read', createdAt: new Date(), updatedAt: new Date(), Subject: 'Project' },
      { IDRole: createdRoles[2].RoleID, Permission: 'read', createdAt: new Date(), updatedAt: new Date(), Subject: 'Workflow' },
      { IDRole: createdRoles[2].RoleID, Permission: 'complete', createdAt: new Date(), updatedAt: new Date(), Subject: 'Job' },
      { IDRole: createdRoles[2].RoleID, Permission: 'complete', createdAt: new Date(), updatedAt: new Date(), Subject: 'Stage' }
    ];

    // Thêm quyền vào bảng RolePermission
    await RolePermission.bulkCreate(rolePermissions);
    console.log('Role permissions created successfully.');

  } catch (error) {
    console.error('Unable to connect to the database:', error);
  } finally {
    if (sequelize) {
      await sequelize.close(); // Đóng kết nối
    }
  }
};

seedData();
