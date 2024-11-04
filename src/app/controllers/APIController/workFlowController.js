
const WorkFlow = require('../../models/WorkFlow_Model');
const Stage = require('../../models/Stage_Model');
const Job = require('../../models/Job_Model');
const AppUser = require('../../models/User_Model');
const Group = require('../../models/Group_Model');
const nodemailer = require('nodemailer');
const sendNotification = require('../../../util/notifyService');
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
            // Find all jobs related to the workflow
            const jobs = await Job.findAll({
                where: { IDWorkFlow: req.params.id }
            });
    
            const incompleteJobs = jobs.some(job => job.Status !== 'completed');
    
            if (incompleteJobs) {
                return res.status(400).json({ error: 'Cannot delete workflow as some jobs are not completed' });
            }
    
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
    // async saveWorkFLow(req, res) {
    //     const { GroupID,name, description, stages } = req.body;
    //     const IDCreator = req.session.user.IDUser;
    //     //const token = req.session.user.token
    //     const authHeader = req.headers['authorization'];
    //     const tokenHeader = authHeader && authHeader.split(' ')[1];
    //     const token = tokenHeader;

    //     const group = await Group.findByPk(GroupID);
    //     if (!group) {
    //         throw new Error('Group not found');
    //     }

    //     try {
    //         const workflow = await WorkFlow.create({
    //             Name: name,
    //             Description: description,
    //             IDCreator: IDCreator,
    //             GroupID:GroupID,
    //         });

    //         const stageIds = [];
    //         const createdStages = [];

    //         for (const stage of stages) {
    //             const createdStage = await Stage.create({
    //                 NameStage: stage.name,
    //                 DescriptionStatus: stage.description,
    //                 IDWorkFlow: workflow.IDWorkFlow,
    //                 approximateTime: stage.approxTime,
    //                 timecompletedState: stage.timeCompleted,
    //                 EmailRecipient: stage.recipient
    //             });
    //             stageIds.push(createdStage.IdStage);
    //             createdStages.push(createdStage);
    //         }

    //         for (let i = 0; i < createdStages.length; i++) {
    //             const stage = createdStages[i];
    //             const previousStageId = i > 0 ? createdStages[i - 1].IdStage : null;
    //             const nextStageId = i < createdStages.length - 1 ? createdStages[i + 1].IdStage : null;

    //             await Stage.update({
    //                 previousStage: previousStageId,
    //                 nextStage: nextStageId
    //             }, {
    //                 where: { IdStage: stage.IdStage }
    //             });
    //         }

    //         for (const stage of createdStages) {
    //             if (stage.EmailRecipient) {
    //                 const email = stage.EmailRecipient;
    //                 const invitationUrl = `${process.env.DOMAIN}/api/email/sendEmailNoti`;

    //                 axios.post(invitationUrl, {
    //                     email: email,
    //                     type: 'stage',
    //                     username: email,
    //                     stageName: stage.NameStage,
    //                 }, {
    //                     headers: {
    //                         'Content-Type': 'application/json',
    //                         'Authorization': `Bearer ${token}`
    //                     }
    //                 });
    //             }
    //         }

    //         res.status(201).json({
    //             message: 'Workflow created and invitations sent successfully!',
    //             workflowId: workflow.IDWorkFlow,
    //             stageIds: stageIds
    //         });
    //     } catch (error) {
    //         console.error('Error creating workflow and sending invitations:', error);
    //         res.status(500).json({ error: error.message });
    //     }
    // }
    async saveWorkFLow(req, res) {
        const { GroupID, name, description, stages } = req.body;
        const IDCreator = req.user?.IDUser;
        const authHeader = req.headers['authorization'];
        const tokenHeader = authHeader && authHeader.split(' ')[1];
        const token = tokenHeader;

        try {
            const group = await Group.findByPk(GroupID);
            if (!group) {
                return res.status(404).json({ message: 'Group not found' });
            }

            const workflow = await WorkFlow.create({
                Name: name,
                Description: description,
                IDCreator: IDCreator,
                GroupID: GroupID,
            });

            const stageIds = [];
            const createdStages = [];

            for (const stage of stages) {
                let recipientId = null;
                let emailRecipient = null;

                // Nếu có người nhận, tìm ID người nhận từ email
                if (stage.recipient) {
                    const recipient = await AppUser.findOne({ where: { Username: stage.recipient } });

                    recipientId = recipient.IDUser; // Lưu ID người nhận
                    emailRecipient = stage.recipient; // Lưu email của người nhận
                }

                // Tạo stage với ID người nhận (có thể là null)
                const createdStage = await Stage.create({
                    NameStage: stage.name,
                    DescriptionStatus: stage.description,
                    IDWorkFlow: workflow.IDWorkFlow,
                    approximateTime: stage.approxTime,
                    timecompletedState: stage.timeCompleted,
                    IDRecipient: recipientId, // Có thể là null
                    EmailRecipient: emailRecipient, // Có thể là null
                });

                stageIds.push(createdStage.IdStage);
                createdStages.push(createdStage);
            }

            // Cập nhật previousStage và nextStage cho các stage đã tạo
            for (let i = 0; i < createdStages.length; i++) {
                const stage = createdStages[i];
                const previousStageId = i > 0 ? createdStages[i - 1].IdStage : null;
                const nextStageId = i < createdStages.length - 1 ? createdStages[i + 1].IdStage : null;

                await Stage.update({
                    previousStage: previousStageId,
                    nextStage: nextStageId,
                }, {
                    where: { IdStage: stage.IdStage },
                });
            }

            // Gửi email thông báo đến người nhận
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
                            'Authorization': `Bearer ${token}`,
                        },
                    });
                    // Gửi thông báo qua socket
                    const notificationTitle = `Bạn đã nhận được một stage mới: ${stage.NameStage}`;
                    const notificationMessage = `Bạn đã được nhận Stage "${stage.NameStage}" trong workflow "${name}".`;
                    await sendNotification(stage.IDRecipient, notificationTitle, notificationMessage, req.app.locals.io);
                }
            }

            res.status(201).json({
                message: 'Workflow created and invitations sent successfully!',
                workflowId: workflow.IDWorkFlow,
                stageIds: stageIds,
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

            console.log(stages);

            if (!Array.isArray(stages) || stages.length === 0) {
                return res.status(400).json({ error: 'Dữ liệu stages không hợp lệ' });
            }

            const workflow = await WorkFlow.findByPk(workflowId);
            if (!workflow) {
                return res.status(404).json({ error: 'Không tìm thấy workflow' });
            }

            const existingStages = await Stage.findAll({
                where: { IDWorkFlow: workflowId },
                order: [['IdStage', 'ASC']]
            });

            const newStages = await Promise.all(stages.map(async (stage) => {

                // Lấy IDUser từ AppUser dựa trên email của người nhận
                const user = await AppUser.findOne({ where: { Username: stage.EmailRecipient } });
                const IDRecipient = user ? user.IDUser : null;

                return await Stage.create({
                    NameStage: stage.NameStage,
                    DescriptionStatus: stage.DescriptionStatus,
                    IDWorkFlow: workflowId,
                    approximateTime: stage.approximateTime,
                    //timecompletedState: stage.timecompletedState,
                    EmailRecipient: stage.EmailRecipient,
                    IDRecipient: IDRecipient, 
                });
            }));

            const allStages = [...existingStages, ...newStages];

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

            // Gửi email thông báo và thông báo qua socket cho người nhận stage
            console.log(newStages)
            for (const stage of newStages) {
                if (stage.EmailRecipient) {
                    const email = stage.EmailRecipient;
            
                    // Lấy IDUser từ AppUser dựa trên email
                    const user = await AppUser.findOne({ where: { Username: email } });
                    
                    if (user) {
                        const IDRecipient = user.IDUser; 
            
                        const invitationUrl = `${process.env.DOMAIN}/api/email/sendEmailNoti`;
            
                        // Gửi email thông báo
                        axios.post(invitationUrl, {
                            email: email,
                            type: 'stage',
                            username: email,
                            stageName: stage.NameStage,
                        }, {
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${req.headers['authorization'].split(' ')[1]}`,
                            },
                        });
            
                        // Gửi thông báo qua socket
                        const notificationTitle = `Bạn đã nhận được một stage mới: ${stage.NameStage}`;
                        const notificationMessage = `Bạn đã được nhận Stage "${stage.NameStage}" trong workflow "${workflow.Name}".`;
                        await sendNotification(IDRecipient, notificationTitle, notificationMessage, req.app.locals.io);
                    } else {
                        console.error(`Không tìm thấy người dùng với email: ${email}`);
                    }
                }
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
    async createForGroup(req, res) {
        try {
            const workFlow = await WorkFlow.create({
                ...req.body,
            });
            res.status(201).json(workFlow);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    async getWorkflowsInGroup(req, res) {
        const GroupID = req.params.GroupID;
        const group = await Group.findByPk(GroupID, {
            include: [{ model: WorkFlow, as: 'GroupWorkFlow' }]
        });
        if (!group) {
            throw new Error('Group not found');
        }
        return res.status(201).json(group.GroupWorkFlow);
    }

}

module.exports = new workFlowController();
