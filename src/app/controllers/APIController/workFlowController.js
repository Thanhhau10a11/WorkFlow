
const WorkFlow = require('../../models/WorkFlow_Model'); 
const Stage = require('../../models/Stage_Model'); 
const Job = require('../../models/Job_Model'); 
const nodemailer =require('nodemailer');
const axios = require('axios');

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
          const workflow = await WorkFlow.findByPk(req.params.id, {
            include: {
              model: Stage,
              as: 'Stages',
              attributes: ['IdStage', 'NameStage', 'DescriptionStatus', 'statusStage', 'nextStage', 'previousStage']
            }
          });
          if (!workflow) return res.status(404).json({ message: 'Workflow không tồn tại' });
          res.json(workflow);
        } catch (error) {
          console.error('Error:', error); 
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
    async saveWorkFLow(req, res) {
      const { name, description, stages } = req.body; // Không cần inviteManagers nữa
      const IDCreator = req.session.user.IDUser;
      
      try {
          const workflow = await WorkFlow.create({ Name: name, Description: description, IDCreator: IDCreator });
  
          const stageIds = [];
  
          for (const stage of stages) {
              const createdStage = await Stage.create({
                  NameStage: stage.name,
                  DescriptionStatus: stage.description,
                  IDWorkFlow: workflow.IDWorkFlow,
                  previousStage: stage.previousStage,
                  nextStage: stage.nextStage,
                  approximateTime: stage.approxTime,
                  timecompletedState: stage.timeCompleted,
                  EmailRecipient: stage.recipient 
              });
              stageIds.push(createdStage.IdStage); 
          }
          if (stageIds.length > 0) {
              for (const stageId of stageIds) {
                  // Lấy các stage từ cơ sở dữ liệu để lấy email recipient
                  const stage = await Stage.findByPk(stageId);
                  if (stage && stage.EmailRecipient) {
                      const email = stage.EmailRecipient;
                      const invitationUrl = `http://localhost:3000/api/email/${email}`;
                      
                      // Gọi API để gửi email
                      await axios.post(invitationUrl, {
                          email: email,
                          workflowId: workflow.IDWorkFlow,
                          stageId: stageId
                      }, {
                          headers: {
                              'Content-Type': 'application/json'
                          }
                      });
                  }
              }
          }
  
          res.status(201).json({ 
              message: 'Workflow created and invitations sent successfully!',
              workflowId: workflow.IDWorkFlow,
              stageIds: stageIds
          });
      } catch (error) {
          console.error('Error creating workflow and sending invitations:', error);
          res.status(500).json({ error: error.message });
      }
    }
}

module.exports = new workFlowController();
