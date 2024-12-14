
const { AppUser, GroupMember, Group,Workflow,Project ,UserRole ,Role} = require('../../models/index')
const axios = require('axios');
const bcrypt = require('bcryptjs');
const { request } = require('express');
const Sequelize = require('sequelize')
const { Op } = require('sequelize');
const {sendNotification} = require('../../../util/notifyService');
const checkUser = require('../../../util/checkInGroup');
require('dotenv').config();


const crypto = require('crypto');


class GroupController {
  async getALl(req, res) {
    try {
      const groups = await Group.findAll();
      res.json(groups);
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  }
  async getById(req, res) {
    try {
     
      const group = await Group.findByPk(req.params.id);
      if (Group) {
        res.json(group);
      } else {
        res.status(404).json({ error: 'group not found' })
      }
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  }
  async create(req, res) {

    try {
      const { groupName, IDUser } = req.body;

      if (!groupName || !IDUser) {
        return res.status(400).json({ error: 'Tên nhóm và ID người dùng là bắt buộc.' });
      }

      const newGroup = await Group.create({
        GroupName: groupName,
        IDUser: IDUser
      });
       // Tạo project mặc định cho group mới
       const defaultProject = await Project.create({
        NameProject: 'Default Project',
        IDCreator: IDUser,
        InfoProject: 'This is the default project for this group.',
        GroupID: newGroup.GroupID, 
        Progress:0,
        isDefault: true
    });

      return res.status(201).json({ message: 'Nhóm đã được tạo thành công.', group: newGroup });
    } catch (error) {
      console.error('Lỗi khi tạo nhóm:', error);
      return res.status(500).json({ error: 'Có lỗi xảy ra khi tạo nhóm.' });
    }
  }
  async update(req, res) {
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
  async delete(req, res) {
    try {
      const deleted = await Group.destroy({
        where: { GroupID: req.params.id }
      });
      if (deleted) {
        res.status(200).json({ message: 'Xóa thành công' });
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
        attributes: {
          include: [
            [Sequelize.literal(`(SELECT COUNT(*) FROM groupmember WHERE groupmember.GroupID = group.GroupID)`), 'memberCount'],
          ],
        },
        where: {
          [Op.or]: [
            { IDUser: req.params.id },
            { '$Members.IDUser$': req.params.id },
          ],
        },
        include: [
          {
            model: AppUser,
            as: 'Members',
            attributes: [],
            through: {
              model: GroupMember,
              attributes: [],
            },
          },
        ],
        order: [['updatedAt', 'DESC']],
      });

      if (!groups || groups.length === 0) {
        res.status(404).json({ message: 'Không tìm thấy nhóm nào cho người dùng này' });
        return;
      }

      res.json(groups);
    } catch (error) {
      console.error('Lỗi khi lấy nhóm:', error);
      res.status(500).json({ error: error.message });
    }

  }

  async addMember(req, res) {
    const { emails, groupId } = req.body;

    //const authToken = req.session.user.token;
    const authHeader = req.headers['authorization'];
    const tokenHeader = authHeader && authHeader.split(' ')[1];
    const authToken = tokenHeader;

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

          //add role defailt
          const defaultRole = await Role.findOne({ where: { RoleName: 'user' } });

          if (!defaultRole) {
            throw new Error('Vai trò mặc định không tồn tại');
          }
      
          // Gán vai trò mặc định cho người dùng
          await newUser.addRole(defaultRole);



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
            axios.post(`${process.env.DOMAIN}/api/email/sendEmailNoti`, {
              email: email,
              type: 'invite',
              username: newUser.Username,
              groupName: group.GroupName,
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
            axios.post(`${process.env.DOMAIN}/api/email/sendEmailNoti`, {
              email: user.Username,
              type: 'group',
              username: user.Username,
              groupName: group.GroupName,
              token: token
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


        // gui thong bao cho nhung nguoi duoc them vao nhom
        const notificationTitle = "Bạn đã được thêm vào nhóm";
        const notificationMessage = `Bạn đã được thêm vào nhóm "${group.GroupName}".`;

        // Gửi thông báo cho tất cả thành viên được thêm
        await Promise.all(membersToInvite.map(async (member) => {
            await sendNotification(member.IDUser, notificationTitle, notificationMessage, req.app.locals.io);
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

  async removeMember(req, res) {
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
  async getDetailAllGroup(req, res) {
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
  async getDatailInGroup(req,res) {
    try {
      const groupId = req.params.GroupID;
      const token = req.headers['authorization'];
      const response =await axios.get(`${process.env.DOMAIN}/api/group/getMember/${groupId}`, {
        headers: {
          Authorization: token, 
        },
      });
      const members =  response.data;
      const workflows = await Workflow.findAll({ where: { groupId } });
      const projects = await Project.findAll({ where: { groupId } });
      
      res.json({
        workflows,
        projects,
        members
      });
    } catch (error) {
      res.status(500).json({ error: 'Error fetching workflows and projects' });
    }
  }
}

module.exports = new GroupController();
