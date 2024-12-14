
const { sequelize, AppUser, Group, Workflow, Job, Project, JobStage, Stage } = require('../../models/index')
const { getNextStage, getPreviousStage, checkIfStageAssigned } = require('../../../util/getNextAndPreStage');
const updateProjectProgress = require('../../../util/updateProjectProgress');
const axios = require('axios');
const { sendNotification, sendJobCount, sendJobStageCount } = require('../../../util/notifyService');
require('dotenv').config();



class JobCOntroller {
  async getALl(req, res) {
    try {
      const jobs = await Job.findAll();
      res.json(jobs);
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  }
  async getById(req, res) {
    try {
      const job = await Job.findByPk(req.params.id);
      if (job) {
        res.json(job);
      } else {
        res.status(404).json({ error: 'job not found' })
      }
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  }
  async create(req, res) {
    try {
      const job = await Job.create(req.body);
      res.status(201).json(job);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  async update(req, res) {
    try {
      const [updated] = await Job.update(req.body, {
        where: { IDJob: req.params.id }
      });
      if (updated) {
        const updatedjob = await Job.findByPk(req.params.id);
        res.json(updatedjob);
      } else {
        res.status(404).json({ error: 'job not found' });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  async delete(req, res) {
    try {
      const deleted = await Job.destroy({
        where: { IDJob: req.params.id }
      });
      if (deleted) {
        res.status(200).json({ message: 'Xóa thành công' });
      } else {
        res.status(404).json({ error: 'job not found' });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  async updateStatus(req, res) {
    const jobId = req.params.id;
    const { Status } = req.body;

    try {
      await Job.update({ Status }, { where: { IDJob: jobId } });

      const job = await Job.findByPk(jobId);
      if (!job) {
        return res.status(404).json({ message: 'Job not found' });
      }

      const projectId = job.IDProject;

      const progress = await updateProjectProgress(projectId);

      res.status(200).json({ message: 'Job updated and project progress recalculated', progress });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
  }

  async markJobComplete(req, res) {
    try {
      const jobId = req.params.JobID;

      const job = await Job.findByPk(jobId);
      if (!job) {
        return res.status(404).json({ success: false, message: 'Job not found' });
      }

      job.Status = 'completed';
      await job.save();

      return res.status(200).json({ success: true, message: 'Job status updated successfully' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: 'Failed to update job status' });
    }
  }

  async createJobForGroup(req, res) {
    const { GroupID, NameJob, IDWorkFlow, IDProject, approximateTime, IDUserPerform, jobData } = req.body;
    console.log("Request body:", req.body);

    try {
      const group = await Group.findByPk(GroupID);
      const workflow = await Workflow.findByPk(IDWorkFlow);

      if (!group || !workflow) {
        return res.status(400).json({ message: 'Group hoặc WorkFlow không tồn tại.' });
      }

      let project;
      if (IDProject) {
        project = await Project.findByPk(IDProject);
        if (!project) {
          return res.status(400).json({ message: 'Project không tồn tại.' });
        }
      } else {
        project = await Project.findOne({
          where: {
            GroupID: GroupID,
            isDefault: true
          }
        });

        if (!project) {
          return res.status(400).json({ message: 'Project mặc định không tồn tại cho group này.' });
        }
      }

      // Tạo job mới với project xác định
      const newJob = await Job.create({
        ...jobData,
        NameJob: NameJob,
        approximateTime: approximateTime,
        GroupID: GroupID,
        IDWorkFLow: IDWorkFlow,
        IDProject: project.IdProject,
        IDUserPerform: IDUserPerform,
        IDCreator: req.user.IDUser,
        TimeStart: new Date()
      });
      console.log(newJob);

      //cập nhật prject progress
      await updateProjectProgress(IDProject);


      // Tìm stage đầu tiên trong workflow
      const firstStage = await Stage.findOne({
        where: { IDWorkFlow: IDWorkFlow, previousStage: null }
      });

      // Tạo bản ghi JobStage cho Stage đầu tiên
      const newJobStage = await JobStage.create({
        IDJob: newJob.IDJob,
        IDStage: firstStage ? firstStage.IdStage : null
      });

      // Gửi thông báo nếu có user thực hiện job
      const user = await AppUser.findOne({ where: { IDUser: IDUserPerform } });
      if (user) {
        const IDRecipient = user.IDUser;
        const invitationUrl = `${process.env.DOMAIN}/api/email/sendEmailNoti`;

        axios.post(invitationUrl, {
          email: user.Username,
          type: 'job',
          username: user.Username,
          jobName: NameJob,
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${req.headers['authorization'].split(' ')[1]}`,
          },
        });

        const notificationTitle = `Bạn đã nhận được một job mới: ${NameJob}`;
        const notificationMessage = `Bạn đã được nhận Job "${NameJob}" trong workflow "${workflow.Name}".`;
        await sendNotification(IDRecipient, notificationTitle, notificationMessage, req.app.locals.io);

        // Gửi số lượng công việc cho người dùng khi tạo job
        await sendJobCount(IDUserPerform, req.app.locals.io);
      } else {
        console.error(`Không tìm thấy người dùng với ID: ${IDUserPerform}`);
      }

      return res.status(201).json({
        message: 'Job được tạo và gửi vào Stage đầu tiên.',
        job: newJob,
        jobStage: newJobStage,
      });
    } catch (error) {
      console.error('Error creating job:', error);
      return res.status(500).json({ message: error.message });
    }
  }


  async getAllJobs(req, res) {
    const userId = req.user.IDUser;
    const userRoles = req.user.roles;
    const isAdmin = userRoles.includes('admin');

    try {
      let jobs;

      if (isAdmin) {
        // Admin retrieves all jobs with 'processing' status
        jobs = await JobStage.findAll({
          where: { status: 'processing' },
          include: [
            {
              model: Job,
              as: 'JobStage_Job',
              include: [
                {
                  model: AppUser,
                  as: 'Performer',
                  attributes: ['IDUser', 'Username'],
                },
              ],
            },
            {
              model: Stage,
              as: 'JobStage_Stage',
              include: [
                {
                  model: Workflow,
                  as: 'Workflow',
                  include: [
                    {
                      model: Group,
                      as: 'WorkFlowGroup',
                      attributes: ['GroupID', 'GroupName'],
                    },
                  ],
                },
              ],
            },
          ],
        });
      }
      else {
        jobs = await JobStage.findAll({
          include: [
            {
              model: Job,
              as: 'JobStage_Job',
              where: { IDUserPerform: userId },
              include: [
                {
                  model: AppUser,
                  as: 'Performer',
                  attributes: ['IDUser', 'Username'],
                },
              ],
            },
            {
              model: Stage,
              as: 'JobStage_Stage',
              include: [
                {
                  model: Workflow,
                  as: 'Workflow',
                  include: [
                    {
                      model: Group,
                      as: 'WorkFlowGroup',
                      attributes: ['GroupID', 'GroupName'],
                    },
                  ],
                },
              ],
            },
          ],
          where: { status: 'processing' }  // Lọc theo trạng thái 'processing'
        });

        if (jobs.length === 0) {
          return res.status(404).json({ message: 'Không có job nào cho người dùng này' });
        }
      }
      return res.status(200).json(jobs);

    } catch (error) {
      console.error('Lỗi khi lấy danh sách job:', error);
      return res.status(500).json({ message: error.message });
    }
  }


  async reviewStage(req, res) {
    const { jobId, stageId } = req.params;
    const { accepted, description } = req.body;
    const job = await Job.findByPk(jobId);
    try {
      if (accepted) {
        const jobStage = await JobStage.findOne({
          where: {
            IDJob: jobId,
            IDStage: stageId,
            status: 'pending'
          }
        });

        if (!jobStage) {
          return res.status(404).json({ message: 'JobStage không tìm thấy' });
        }

        // Cập nhật trạng thái thành "completed"  
        jobStage.status = 'completed';
        jobStage.signatoryId = req.user.IDUser;
        jobStage.updatedAt = sequelize.literal('CURRENT_TIMESTAMP');
        await jobStage.save();

        let nextStage = await getNextStage(stageId);
        while (nextStage) {
          // Tạo một bản ghi JobStage cho Stage tiếp theo  
          const newJobStage = await JobStage.create({
            IDJob: jobId,
            IDStage: nextStage.IdStage,
            status: 'pending',
            attachmentFile: jobStage.attachmentFile,
            attachmentLink: jobStage.attachmentLink,
            submissionDescription: jobStage.submissionDescription,
          });

          const assignedUser = await checkIfStageAssigned(newJobStage.IDStage);
          if (!assignedUser) {
            // Cập nhật JobStage trước đó từ pending thành completed  
            newJobStage.status = 'completed';
            newJobStage.updatedAt = sequelize.literal('CURRENT_TIMESTAMP');
            await newJobStage.save();
          } else {
            // Gửi thông báo và email cho người nhận stage tiếp theo  
            const job = await Job.findByPk(jobId);
            const notificationTitle = "Job đã được duyệt";
            const notificationMessage = `Job "${job.NameJob}" đã được duyệt và chuyển đến stage "${nextStage.NameStage}".`;

            await sendNotification(nextStage.IDRecipient, notificationTitle, notificationMessage, req.app.locals.io);

            //ThongBao1) Gửi thông báo số lượng công việc cho người duyệt job ở stage tiếp theo
            await sendJobStageCount(nextStage.IDRecipient, req.app.locals.io);

            // Gửi email  
            const emailRecipient = nextStage.EmailRecipient;
            if (emailRecipient) {
              const invitationUrl = `${process.env.DOMAIN}/api/email/sendEmailNoti`;
              axios.post(invitationUrl, {
                email: emailRecipient,
                type: 'job-submitted',
                username: emailRecipient,
                jobName: job.NameJob,
                stageName: nextStage.NameStage,
              }, {
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${req.headers['authorization'].split(' ')[1]}`,
                },
              }).catch(error => {
                console.error('Error sending email notification:', error);
              });
            }

            return res.status(200).json({ message: 'Job được duyệt và chuyển đến Stage tiếp theo' });
          }

          // Lấy stage tiếp theo  
          nextStage = await getNextStage(nextStage.IdStage);
        }

        // Nếu không có Stage tiếp theo, hoàn thành Job  
        const job = await Job.findByPk(jobId);
        if (job) {
          job.Status = 'completed';
          job.updatedAt = sequelize.literal('CURRENT_TIMESTAMP');
          await job.save();

          //update project progress
          await updateProjectProgress(job.IDProject);
          return res.status(200).json({ message: 'Job đã hoàn thành' });
        } else {
          return res.status(404).json({ message: 'Không tìm thấy Job' });
        }
      } else {
        // Xử lý khi job không được chấp nhận  
        const jobStage = await JobStage.findOne({
          where: {
            IDJob: jobId,
            IDStage: stageId,
            status: 'pending'
          }
        });

        if (!jobStage) {
          return res.status(404).json({ message: 'JobStage không tìm thấy' });
        }

        const previousStage = await getPreviousStage(stageId);
        if (previousStage) {
          jobStage.status = 'canceled';
          jobStage.description = description;
          jobStage.updatedAt = sequelize.literal('CURRENT_TIMESTAMP');
          await jobStage.save();

          await JobStage.create({
            IDJob: jobId,
            IDStage: previousStage.IdStage,
            status: 'processing',
            description: description,
            attachmentFile: jobStage.attachmentFile,
            attachmentLink: jobStage.attachmentLink,
          });


          // Gửi thông báo cho người nhận stage trước  
          const preStage = await Stage.findByPk(previousStage.IdStage);

          //Dieu kien kiem tra neu co nguoi nhan stage truoc thi gui thong bao kem mail cho nguoi nhan stage truoc vi co the stage truoc khong co nguoi nhan
          if (preStage.EmailRecipient) {
            const notificationTitle = "Job bị từ chối";
            const notificationMessage = `Job "${job.NameJob}" đã bị từ chối và chuyển về stage trước đó "${preStage.NameStage}" vào Job để xem chi tiết.`;
            await sendNotification(previousStage.IDRecipient, notificationTitle, notificationMessage, req.app.locals.io);

            // Gửi email cho người nhận stage trước  
            const emailRecipient = preStage.EmailRecipient;

            const jobReject = await Job.findByPk(jobStage.IDJob);
            if (emailRecipient) {

              const invitationUrl = `${process.env.DOMAIN}/api/email/sendEmailNoti`;
              axios.post(invitationUrl, {
                email: emailRecipient,
                type: 'job-rejected',
                username: emailRecipient,
                jobName: jobReject.NameJob,
                stageName: previousStage.NameStage,
              }, {
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${req.headers['authorization'].split(' ')[1]}`,
                },
              }).catch(error => {
                console.error('Error sending email notification:', error);
              });
            }
          }

          // Gửi thông báo cho người nhận job  
          const jobRecipient = await AppUser.findByPk(job.IDUserPerform);

          const jobReject = await Job.findByPk(jobStage.IDJob);
          if (jobRecipient) {

            const jobNotificationTitle = "Job bị từ chối";
            const jobNotificationMessage = `Job "${jobReject.NameJob}" của bạn đã bị từ chối.`;
            await sendNotification(jobRecipient.IDUser, jobNotificationTitle, jobNotificationMessage, req.app.locals.io);

            // ThongBao1)Gọi hàm gửi thông báo số lượng công việc sau khi từ chối job
            await sendJobCount(jobRecipient.IDUser, req.app.locals.io);

            const jobRecipientEmail = jobRecipient.Username;
            if (jobRecipientEmail) {

              const invitationUrl = `${process.env.DOMAIN}/api/email/sendEmailNoti`;
              axios.post(invitationUrl, {
                email: jobRecipientEmail,
                type: 'job-rejected',
                username: jobRecipientEmail,
                jobName: jobReject.NameJob,
              }, {
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${req.headers['authorization'].split(' ')[1]}`,
                },
              }).catch(error => {
                console.error('Error sending email notification to job recipient:', error);
              });
            }
          }

          return res.status(200).json({ message: 'Job bị từ chối và chuyển về Stage trước đó' });
        } else {
          jobStage.status = 'canceled';
          jobStage.description = description;
          jobStage.updatedAt = sequelize.literal('CURRENT_TIMESTAMP');
          await jobStage.save();

          await JobStage.create({
            IDJob: jobId,
            IDStage: stageId,
            status: 'processing',
            description: description,
            attachmentFile: jobStage.attachmentFile,
            attachmentLink: jobStage.attachmentLink,
          });

          // Gửi thông báo cho người nhận job  
          const jobRecipient = await AppUser.findByPk(job.IDUserPerform);
          const stage = await Stage.findByPk(jobStage.IDStage);
          if (jobRecipient) {
            const jobNotificationTitle = "Job bị từ chối";
            const jobNotificationMessage = `Job "${job.NameJob}" của bạn đã bị từ chối.`;


            await sendNotification(jobRecipient.IDUser, jobNotificationTitle, jobNotificationMessage, req.app.locals.io);

            // ThongBao1)Gọi hàm gửi thông báo số lượng công việc sau khi từ chối job
            await sendJobCount(jobRecipient.IDUser, req.app.locals.io);

            const invitationUrl = `${process.env.DOMAIN}/api/email/sendEmailNoti`;
            axios.post(invitationUrl, {
              email: jobRecipient.Username,
              type: 'job-rejected',
              username: jobRecipient.Username,
              stageName: stage.NameStage,
              jobName: job.NameJob,
            }, {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${req.headers['authorization'].split(' ')[1]}`,
              },
            }).catch(error => {
              console.error('Error sending email notification to job recipient:', error);
            });

          }

          return res.status(200).json({ message: 'Không có Stage trước đó. Job giữ nguyên.' });
        }
      }
    } catch (error) {
      console.error('Lỗi khi duyệt Job:', error);
      return res.status(500).json({ message: error.message });
    }
  }

  //Nộp job lên stage (Da phan quyen)
  async submitJobToStage(req, res) {
    const { jobId, stageId } = req.params;

    try {
      const jobStage = await JobStage.findOne({
        where: {
          IDJob: jobId,
          IDStage: stageId,
          status: 'processing'
        },
      });

      if (!jobStage) {
        console.error(`JobStage not found for Job ID: ${jobId}, Stage ID: ${stageId}`);
        return res.status(404).json({ message: 'JobStage không tìm thấy' });
      }

      console.log(`Current status of JobStage: ${jobStage.status}`);
      if (jobStage.status !== 'processing') {
        return res.status(400).json({ message: 'Job không thể nộp lên stage vì trạng thái không hợp lệ' });
      }

      const user = req.user; // Lấy người dùng từ request  
      console.log(`User trying to submit job: ${JSON.stringify(user)}`);
      const job = await Job.findOne({ where: { IDJob: jobId } }); // Thay đổi ở đây để lấy thông tin Job
      if (!job) {
        return res.status(404).json({ message: 'Job không tìm thấy' });
      }
      console.log(`Job details: ${JSON.stringify(job)}`);

      // Kiểm tra nếu người dùng là admin hoặc là người nhận của job
      if (user.roles.includes('admin') || user.IDUser === job.IDUserPerform) {
        jobStage.status = 'pending';

        // Lưu file nếu có  
        if (req.file) { // Kiểm tra req.file  
          const filePath = req.file.path; // Đường dẫn tới file đã upload  
          jobStage.attachmentFile = filePath; // Lưu đường dẫn vào trường attachmentFile trong JobStage  
          console.log(`File uploaded: ${filePath}`);
        } else {
          console.log('No attachment file uploaded.'); // Đoạn này sẽ thông báo nếu không có file  
        }

        // Lưu link nếu có  
        if (req.body.attachmentLink) {
          jobStage.attachmentLink = req.body.attachmentLink; // Lưu link  
          console.log(`Attachment link provided: ${req.body.attachmentLink}`);
        } else {
          console.log('No attachment link provided.');
        }

        if (req.body.submissionDescription) {
          jobStage.submissionDescription = req.body.submissionDescription;
        } else {
          console.log('No submission description provided.');
        }

        await jobStage.save(); // Lưu các thay đổi vào cơ sở dữ liệu  

        // Gửi thông báo cho người nhận stage
        const stage = await Stage.findOne({ where: { IdStage: stageId } }); // Tìm người nhận stage
        if (stage.EmailRecipient) {
          const notificationTitle = "Job đã được nộp";
          const notificationMessage = `Job "${job.NameJob}" đã được nộp lên stage "${stage.NameStage}".`;
          await sendNotification(stage.IDRecipient, notificationTitle, notificationMessage, req.app.locals.io);

          const emailRecipient = stage.EmailRecipient;
          if (emailRecipient) {
            const invitationUrl = `${process.env.DOMAIN}/api/email/sendEmailNoti`;

            // Gửi email không chờ đợi
            axios.post(invitationUrl, {
              email: emailRecipient,
              type: 'job-submitted',
              username: emailRecipient,
              jobName: job.NameJob,
              stageName: stage.NameStage,
            }, {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${req.headers['authorization'].split(' ')[1]}`,
              },
            }).catch(error => {
              console.error('Error sending email notification:', error);
            });
          }
        }

        //Ham gui so luong cong viec can duyet 
        await sendJobStageCount(stage.IDRecipient, req.app.locals.io);

        console.log(`Job submitted to stage: ${stageId}`);
        return res.status(200).json({ message: 'Job đã được nộp lên stage thành công' });
      } else {
        console.log('User does not have permission to submit job to this stage.');
        return res.status(403).json({ message: 'Bạn không có quyền nộp job lên stage này' });
      }

    } catch (error) {
      console.error('Lỗi khi nộp Job lên stage:', error);
      return res.status(500).json({ message: error.message });
    }
  }

  async getJobsForRecipient(req, res) {
    const userId = req.user.IDUser;
    const userRoles = req.user.roles;
    try {
      let jobs;
      const isAdmin = userRoles.includes('admin');

      if (isAdmin) {
        jobs = await JobStage.findAll({
          where: {
            status: 'pending'
          },
          include: [
            {
              model: Job,
              as: 'JobStage_Job',
              include: [
                {
                  model: AppUser,
                  as: 'Performer',
                  attributes: ['IDUser', 'Username'],
                }
              ]
            },
            {
              model: Stage, // Bao gồm Stage
              as: 'JobStage_Stage', // Alias cho Stage
              include: [
                {
                  model: Workflow, // Bao gồm Workflow
                  as: 'Workflow', // Alias cho Workflow
                  include: [
                    {
                      model: Group, // Bao gồm Group
                      as: 'WorkFlowGroup', // Sử dụng alias đã định nghĩa
                      attributes: ['GroupID', 'GroupName'], // Chọn các trường cần thiết
                    }
                  ]
                }
              ]
            }
          ],
        });
      } else {
        const stages = await Stage.findAll({
          where: {
            IDRecipient: userId,
          },
        });

        if (stages.length === 0) {
          return res.status(404).json({ message: 'Không tìm thấy stage nào cho người dùng này' });
        }

        const stageIds = stages.map(stage => stage.IdStage);
        jobs = await JobStage.findAll({
          where: {
            IDStage: stageIds,
            status: 'pending'
          },
          include: [
            {
              model: Job,
              as: 'JobStage_Job',
              include: [
                {
                  model: AppUser,
                  as: 'Performer',
                  attributes: ['IDUser', 'Username'],
                }
              ]
            },
            {
              model: Stage, // Bao gồm Stage
              as: 'JobStage_Stage', // Alias cho Stage
              include: [
                {
                  model: Workflow, // Bao gồm Workflow
                  as: 'Workflow', // Alias cho Workflow
                  include: [
                    {
                      model: Group, // Bao gồm Group
                      as: 'WorkFlowGroup', // Sử dụng alias đã định nghĩa
                      attributes: ['GroupID', 'GroupName'], // Chọn các trường cần thiết
                    }
                  ]
                }
              ]
            }
          ],
        });
      }

      return res.status(200).json(jobs);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách job:', error);
      return res.status(500).json({ message: error.message });
    }
  }

  //api cap nhat tien trinh jobstage
  async updateJobProgress(req, res) {
    const { IDJob, IDStage, progress } = req.body;

    try {
      const currentJobStage = await JobStage.findOne({
        where: { IDJob, IDStage, status: 'processing' }
      });

      if (currentJobStage) {
        await currentJobStage.update({
          status: 'archived'
        });

        await JobStage.create({
          IDJob: currentJobStage.IDJob,
          IDStage: currentJobStage.IDStage,
          status: 'processing',
          progress: progress,
          description: currentJobStage.description,
          signatoryId: currentJobStage.signatoryId
        });

        return res.status(200).json({ success: true, message: 'Tiến trình cập nhật thành công' });
      } else {
        return res.status(404).json({ message: 'Không tìm thấy JobStage đang xử lý' });
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật tiến trình:', error);
      return res.status(500).json({ message: 'Có lỗi xảy ra khi cập nhật tiến trình' });
    }
  };


  //History Job

  async getAllDetailJobs(req, res) {
    try {
      const { roles: userRoles, IDUser: userId } = req.user;
      let jobs = [];
  
      // Kiểm tra vai trò người dùng
      if (userRoles.includes('admin')) {
        jobs = await Job.findAll({
          include: [
            {
              model: AppUser,
              as: 'Performer',
              attributes: ['Username'],
            },
          ],
          order: [['TimeStart', 'DESC']],
        });
      } else if (userRoles.includes('user')) {
        jobs = await Job.findAll({
          where: { IDUserPerform: userId },
          include: [
            {
              model: AppUser,
              as: 'Performer',
              attributes: ['Username'],
            },
          ],
          order: [['TimeStart', 'DESC']],
        });
      }
  
      // Trả về mảng trống nếu không có dữ liệu
      return res.status(200).json({
        success: true,
        data: jobs || [],
      });
    } catch (error) {
      console.error('Error fetching jobs:', error);
      return res.status(500).json({
        success: false,
        message: 'Có lỗi xảy ra khi lấy dữ liệu công việc.',
      });
    }
  }
  

  // API để lấy các record JobStage theo IDJob
  async getJobStagesByID(req, res) {
    const { jobId } = req.params;
    try {
      const jobStages = await JobStage.findAll({
        where: { IDJob: jobId },
        include: [
          {
            model: Job,
            as: 'JobStage_Job',
            include: [
              {
                model: AppUser,
                as: 'Performer', 
                attributes: ['IDUser', 'Username'], 
              },
            ],
          },
          {
            model: Stage,
            as: 'JobStage_Stage',
            include: [
              {
                model: Workflow,
                as: 'Workflow', // Alias cho Workflow
                include: [
                  {
                    model: Group,
                    as: 'WorkFlowGroup', // Alias cho Group trong Workflow
                    attributes: ['GroupID', 'GroupName'], // Lấy thông tin của Group
                  },
                ],
              },
            ],
          },
        ],
        order: [['CreatedAt', 'ASC']], // Sắp xếp theo ngày tạo
      });

      // Kiểm tra nếu không tìm thấy JobStage nào
      if (!jobStages || jobStages.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Không có lịch sử công việc nào được tìm thấy.',
        });
      }

      // Lấy IDUser của người ký từ các JobStage (Giả sử bạn có IDUser của người ký)
      const signatoryIds = jobStages.map(jobStage => jobStage.signatoryId); // Lấy signatoryId từ mỗi JobStage

      // Lấy thông tin người ký từ bảng AppUser (nếu có)
      const signatories = await AppUser.findAll({
        where: {
          IDUser: signatoryIds
        },
        attributes: ['IDUser', 'Username'], // Lấy thông tin người ký
      });

      // Thêm thông tin người ký vào các jobStages
      jobStages.forEach(jobStage => {
        const signatory = signatories.find(signer => signer.IDUser === jobStage.signatoryId);
        if (signatory) {
          jobStage.Signatory = signatory;
        }
      });

      // Trả về kết quả
      return res.status(200).json({
        success: true,
        data: jobStages,
      });
    } catch (error) {
      console.error('Error fetching job stages:', error);
      return res.status(500).json({
        success: false,
        message: 'Có lỗi xảy ra khi lấy dữ liệu lịch sử công việc.',
      });
    }
  };

}


module.exports = new JobCOntroller();
