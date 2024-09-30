
const WorkFlow = require('../../models/WorkFlow_Model');
const Stage = require('../../models/Stage_Model');
const Job = require('../../models/Job_Model');
const nodemailer = require('nodemailer');
const axios = require('axios');

class workFlowController {
    async getALl(req, res) {
        try {
            const workflow = await WorkFlow.findAll();
            res.json(workflow);
        } catch (err) {
            res.status(500).json({ error: err.message })
        }
    }
    async getById(req, res) {
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
    async create(req, res) {
        try {
            const workFlow = await WorkFlow.create(req.body);
            res.status(201).json(workFlow);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    async update(req, res) {
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
    async delete(req, res) {
        try {
            const deleted = await WorkFlow.destroy({
                where: { IDWorkFlow: req.params.id }
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

    //     async saveWorkFLow(req, res) {
    //       const { name, description, stages } = req.body;
    //       const IDCreator = req.session.user.IDUser;

    //       try {
    //           const workflow = await WorkFlow.create({
    //               Name: name,
    //               Description: description,
    //               IDCreator: IDCreator
    //           });

    //           const stageIds = [];
    //           const createdStages = [];

    //           for (const stage of stages) {
    //               const createdStage = await Stage.create({
    //                   NameStage: stage.name,
    //                   DescriptionStatus: stage.description,
    //                   IDWorkFlow: workflow.IDWorkFlow,
    //                   approximateTime: stage.approxTime,
    //                   timecompletedState: stage.timeCompleted,
    //                   EmailRecipient: stage.recipient
    //               });
    //               stageIds.push(createdStage.IdStage);
    //               createdStages.push(createdStage); 
    //           }

    //           for (let i = 0; i < createdStages.length; i++) {  
    //               const stage = createdStages[i];
    //               const previousStageId = i > 0 ? createdStages[i - 1].IdStage : null;
    //               const nextStageId = i < createdStages.length - 1 ? createdStages[i + 1].IdStage : null;

    //               await Stage.update({
    //                   previousStage: previousStageId,
    //                   nextStage: nextStageId
    //               }, {
    //                   where: { IdStage: stage.IdStage }
    //               });
    //           }

    //           for (const stageId of stageIds) {
    //               const stage = await Stage.findByPk(stageId);
    //               if (stage && stage.EmailRecipient) {
    //                   const email = stage.EmailRecipient;
    //                   const invitationUrl = `http://localhost:3000/api/email/${email}`;

    //                   await axios.post(invitationUrl, {
    //                       email: email,
    //                       workflowId: workflow.IDWorkFlow,
    //                       stageId: stageId
    //                   }, {
    //                       headers: {
    //                           'Content-Type': 'application/json'
    //                       }
    //                   });
    //               }
    //           }

    //           res.status(201).json({
    //               message: 'Workflow created and invitations sent successfully!',
    //               workflowId: workflow.IDWorkFlow,
    //               stageIds: stageIds
    //           });
    //       } catch (error) {
    //           console.error('Error creating workflow and sending invitations:', error);
    //           res.status(500).json({ error: error.message });
    //       }
    //   }
    async saveWorkFLow(req, res) {
        const { name, description, stages } = req.body;
        const IDCreator = req.session.user.IDUser;
        const token = req.session.user.token

        try {
            const workflow = await WorkFlow.create({
                Name: name,
                Description: description,
                IDCreator: IDCreator
            });

            const stageIds = [];
            const createdStages = [];

            for (const stage of stages) {
                const createdStage = await Stage.create({
                    NameStage: stage.name,
                    DescriptionStatus: stage.description,
                    IDWorkFlow: workflow.IDWorkFlow,
                    approximateTime: stage.approxTime,
                    timecompletedState: stage.timeCompleted,
                    EmailRecipient: stage.recipient
                });
                stageIds.push(createdStage.IdStage);
                createdStages.push(createdStage);
            }

            for (let i = 0; i < createdStages.length; i++) {
                const stage = createdStages[i];
                const previousStageId = i > 0 ? createdStages[i - 1].IdStage : null;
                const nextStageId = i < createdStages.length - 1 ? createdStages[i + 1].IdStage : null;

                await Stage.update({
                    previousStage: previousStageId,
                    nextStage: nextStageId
                }, {
                    where: { IdStage: stage.IdStage }
                });
            }

            for (const stage of createdStages) {
                if (stage.EmailRecipient) {
                    const email = stage.EmailRecipient;
                    const invitationUrl = `${process.env.DOMAIN}/api/email/sendEmailNoti`;

                    axios.post(invitationUrl, {
                        email: email,
                        type: 'stage',
                        username: email,
                        stageName: stage.NameStage,
                    }, {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        }
                    });
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

    async saveStageByWorkFlowID(req, res) {
        try {
            const workflowId = req.params.id;
            const { stages } = req.body;

            if (!Array.isArray(stages) || stages.length === 0) {
                return res.status(400).json({ error: 'Dữ liệu stages không hợp lệ' });
            }

            const workflow = await WorkFlow.findByPk(workflowId);
            if (!workflow) {
                return res.status(404).json({ error: 'Không tìm thấy workflow' });
            }

            // Lấy các stages hiện có cho workflow này
            const existingStages = await Stage.findAll({
                where: { IDWorkFlow: workflowId },
                order: [['IdStage', 'ASC']]
            });

            // Tạo các stage mới
            const newStages = await Promise.all(stages.map(async (stage) => {
                return await Stage.create({
                    NameStage: stage.NameStage,
                    DescriptionStatus: stage.DescriptionStatus,
                    IDWorkFlow: workflowId,
                    approximateTime: stage.approximateTime,
                    //timecompletedState: stage.timecompletedState,
                    EmailRecipient: stage.EmailRecipient,
                });
            }));

            // Kết hợp các stage cũ và mới
            const allStages = [...existingStages, ...newStages];

            // Cập nhật các trường previousStage và nextStage
            for (let i = 0; i < allStages.length; i++) {
                const currentStage = allStages[i];
                const previousStageId = i > 0 ? allStages[i - 1].IdStage : null;
                const nextStageId = i < allStages.length - 1 ? allStages[i + 1].IdStage : null;

                await Stage.update({
                    previousStage: previousStageId,
                    nextStage: nextStageId
                }, {
                    where: { IdStage: currentStage.IdStage }
                });
            }

            res.status(201).json({
                success: true,
                message: 'Lưu các stages thành công!',
                newStages
            });
        } catch (error) {
            console.error('Lỗi khi lưu các stages:', error);
            res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
        }
    }


}

module.exports = new workFlowController();
