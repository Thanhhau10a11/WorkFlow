const axios = require('axios');
const Stage = require('../../models/Stage_Model');
class WorkFlowController {
    async index(req, res) {
        try {

            const IDUser = req.session.user.IDUser
            const token = req.session.user.token
            const headers = {
                'Authorization': `Bearer ${token}`
            }
            const response = await axios.get(`${process.env.DOMAIN}/api/userWorkFlow/${IDUser}`, { headers });
            const workflows = response.data;
            res.render('WorkFLow/homeWorkFlow', { workflows });
        } catch (error) {
            console.error('Error fetching workflows:', error);
            res.status(500).send('Error fetching workflows.');
        }
    }

    async createWorkFLow(req, res) {
        const GroupID = req.params.GroupID;
        const token = req.session.user.token
        const IDUser = req.session.user.IDUser
        const headers = {
            'Authorization': `Bearer ${token}`
        }
        // const response = await axios.get(`${process.env.DOMAIN}/api/group/getDetailAllGroup/${IDUser}`, { headers })
        // const groups = response.data
        // res.render('WorkFLow/createWorkFlow', { layout: 'main.hbs', groups });
        const response = await axios.get(`${process.env.DOMAIN}/api/group/getMember/${GroupID}`, { headers });
        const responseGroup = await axios.get(`${process.env.DOMAIN}/api/group/${GroupID}`, { headers });
        const Group = responseGroup.data;
        const members = response.data;
        res.render('WorkFLow/createWorkFlow', { layout: 'main.hbs', members,Group });
    }
    async detailWorkFlow(req, res) {
        const IDWorkFlow = req.params.id;
        const token = req.session.user.token;

        try {
            const headers = {
                'Authorization': `Bearer ${token}`
            };

            const response = await axios.get(`${process.env.DOMAIN}/api/userWorkFlow/detail/${IDWorkFlow}`, { headers });
            const workflow = response.data;
            
            const GroupID = workflow.GroupID;

            const stages = await Stage.findAll({
                where: { IDWorkFlow: IDWorkFlow },
                order: [['IdStage', 'ASC']]
            });

            const stagesJSON = stages.map(stage => stage.toJSON());

            const orderedStages = [];
            const stageMap = {};

            stagesJSON.forEach(stage => {
                stageMap[stage.IdStage] = stage;
            });

            // Sắp xếp các stage dựa trên previousStage và nextStage
            stagesJSON.forEach(stage => {
                // Lấy stage trước
                if (stage.previousStage) {
                    const previousStage = stageMap[stage.previousStage];
                    if (previousStage) {
                        previousStage.nextStage = stage.IdStage;
                    }
                }

                // Thêm stage vào danh sách orderedStages
                orderedStages.push(stage);
            });

            // Tạo một danh sách stage mà không bị mất liên kết
            const sortedStages = [];
            let currentStage = orderedStages.find(stage => !stage.previousStage);

            while (currentStage) {
                sortedStages.push(currentStage);
                currentStage = orderedStages.find(stage => stage.previousStage === currentStage.IdStage);
            }

            // Lay du lieu nguoi dung trong nhom
            const IDUser = req.session.user.IDUser
            // const responseGroups = await axios.get(`${process.env.DOMAIN}/api/group/getDetailAllGroup/${IDUser}`, { headers })
            // const groups = responseGroups.data
            const responseMember = await axios.get(`${process.env.DOMAIN}/api/group/getMember/${GroupID}`, { headers });
            const responseGroup = await axios.get(`${process.env.DOMAIN}/api/group/${GroupID}`, { headers });
            const Group = responseGroup.data;
            const members = responseMember.data;

            res.render('WorkFlow/detailWorkFlow', {
                workflow,
                stages: sortedStages,
                Group,
                members,
                layout: 'main.hbs'
            });

        } catch (error) {
            console.error('Error fetching workflow details:', error);
            res.status(500).json({ error: error.message });
        }
    }


}

module.exports = new WorkFlowController();
