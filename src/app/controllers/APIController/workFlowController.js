
const WorkFlow = require('../../models/WorkFlow_Model'); 

class workFlowController {
    async getALl(req, res) {
        try{
            const workflow = await WorkFlow.findAll();
            res.json(workflow);
        }catch(err){
            res.status(500).json({error:err.message})
        }
    }
    async getById(req,res) {
        try {
            const workFlow = await WorkFlow.findByPk(req.params.id);
            if(workFlow) {
                res.json(workFlow);
            }else {
                res.status(404).json({error : 'workFlow not found'})
            }
        } catch (error) {
            res.status(500).json({error:error.message})
        }
    }
    async create(req,res) {
        try {
            const workFlow = await WorkFlow.create(req.body); 
            res.status(201).json(workFlow);
          } catch (error) {
            res.status(500).json({ error: error.message });
          }
    }
    async update(req,res) {
        try {
            const [updated] = await WorkFlow.update(req.body, {
              where: { IDWorkFlow: req.params.id }
            });
            if (updated) {
              const updatedWorkFlow = await WorkFlow.findByPk(req.params.id);
              res.json(updatedWorkFlow);
            } else {
              res.status(404).json({ error: 'WorkFlow not found' });
            }
          } catch (error) {
            res.status(500).json({ error: error.message });
          }
    }
    async delete(req,res) {
        try {
            const deleted = await WorkFlow.destroy({
              where: { IDWorkFlow: req.params.id }
            });
            if (deleted) {
              res.status(200).json({message:'Xóa thành công'});
            } else {
              res.status(404).json({ error: 'WorkFlow not found' });
            }
          } catch (error) {
            res.status(500).json({ error: error.message });
          }
    }
}

module.exports = new workFlowController();
