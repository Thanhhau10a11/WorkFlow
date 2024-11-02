const axios = require('axios');
const { Group, GroupMember } = require('../../models/index');
class GroupController {
    // async index(req, res) {
    //     const token = req.session.user.token
    //     const IDUser = req.session.user.IDUser
    //     const response = await axios.get(`${process.env.DOMAIN}/api/group/get/${IDUser}`, {
    //         headers: {
    //             'Authorization': `Bearer ${token}`,
    //         }
    //     });
    //     const groups = response.data
    //     res.render('Group/home', {
    //         groups,
    //         layout: 'main.hbs'
    //     });
    // }
    async index(req, res) {  
        const token = req.session.user.token;  
        const IDUser = req.session.user.IDUser;  
    
        try {  
            const response = await axios.get(`${process.env.DOMAIN}/api/group/get/${IDUser}`, {  
                headers: {  
                    'Authorization': `Bearer ${token}`,  
                }  
            });  
    
            const groups = response.data; 
            res.render('Group/home', {  
                groups,  
                layout: 'main.hbs'  
            });  
        } catch (error) {  
            console.error('Lỗi khi gọi API:', error);  
    
            if (error.response) {  
                if (error.response.status === 404) {  
                    return res.status(404).render('Group/home', {  
                        message: 'Không tìm thấy nhóm nào cho người dùng này',  
                        layout: 'main.hbs'  
                    });  
                }  
    
                return res.status(500).render('Group/home', {  
                    message: 'Có lỗi xảy ra khi lấy thông tin nhóm.',  
                    layout: 'main.hbs'  
                });  
            }  
    
            return res.status(500).render('Group/home', {  
                message: 'Có lỗi xảy ra khi kết nối tới API.',  
                layout: 'main.hbs'  
            });  
        }  
    }
    async formCreate(req, res) {
        res.render('Group/create', { layout: 'main.hbs' });
    }
    async create(req, res) {
        try {
            
            const GroupName = req.body.GroupName
            const IDUser = req.session.user.IDUser

            const groupData = {
                groupName: GroupName,
                IDUser: IDUser,
            }

            const token = req.session.user.token
            const headers = {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            };
            const response = await axios.post(`${process.env.DOMAIN}/api/group/create`, groupData, { headers })
            if (response.status === 201) {
                res.json({ message: 'Group created successfully', redirect: '/group/' });
            } else {
                console.log("Tạo group thất bại", response.data);
                res.status(500).json({ message: "Thất bại" });
            }
        } catch (error) {
            console.error('Error sending request:', error.message);
            res.status(500).json({ error: 'Failed to create group' });
        }
    }
    async detail(req, res) {
        const GroupID = req.params.id
        const token = req.session.user.token
        const IDUser = req.session.user.IDUser
        const headers = {
            Authorization: `Bearer ${token}`
        };
        const response = await axios.get(`${process.env.DOMAIN}/api/group/getMember/${GroupID}`, { headers });
        const members = response.data

        const responseGroup = await axios.get(`${process.env.DOMAIN}/api/group/${GroupID}`, { headers })
        const Group = responseGroup.data

        const responseWorkFlow = await axios.get(`${process.env.DOMAIN}/api/userWorkFlow/getByGroupID/${GroupID}`, { headers });
        const workflows = responseWorkFlow.data;

        const responseProject = await axios.get(`${process.env.DOMAIN}/api/project/getProjectInGroup/${GroupID}`,{headers});
        const Project = responseProject.data;


        

        res.render('Group/detail', {
            Group,
            members,
            workflows,
            Project,
            layout: 'main.hbs'
        })
    }
    async formAddMember(req, res) {
        const GroupID = req.params.id;
        res.render('Group/addMember', {
            GroupID,
            layout: 'main.hbs',
        })
    }
    async removeMember(req, res) {
        const { GroupID, IDUser } = req.params;
        try {
            const token = req.session.user.token;

            const headers = {
                Authorization: `Bearer ${token}`
            };

            const response = await axios.post(`${process.env.DOMAIN}/api/group/removeMember/${GroupID}/${IDUser}`, {}, { headers });

            if (response.status === 200) {
                res.status(200).json({ message: 'User removed successfully.' });
            } else {
                res.status(500).json({ message: 'Failed to remove user.' });
            }
        } catch (error) {
            console.error('Error removing user:', error.message);
            res.status(500).json({ message: 'An error occurred while removing the user.' });
        }
    }
}

module.exports = new GroupController();
