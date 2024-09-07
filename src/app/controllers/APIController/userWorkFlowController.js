const WorkFlow = require('../../models/WorkFlow_Model');
const Stage = require('../../models/Stage_Model');
const Job = require('../../models/Job_Model');

class userWorkFlowController {
    // // Get all workflows by user ID
    // async getByUserId(req, res) {
    //     try {
    //         const workflows = await WorkFlow.findAll({
    //             where: { IDCreator: req.params.id }
    //         });
    //         res.json(workflows);
    //     } catch (error) {
    //         res.status(500).json({ error: error.message });
    //     }
    // }
    async getByUserId(req, res) {
        try {
            const workflows = await WorkFlow.findAll({
                where: { IDCreator: req.params.id },
                include: [{
                    model: Stage,
                    as: 'Stages',
                    include: [{
                        model: Job,
                        as: 'Jobs'
                    }]
                }]
            });
    
            res.json(workflows);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Create workflow for a specific user
    async createForUser(req, res) {
        try {
            const workFlow = await WorkFlow.create({
                ...req.body,
                IDUser: req.params.id
            });
            res.status(201).json(workFlow);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Update workflow by ID and User ID
    async updateByUserId(req, res) {
        try {
            const [updated] = await WorkFlow.update(req.body, {
                where: { 
                    IDWorkFlow: req.params.id,
                    IDUser: req.params.userId
                }
            });
            if (updated) {
                const updatedWorkFlow = await WorkFlow.findOne({
                    where: {
                        IDWorkFlow: req.params.id,
                        IDUser: req.params.userId
                    }
                });
                res.json(updatedWorkFlow);
            } else {
                res.status(404).json({ error: 'WorkFlow not found' });
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Delete workflow by ID and User ID
    async deleteByUserId(req, res) {
        try {
            const deleted = await WorkFlow.destroy({
                where: { 
                    IDWorkFlow: req.params.id,
                    IDUser: req.params.userId
                }
            });
            if (deleted) {
                res.status(200).json({ message: 'Xóa thành công' });
            } else {
                res.status(404).json({ error: 'WorkFlow not found' });
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    async getStagesByWorkFlowID(req,res){
        try {
            const workflow = await WorkFlow.findOne({
            where: { IDWorkFlow: req.params.id, },
            include: [{
                model: Stage,
                as: 'Stages',
            }]
            });
        
            if (!workflow) {
                res.status(500).json('Workflow not found');
            }
        
            res.json(workflow);
        } catch (error) {
            res.status(500).json('Error fetching workflow:', error);
        }
    }
}

module.exports = new userWorkFlowController();