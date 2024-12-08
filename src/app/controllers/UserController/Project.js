const { Group, Project, Job } = require('../../models/index');
const axios = require('axios');

class ProjectController {
    async detail(req,res){
        
        const ProjectID= req.params.ProjectID;
        const token =req.cookies.user_info ? JSON.parse(req.cookies.user_info).token : null;
        const headers = {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
        const response = await axios.get(`${process.env.DOMAIN}/api/project/getJobsInGroup/${ProjectID}`, { headers });
        const Project = response.data;

        // lay member trong group
        const GroupID = Project.GroupID;
        const responseGroup = await axios.get(`${process.env.DOMAIN}/api/group/getMember/${GroupID}`,{headers});
        const countMember =responseGroup.data.length;

        res.render('Project/detail',{
            layout:'main.hbs',
            Project,
            countMember,
        })
    }

    async createProject(req, res) {
        try {
            
            const token = req.cookies.user_info ? JSON.parse(req.cookies.user_info).token : null; 
            const IDCreator = req.cookies.user_info ? JSON.parse(req.cookies.user_info).IDUser : null; 
            const GroupID = req.params.GroupID; 
            const { NameProject, Progress, InfoProject, jobs } = req.body; 
            if (!NameProject || !GroupID || !IDCreator) {
                return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
            }
    
            const group = await Group.findByPk(GroupID);
            if (!group) {
                return res.status(404).json({ error: 'Group không tồn tại' });
            }
    
            const response = await axios.post(`${process.env.DOMAIN}/api/project/createByIDGroup/${GroupID}/${IDCreator}`, {
                NameProject,
                Progress,
                InfoProject
            }, {
                headers: { Authorization: `Bearer ${token}` } 
            });
    
            const newProject = response.data;

            if (jobs && jobs.length > 0) {
                const jobsResponse = await axios.post(`${process.env.DOMAIN}/api/project/addJobsToProject`, {
                    IDProject: newProject.IdProject, 
                    jobs
                }, {
                    headers: { Authorization: `Bearer ${token}` } 
                });
    
                if (!jobsResponse.data || !jobsResponse.data.jobs) {
                    return res.status(500).json({ message: 'Có lỗi xảy ra khi thêm jobs vào project.' });
                }
    
                return res.status(201).json({
                    message: 'Project và jobs đã được tạo thành công',
                    project: newProject,
                    jobs: jobsResponse.data.jobs, 
                });
            }
    
            return res.status(201).json({
                message: 'Project đã được tạo thành công nhưng không có job nào được thêm',
                project: newProject
            });
        } catch (error) {
            console.error('Lỗi khi tạo project và jobs:', error.response ? error.response.data : error.message);
            res.status(500).json({ message: 'Lỗi server' });
        }
    }
    
}

module.exports = new ProjectController();
