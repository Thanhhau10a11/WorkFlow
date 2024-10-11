// // services/permissions.js
// const UserRole = require('../app/models/UserRole_Model');
// const RolePermission = require('../app/models/RolePermission_Model');
// const Role = require('../app/models/Role_Model');

// async function getUserPermissions(userId) {
//     const userRoles = await UserRole.findAll({
//         where: { IDUser: userId },
//         include: {
//             model: Role,
//             include: {
//                 model: RolePermission,
//                 attributes: ['Permission']
//             }
//         }
//     });

//     const permissions = new Set();

//     userRoles.forEach(userRole => {
//         userRole.Role.RolePermissions.forEach(rp => {
//             permissions.add(rp.Permission);
//         });
//     });

//     return Array.from(permissions);
// }

// module.exports = { getUserPermissions };


// util/permission.js
const { RolePermission } = require('../app/models/RolePermission_Model');


async function getUserPermissions(userId) {
    const userRoles = await UserRole.findAll({
        where: { IDUser: userId },
        include: {
            model: Role,
            include: {
                model: RolePermission,
                attributes: ['Permission', 'Subject'] // Lấy cả Permission và Subject
            }
        }
    });

    const permissions = new Set();

    userRoles.forEach(userRole => {
        userRole.Role.RolePermissions.forEach(rp => {
            permissions.add(`${rp.Permission}:${rp.Subject}`); // Định dạng theo cách bạn muốn
        });
    });

    return Array.from(permissions);
}

module.exports = { getUserPermissions };