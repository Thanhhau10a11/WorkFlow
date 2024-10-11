
// const { AbilityBuilder, createMongoAbility } = require('@casl/ability');

// function defineAbilityFor(user) {
//   const { can, cannot, build } = new AbilityBuilder(createMongoAbility);

//   if (user.Role === 'admin') {
//     can('manage', 'all'); // Admin có quyền truy cập tất cả
//   } else if (user.Role === 'LeaderGroup') {
//     can('manage', 'Workflow'); // LeaderGroup có thể tạo workflow
//     can('manage', 'Project'); // LeaderGroup có thể tạo project
//     can('manage', 'Group'); // LeaderGroup có thể đọc group
//     can('manage', 'Stage'); // LeaderGroup có thể đọc stage
//     can('manage', 'Job'); // LeaderGroup có thể đọc job
//     can('manage', 'Stage'); // LeaderGroup có thể quản lý stage
//   } else if (user.Role === 'user') {
//     can('read', 'Group'); // Người dùng có thể đọc group
//     can('read', 'Stage'); // Người dùng có thể đọc stage
//     can('read', 'Job'); // Người dùng có thể đọc job
//     // can(['update', 'delete'], 'Job');
//   }

//   return build();
// }

// module.exports = defineAbilityFor;

// permissions/defineAbility.js


// const { AbilityBuilder, Ability } = require('@casl/ability');
// const { getUserPermissions } = require('../util/permission');

// async function defineAbilityFor(user) {
//     const { can, cannot, build } = new AbilityBuilder(Ability);

//     if (user.Role === 'admin') {
//         can('manage', 'all'); // Admin có quyền truy cập tất cả
//     } else {
//         const permissions = await getUserPermissions(user.id);
        
//         permissions.forEach(permission => {
//             const [action, subject] = permission.split(':'); // Giả sử Permission có dạng "action:Subject"
//             if (subject && action) {
//                 can(action, subject);
//             } else {
//                 // Xử lý nếu định dạng Permission không đúng
//                 console.warn(`Invalid permission format: ${permission}`);
//             }
//         });

//         // Nếu LeaderGroup cần quản lý các Group mà họ làm chủ
//         if (user.Role === 'LeaderGroup') {
//             can('manage', 'Group', { leaderId: user.id });
//             can('manage', 'Project', { 'group.leaderId': user.id });
//             can('manage', 'Workflow', { 'group.leaderId': user.id });
//         }
//     }

//     return build();
// }

// module.exports = defineAbilityFor;

// src/app/ability.js

const { AbilityBuilder, Ability } = require('@casl/ability');
const { getUserPermissions } = require('../util/permission');

/**
 * Hàm định nghĩa khả năng cho một người dùng
 * @param {Object} user - Thông tin người dùng
 * @returns {Ability} - Một thể hiện của Ability chứa các rules
 */
async function defineAbilityFor(user) {
    const { can, build } = new AbilityBuilder(Ability);

    // Nếu là Admin
    if (user.Role === 'admin') {
        can('manage', 'all'); // Admin có quyền quản lý tất cả
    } 
    // Nếu là LeaderGroup
    else if (user.Role === 'LeaderGroup') {
        can('manage', 'Group'); // Quản lý group
        can('create', 'Project'); // Tạo project
        can('create', 'Workflow'); // Tạo workflow
        can('add', 'User'); // Thêm người dùng
        
        // Quản lý stage và job trong group của mình
        can('manage', 'Stage', { groupId: user.groupId });
        can('manage', 'Job', { groupId: user.groupId });
    } 
    // Nếu là nhân viên
    else if (user.Role === 'user') {
        can('read', 'Stage', { userId: user.id }); // Xem stage được giao
        can('read', 'Job', { userId: user.id }); // Xem job được giao
        can('read', 'Project'); // Xem tất cả Project
        can('read', 'Workflow'); // Xem tất cả Workflow
        can('complete', 'Job', { userId: user.id }); // Đánh dấu hoàn thành Job
        can('complete', 'Stage', { userId: user.id }); // Đánh dấu hoàn thành Stage
    }

    // Tải các quyền từ cơ sở dữ liệu
    const permissions = await getUserPermissions(user.id);
    
    permissions.forEach(permission => {
        const [action, subject] = permission.split(':'); // Giả sử Permission có dạng "action:subject"
        if (subject && action) {
            can(action, subject);
        } else {
            console.warn(`Invalid permission format: ${permission}`);
        }
    });

    return build();
}

module.exports = defineAbilityFor;
