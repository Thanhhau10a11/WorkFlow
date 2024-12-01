const { Group, GroupMember, AppUser } = require('../app/models/index'); 

async function checkUserInGroupOrCreator(IDUser, GroupID) {
  try {
    // Kiểm tra xem người dùng có phải là admin không
    const user = await AppUser.findOne({
      where: {
        IDUser: IDUser,
      },
    });

    if (user && user.Role === 'admin') {
      console.log('Người dùng là admin');
      return true;  
    }

    const group = await Group.findOne({
      where: {
        GroupID: GroupID,
        IDUser: IDUser,  
      },
    });

    if (group) {
      console.log('Người dùng là người tạo nhóm');
      return true;  
    }

    const groupMember = await GroupMember.findOne({
      where: {
        IDUser: IDUser,
        GroupID: GroupID,
      },
    });

    if (groupMember) {
      console.log('Người dùng là thành viên của nhóm');
      return true;  
    }

    console.log('Người dùng không phải là người tạo nhóm hoặc thành viên trong nhóm');
    return false;
  } catch (error) {
    console.error('Đã xảy ra lỗi khi kiểm tra người dùng:', error);
    throw new Error('Lỗi khi kiểm tra quyền truy cập nhóm');
  }
}

module.exports = checkUserInGroupOrCreator;
