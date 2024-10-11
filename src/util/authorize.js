const authorize = (allowedRoles) => {
    return (req, res, next) => {
      if (!req.user || !req.user.roles) {
        return res.status(403).json({ message: 'Không có quyền truy cập' });
      }
  
      // Kiểm tra xem người dùng có một trong các vai trò được phép không
      const hasAccess = req.user.roles.some(role => allowedRoles.includes(role));
  
      if (!hasAccess) {
        return res.status(403).json({ message: 'Không có quyền truy cập' });
      }
  
      next();
    };
  };
module.exports = authorize;  
  