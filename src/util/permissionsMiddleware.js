// permissionsMiddleware.js
const defineAbilityFor = require('../ability/ability');

const permissionsMiddleware = (action, resource) => {
  return (req, res, next) => {
    const user = req.user; // Giả sử bạn đã xác định người dùng ở middleware trước đó
    const ability = defineAbilityFor(user);

    if (ability.can(action, resource)) {
      return next(); // Người dùng có quyền truy cập
    } else {
      return res.status(403).send('Access denied.'); // Không có quyền truy cập
    }
  };
};

// Middleware kiểm tra quyền truy cập group
const groupAccessMiddleware = (req, res, next) => {
  const user = req.user;
  
  if (user.role === 'admin') {
    return next(); // Admin có thể truy cập tất cả group
  } else if (user.role === 'user') {
    const userGroups = user.groups; // Danh sách các group mà người dùng thuộc về
    if (userGroups && userGroups.length > 0) {
      req.userGroups = userGroups; // Lưu thông tin group vào req để sử dụng sau này
      return next();
    } else {
      return res.status(403).send('Access denied.'); // Không có quyền truy cập
    }
  } else {
    return res.status(403).send('Access denied.'); // Không có quyền truy cập
  }
};

module.exports = {
  permissionsMiddleware,
  groupAccessMiddleware
};
