

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
