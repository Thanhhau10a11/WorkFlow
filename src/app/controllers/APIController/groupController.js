
// const Group = require('../../models/Group_Model'); 
// const AppUser = require('../../models/User_Model');
// const GroupMember = require('../../models/GroupMember_Model');
const {AppUser,GroupMember,Group} =require('../../models/index')
const axios = require('axios');
const bcrypt = require('bcryptjs');
const { request } = require('express');
const Sequelize = require('sequelize')
const crypto = require('crypto');


class GroupController {
    async getALl(req, res) {
        try{
            const groups = await Group.findAll();
            res.json(groups);
        }catch(err){
            res.status(500).json({error:err.message})
        }
    }
    async getById(req,res) {
        try {
            const group = await Group.findByPk(req.params.id);
            if(Group) {
                res.json(group);
            }else {
                res.status(404).json({error : 'group not found'})
            }
        } catch (error) {
            res.status(500).json({error:error.message})
        }
    }
    async create(req,res) {
        
        try {
          const {groupName, IDUser } = req.body;
      
          if ( !groupName||!IDUser) {
            return res.status(400).json({ error: 'Tên nhóm và ID người dùng là bắt buộc.' });
          }
      
          const newGroup = await Group.create({
            GroupName: groupName,
            IDUser: IDUser
          });
      
          return res.status(201).json({ message: 'Nhóm đã được tạo thành công.', group: newGroup });
        } catch (error) {
          console.error('Lỗi khi tạo nhóm:', error);
          return res.status(500).json({ error: 'Có lỗi xảy ra khi tạo nhóm.' });
        }
    }
    async update(req,res) {
        try {
            const [updated] = await Group.update(req.body, {
              where: { GroupID: req.params.id }
            });
            if (updated) {
              const updatedGroup = await Group.findByPk(req.params.id);
              res.json(updatedGroup);
            } else {
              res.status(404).json({ error: 'group not found' });
            }
          } catch (error) {
            res.status(500).json({ error: error.message });
          }
    }
    async delete(req,res) {
        try {
            const deleted = await Group.destroy({
              where: { GroupID: req.params.id }
            });
            if (deleted) {
              res.status(200).json({message:'Xóa thành công'});
            } else {
              res.status(404).json({ error: 'group not found' });
            }
          } catch (error) {
            res.status(500).json({ error: error.message });
          }
    }
  async getGroupsByIDUser(req, res) {
    try {
      const groups = await Group.findAll({
        where: { IDUser: req.params.id },
        attributes: {
          include: [
            // Đếm số lượng thành viên cho mỗi nhóm
            [Sequelize.fn('COUNT', Sequelize.col('Members.IDUser')), 'memberCount'],
          ],
        },
        include: [
          {
            model: AppUser,
            as: 'Members', 
            attributes: [], 
            through: { attributes: [] }, 
          },
        ],
        group: ['Group.GroupID'], 
        order: [['updatedAt', 'DESC']],
      });

      if (groups) {
        res.json(groups);
      } else {
        res.status(500).json({ message: 'Group not found' });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // async addMember(req, res) {
  //   const { emails, groupId } = req.body;

  //   const authToken = req.session.user.token;

  //   if (!emails || !groupId) {
  //       return res.status(400).json({ success: false, message: 'Thiếu thông tin' });
  //   }

  //   try {
  //       const group = await Group.findByPk(groupId);
  //       if (!group) {
  //           return res.status(404).json({ success: false, message: 'Nhóm không tìm thấy' });
  //       }

  //       // Tìm tất cả người dùng trong `AppUser` dựa trên `emails`
  //       const users = await AppUser.findAll({
  //           where: {
  //               Username: {
  //                   [Sequelize.Op.in]: emails
  //               }
  //           }
  //       });

  //       const existingUsernames = users.map(user => user.Username);
  //       const existingUserIds = users.map(user => user.IDUser);

  //       // Tìm những người dùng đã có trong nhóm này (`GroupMember`)
  //       const existingMembers = await GroupMember.findAll({
  //           where: {
  //               GroupID: groupId,
  //               IDUser: {
  //                   [Sequelize.Op.in]: existingUserIds
  //               }
  //           }
  //       });

  //       const existingMemberIds = new Set(existingMembers.map(member => member.IDUser)); // Sử dụng Set để tránh trùng lặp

  //       // Người dùng chưa tồn tại trong ứng dụng (`AppUser`)
  //       const newEmails = emails.filter(email => !existingUsernames.includes(email));

  //       const defaultPassword = process.env.DEFAULT_PASSWORD;
  //       const hashedPassword = await bcrypt.hash(defaultPassword, 10);

  //       const membersToInvite = [];

  //       // Tạo người dùng mới nếu chưa tồn tại trong ứng dụng
  //       await Promise.all(newEmails.map(async (email) => {
  //           try {
  //               const newUser = await AppUser.create({
  //                   Username: email,
  //                   Password: hashedPassword
  //               });

  //               const token = crypto.randomBytes(20).toString('hex');
  //               const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

  //               membersToInvite.push({
  //                   GroupID: groupId,
  //                   IDUser: newUser.IDUser,
  //                   Token: token,
  //                   TokenExpiry: tokenExpiry,
  //                   Status: 'pending'
  //               });

  //               try {
  //                   const headers = {
  //                     'Authorization': `Bearer ${authToken}` 
  //                   };
  //                   await axios.post(`http://localhost:3000/api/email/inviteGroup/${email}`, {
  //                       email: email,
  //                       token: token
  //                   },{headers});
  //                   console.log(`Email sent successfully to ${email}`);
  //               } catch (emailError) {
  //                   console.error(`Failed to send email to ${email}:`, emailError.message);
  //               }
  //           } catch (error) {
  //               console.error(`Failed to process ${email}:`, error.message);
  //           }
  //       }));

  //       // Thêm người dùng đã tồn tại vào nhóm nếu chưa phải là thành viên của nhóm đó
  //       users.forEach(user => {
  //           if (!existingMemberIds.has(user.IDUser)) { // Kiểm tra nếu người dùng chưa có trong nhóm
  //               const token = crypto.randomBytes(20).toString('hex');
  //               const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

  //               membersToInvite.push({
  //                   GroupID: groupId,
  //                   IDUser: user.IDUser,
  //                   Token: token,
  //                   TokenExpiry: tokenExpiry,
  //                   Status: 'pending'
  //               });
  //           }
  //       });

  //       if (membersToInvite.length > 0) {
  //           await Promise.all(membersToInvite.map(async (member) => {
  //               await GroupMember.upsert(member);
  //           }));

  //           const addedMembers = await GroupMember.findAll({
  //               where: {
  //                   GroupID: groupId,
  //                   IDUser: membersToInvite.map(member => member.IDUser)
  //               }
  //           });

  //           return res.status(200).json({ success: true, addedMembers });
  //       } else {
  //           console.log('No new members to add.');
  //           return res.status(200).json({ success: true, message: 'Không có thành viên mới để thêm' });
  //       }

  //   } catch (error) {
  //       console.error('Error occurred:', error.message);  
  //       return res.status(500).json({ success: false, message: 'Có lỗi xảy ra trong quá trình xử lý.' });
  //   }
  // }
  async addMember(req, res) {
    const { emails, groupId } = req.body;

    const authToken = req.session.user.token;

    if (!emails || !groupId) {
        return res.status(400).json({ success: false, message: 'Thiếu thông tin' });
    }

    try {
        const group = await Group.findByPk(groupId);
        if (!group) {
            return res.status(404).json({ success: false, message: 'Nhóm không tìm thấy' });
        }

        // Tìm tất cả người dùng trong `AppUser` dựa trên `emails`
        const users = await AppUser.findAll({
            where: {
                Username: {
                    [Sequelize.Op.in]: emails
                }
            }
        });

        const existingUsernames = users.map(user => user.Username);
        const existingUserIds = users.map(user => user.IDUser);

        // Tìm những người dùng đã có trong nhóm này (`GroupMember`)
        const existingMembers = await GroupMember.findAll({
            where: {
                GroupID: groupId,
                IDUser: {
                    [Sequelize.Op.in]: existingUserIds
                }
            }
        });

        const existingMemberIds = new Set(existingMembers.map(member => member.IDUser)); // Sử dụng Set để tránh trùng lặp

        // Người dùng chưa tồn tại trong ứng dụng (`AppUser`)
        const newEmails = emails.filter(email => !existingUsernames.includes(email));

        const defaultPassword = process.env.DEFAULT_PASSWORD;
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);

        const membersToInvite = [];

        // Tạo người dùng mới nếu chưa tồn tại trong ứng dụng
        await Promise.all(newEmails.map(async (email) => {
            try {
                const newUser = await AppUser.create({
                    Username: email,
                    Password: hashedPassword
                });

                const token = crypto.randomBytes(20).toString('hex');
                const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

                membersToInvite.push({
                    GroupID: groupId,
                    IDUser: newUser.IDUser,
                    Token: token,
                    TokenExpiry: tokenExpiry,
                    Status: 'pending'
                });

                try {
                    const headers = {
                      'Authorization': `Bearer ${authToken}` 
                    };
                    axios.post(`http://localhost:3000/api/email/sendEmailNoti`, {
                        email: email,
                        type: 'invite',
                        username: newUser.Username,
                        groupName: group.GroupName	, 
                        token: token
                    }, { headers });
                    console.log(`Email sent successfully to ${email}`);
                } catch (emailError) {
                    console.error(`Failed to send email to ${email}:`, emailError.message);
                }
            } catch (error) {
                console.error(`Failed to process ${email}:`, error.message);
            }
        }));

        // Thêm người dùng đã tồn tại vào nhóm nếu chưa phải là thành viên của nhóm đó
        for (const user of users) {
          if (!existingMemberIds.has(user.IDUser)) { // Kiểm tra nếu người dùng chưa có trong nhóm
              const token = crypto.randomBytes(20).toString('hex');
              const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
      
              membersToInvite.push({
                  GroupID: groupId,
                  IDUser: user.IDUser,
                  Token: token,
                  TokenExpiry: tokenExpiry,
                  Status: 'pending'
              });
      
              try {
                  const headers = {
                      'Authorization': `Bearer ${authToken}` 
                  };
                  axios.post(`http://localhost:3000/api/email/sendEmailNoti`, {
                      email: user.Username,
                      type: 'group',
                      username: user.Username,
                      groupName: group.GroupName	
                  }, { headers });
                  console.log(`Email sent successfully to ${user.Username}`);
              } catch (emailError) {
                  console.error(`Failed to send email to ${user.Username}:`, emailError.message);
              }
          }
      }

        if (membersToInvite.length > 0) {
            await Promise.all(membersToInvite.map(async (member) => {
                await GroupMember.upsert(member);
            }));

            const addedMembers = await GroupMember.findAll({
                where: {
                    GroupID: groupId,
                    IDUser: membersToInvite.map(member => member.IDUser)
                }
            });

            return res.status(200).json({ success: true, addedMembers });
        } else {
            console.log('No new members to add.');
            return res.status(200).json({ success: true, message: 'Không có thành viên mới để thêm' });
        }

    } catch (error) {
        console.error('Error occurred:', error.message);  
        return res.status(500).json({ success: false, message: 'Có lỗi xảy ra trong quá trình xử lý.' });
    }
}


  async getMemberByGroupID(req, res) {
    const GroupID = req.params.id;
    try {
      const groups = await Group.findAll({
        where: { GroupID: GroupID },
        include: [{
          model: AppUser,
          as: 'Members',
          through: { attributes: [] }
        }]
      });
  
      if (groups && groups.length > 0) {
        const allMembers = groups.flatMap(group => group.Members);
        res.status(200).json(allMembers); 
      } else {
        res.status(404).json({ message: 'Không tìm thấy nhóm với ID này' });
      }
    } catch (error) {
      console.error('Lỗi khi truy xuất nhóm:', error);
      res.status(500).json({ message: 'Lỗi khi truy xuất nhóm' });
    }
  }

  async removeMember(req,res){
    const { GroupID, IDUser } = req.params;
    try {
      await GroupMember.destroy({
          where: {
              GroupID: GroupID,
              IDUser: IDUser,
          },
      });
      res.status(200).json({ message: 'User removed from group successfully.' });
    } catch (error) {
        console.error('Error removing user from group:', error);
        res.status(500).json({ message: 'Failed to remove user from group.' });
    }
  }
  async getDetailAllGroup(req,res){
    const IDUser = req.params.id;
    try {
      const groups = await Group.findAll({
        where: { IDUser: IDUser },
        include: [{
          model: AppUser,
          as: 'Members',
          through: { attributes: [] }
        }]
      });
      res.status(200).json(groups)
    } catch (error) {
      console.error('Error load details from groups:', error);
      res.status(500).json({ message: 'Failed to load details from groups.' });
    }
  }
}

module.exports = new GroupController();
