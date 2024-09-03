
const WorkFlow = require('../../models/WorkFlow_Model'); 
const Stage = require('../../models/Stage_Model'); 
const Job = require('../../models/Job_Model'); 

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
        // try {
        //     const workFlow = await WorkFlow.findByPk(req.params.id);
        //     if(workFlow) {
        //         res.json(workFlow);
        //     }else {
        //         res.status(404).json({error : 'workFlow not found'})
        //     }
        // } catch (error) {
        //     res.status(500).json({error:error.message})
        // }
        try {
          const workflow = await WorkFlow.findByPk(req.params.id, {
            include: {
              model: Stage,
              as: 'Stages',
              attributes: ['IdStage', 'NameStage', 'DescriptionStatus', 'statusStage', 'nextStage', 'previousStage']
            }
          });
          console.log('Workflow:', workflow); // Debugging log
          if (!workflow) return res.status(404).json({ message: 'Workflow không tồn tại' });
          res.json(workflow);
        } catch (error) {
          console.error('Error:', error); // Debugging log
          res.status(500).json({ message: error.message });
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
    async saveWorkFLow(req,res) {
      const { name, description, stages } = req.body;
      const IDCreator = req.session.user.IDUser;
      try {
        const workflow = await WorkFlow.create({ Name: name, Description: description ,IDCreator: IDCreator });

        for (const stage of stages) {
          const newStage = await Stage.create({
            NameStage: stage.name,
            DescriptionStatus: stage.description,
            IDWorkFlow: workflow.IDWorkFlow,
            previousStage: stage.previousStage,
            nextStage: stage.nextStage,
            reviewer: stage.reviewer,
            statusStage: stage.status,
            approximateTime: stage.approxTime,
            timecompletedState: stage.timeCompleted,
            IDRecipient: stage.recipient
          });

          for (const job of stage.jobs) {
            await Job.create({
              NameJob: job.name,
              DescriptionJob: job.description,
              IDStage: newStage.IdStage
            });
          }
        }

        res.status(201).json({ message: 'Workflow created successfully!' });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
  }
    
}

module.exports = new workFlowController();
