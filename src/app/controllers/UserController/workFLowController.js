const axios = require('axios');
const Stage = require('../../models/Stage_Model');
class WorkFlowController {
    async index(req, res) {
        try {

            const IDUser = req.session.user.IDUser
            const token =req.session.user.token
            const headers = {
                'Authorization':`Bearer ${token}`
            }
            const response = await axios.get(`http://localhost:3000/api/userWorkFlow/${IDUser}`,{headers});
            const workflows = response.data;
            res.render('WorkFLow/homeWorkFlow', { workflows });
        } catch (error) {
            console.error('Error fetching workflows:', error);
            res.status(500).send('Error fetching workflows.');
        }
    }

    createWorkFLow(req, res) {
        res.render('WorkFLow/createWorkFlow', { layout: 'main.hbs' });
    }
    // async detailWorkFlow(req,res) {
    //     const IDWorkFlow = req.params.id;
    //     const token = req.session.user.token
    //     const headers = {
    //         'Authorization':`Bearer ${token}`
    //     }
    //     const response = await axios.get(`http://localhost:3000/api/userWorkFlow/detail/${IDWorkFlow}`,{headers});
    //     const workflow = response.data;
    //     res.render('WorkFlow/detailWorkFlow',{ 
    //         workflow,
    //         layout: 'main.hbs' 
    //     });
    // }
    async detailWorkFlow(req, res) {
        const IDWorkFlow = req.params.id;
        const token = req.session.user.token;
    
        try {
            const headers = {
                'Authorization': `Bearer ${token}`
            };
            
            const response = await axios.get(`http://localhost:3000/api/userWorkFlow/detail/${IDWorkFlow}`, { headers });
            const workflow = response.data;
    
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
    
            res.render('WorkFlow/detailWorkFlow', { 
                workflow,
                stages: sortedStages,
                layout: 'main.hbs' 
            });
    
        } catch (error) {
            console.error('Error fetching workflow details:', error);
            res.status(500).json({ error: error.message });
        }
    }
    

}

module.exports = new WorkFlowController();
