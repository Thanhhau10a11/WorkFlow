const axios = require('axios');

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
    async detailWorkFlow(req,res) {
        const IDWorkFlow = req.params.id;
        const token = req.session.user.token
        const headers = {
            'Authorization':`Bearer ${token}`
        }
        const response = await axios.get(`http://localhost:3000/api/userWorkFlow/detail/${IDWorkFlow}`,{headers});
        const workflow = response.data;
        res.render('WorkFlow/detailWorkFlow',{ 
            workflow,
            layout: 'main.hbs' 
        });
    }
}

module.exports = new WorkFlowController();
