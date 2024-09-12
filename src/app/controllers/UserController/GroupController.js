const axios = require('axios');
const Group = require('../../models/Group_Model');
const { response } = require('express');
class GroupController {
    async index(req, res) {
        const IDUser = req.session.user.IDUser
        const respones = await axios.get(`http:///localhost:3000/api/group/get/${IDUser}`)
        const groups =respones.data
        res.render('Group/home', {
            groups, 
            layout: 'main.hbs' 
        });
    }
    async formCreate(req,res) {
        res.render('Group/create', { layout: 'main.hbs' });
    }
    async create(req,res) {
        try {
            const GroupName = req.body.GroupName
            const IDUser = req.session.user.IDUser
            const groupData = {
                groupName:GroupName,
                IDUser:IDUser,
            }
            const response = await axios.post(`http://localhost:3000/api/group/create`,groupData)
            if(response.status===201){
                res.redirect('/group/')
            }else {
                console.log("Tạo group thất bại" ,response.data)
                res.status(500).json({message:"Thất bại"})
            }
        } catch (error) {
            console.error('Error sending request:', error.message);
            res.status(500).json({ error: 'Failed to create group' });
        }
    }
    async detail(req,res) {
        const GroupID = req.params.id
        const response =await axios.get(`http://localhost:3000/api/group/getMember/${GroupID}`);
        const responseGroup = await axios.get(`http://localhost:3000/api/group/${GroupID}`)
        const Group =responseGroup.data
        const members = response.data
        res.render('Group/detail',{
            Group,
            members,
            layout:'main.hbs'
        }) 
    }
    async formAddMember(req,res) {
        const GroupID = req.params.id;
        res.render('Group/addMember',{
            GroupID,
            layout : 'main.hbs',
        })
    }
    
    
}

module.exports = new GroupController();
