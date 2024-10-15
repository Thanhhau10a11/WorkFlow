
const { sequelize, AppUser, Group, Workflow, Job, Project, JobStage, Stage } = require('../../models/index')
const { getNextStage, getPreviousStage } = require('../../../util/getNextAndPreStage');

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

  // tao job cho group
  async createJobForGroup(req, res) {

    const { GroupID, NameJob, IDWorkFlow, IDProject, approximateTime, IDUserPerform, jobData } = req.body;
    console.log("Request body:", req.body);

    try {
      const group = await Group.findByPk(GroupID);

      const workflow = await Workflow.findByPk(IDWorkFlow);

      const project = await Project.findByPk(IDProject);

      // if (!group || !workflow || !project) {
      if (!group || !workflow) {
        return res.status(400).json({ message: 'Group, WorkFlow, or Project not found.' });
      }

      const newJob = await Job.create({
        ...jobData,
        NameJob: NameJob,
        approximateTime: approximateTime,
        GroupID: GroupID,
        IDWorkFlow,
        IDProject,
        IDUserPerform: IDUserPerform,
        IDCreator: req.user.id,
        TimeStart: new Date()
      });


      const firstStage = await Stage.findOne({
        where: { IDWorkFlow: IDWorkFlow },
        previousStage: null // Sắp xếp theo thứ tự của stage
      });
      // Tạo bản ghi JobStage cho Stage đầu tiên
      console.log("firstStage", firstStage)
      const newJobStage = await JobStage.create({
        IDJob: newJob.IDJob,
        IDStage: firstStage.IdStage,
      });
      console.log("newJobStage", newJobStage)
      //return res.status(201).json(newJob);
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
      } else {
        // Non-admin users retrieve jobs where they are the recipient and status is 'processing'
        const stages = await Stage.findAll({
          where: { IDRecipient: userId },
          attributes: ['IdStage'],
        });
  
        if (stages.length === 0) {
          return res.status(404).json({ message: 'Không tìm thấy stage nào cho người dùng này' });
        }
  
        const stageIds = stages.map(stage => stage.IdStage);
  
        jobs = await JobStage.findAll({
          where: {
            IDStage: stageIds,
            status: 'processing',
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
  
      return res.status(200).json(jobs);
  
    } catch (error) {
      console.error('Lỗi khi lấy danh sách job:', error);
      return res.status(500).json({ message: error.message });
    }
  }
  



  //Job và Stageeeeeee

  // Duyệt Job tại Stage

async reviewStage(req, res) {
  const { jobId, stageId } = req.params;
  const { accepted } = req.body;

  console.log(`Received request to review stage. Job ID: ${jobId}, Stage ID: ${stageId}, Accepted: ${accepted}`);

  try {
    if (accepted) {
      // Tìm jobStage hiện tại với trạng thái "pending"
      const jobStage = await JobStage.findOne({
        where: {
          IDJob: jobId,
          IDStage: stageId,
          status: 'pending'
        }
      });

      if (!jobStage) {
        console.error(`JobStage not found for Job ID: ${jobId}, Stage ID: ${stageId}`);
        return res.status(404).json({ message: 'JobStage không tìm thấy' });
      }

      // Cập nhật trạng thái thành "completed"
      jobStage.status = 'completed';
      jobStage.updatedAt = sequelize.literal('CURRENT_TIMESTAMP'); 
      await jobStage.save();

      // Tìm Stage tiếp theo
      const nextStage = await getNextStage(stageId);
      if (nextStage) {
        // Tạo một bản ghi JobStage cho Stage tiếp theo
        await JobStage.create({
          IDJob: jobId,
          IDStage: nextStage.IdStage,
          status: 'pending',
        });

        return res.status(200).json({ message: 'Job được duyệt và chuyển đến Stage tiếp theo' });
      } else {
        // Nếu không có Stage tiếp theo, hoàn thành Job
        const job = await Job.findByPk(jobId);
        if (job) {
          job.Status = 'completed';
          job.updatedAt = sequelize.literal('CURRENT_TIMESTAMP'); 
          await job.save();
          return res.status(200).json({ message: 'Job đã hoàn thành' });
        } else {
          return res.status(404).json({ message: 'Không tìm thấy Job' });
        }
      }
    } else {
      // Tìm jobStage hiện tại với trạng thái "pending"
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

      // Tìm Stage trước đó
      const previousStage = await getPreviousStage(stageId);
      if (previousStage) {
        // Cập nhật trạng thái thành "canceled" cho Stage hiện tại
        jobStage.status = 'canceled';
        jobStage.updatedAt = sequelize.literal('CURRENT_TIMESTAMP'); 
        await jobStage.save();

        // Tạo một bản ghi JobStage mới cho Stage trước đó
        await JobStage.create({
          IDJob: jobId,
          IDStage: previousStage.IdStage,
          status: 'processing',
        });

        return res.status(200).json({ message: 'Job bị từ chối và chuyển về Stage trước đó' });
      } else {
        // Nếu không có Stage trước đó, chỉ cập nhật trạng thái hiện tại
        jobStage.status = 'canceled';
        jobStage.updatedAt = sequelize.literal('CURRENT_TIMESTAMP');
        await jobStage.save();

        await JobStage.create({
          IDJob: jobId,
          IDStage: stageId, 
          status: 'processing', 
        });

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
  
    console.log(`Received request to submit job to stage. Job ID: ${jobId}, Stage ID: ${stageId}`);
  
    try {
      // Tìm JobStage hiện tại
      const jobStage = await JobStage.findOne({
        where: {
          IDJob: jobId,
          IDStage: stageId,
          status:'processing'
        },
      });
      if (!jobStage) {
        console.error(`JobStage not found for Job ID: ${jobId}, Stage ID: ${stageId}`);
        return res.status(404).json({ message: 'JobStage không tìm thấy' });
      }
  
      // Kiểm tra trạng thái hiện tại của JobStage
      if (jobStage.status !== 'processing') {
        return res.status(400).json({ message: 'Job không thể nộp lên stage vì trạng thái không hợp lệ' });
      }
  
      const user = req.user;
      const stage = await Stage.findOne({ where: { IdStage: stageId } });
  
      if (user.roles.includes('admin') || user.IDUser === stage.IDRecipient) {
        jobStage.status = 'pending';
        await jobStage.save();
  
        console.log(`Job submitted to stage: ${stageId}`);
        return res.status(200).json({ message: 'Job đã được nộp lên stage thành công' });
      } else {
        return res.status(403).json({ message: 'Bạn không có quyền nộp job lên stage này' });
      }
      
    } catch (error) {
      console.error('Lỗi khi nộp Job lên stage:', error);
      return res.status(500).json({ message: error.message });
    }
  }
  
  


//Lay job<->stage da phan quyenn
// async getJobsForRecipient(req, res) {
//   const userId = req.user.IDUser;
//   const userRoles = req.user.roles;
//   try {
//       let jobs;
//       const isAdmin = userRoles.includes('admin');
//       if (isAdmin) {
//           jobs = await JobStage.findAll({
//               where: {
//                   status: 'pending'
//               },
//               include: [
//                   {
//                       model: Job,
//                       as: 'JobStage_Job',
//                       include: [
//                           {
//                               model: AppUser, 
//                               as: 'Performer', 
//                               attributes: ['IDUser', 'Username'], 
//                           }
//                       ]
//                   },
//                   {
//                       model: Stage,
//                       as: 'JobStage_Stage',
//                   }
//               ],
//           });
//       } else {
//           const stages = await Stage.findAll({
//               where: {
//                   IDRecipient: userId,
//               },
//           });

//           if (stages.length === 0) {
//               return res.status(404).json({ message: 'Không tìm thấy stage nào cho người dùng này' });
//           }

//           const stageIds = stages.map(stage => stage.IdStage);
//           jobs = await JobStage.findAll({
//               where: {
//                   IDStage: stageIds,
//                   status: 'pending'
//               },
//               include: [
//                   {
//                       model: Job,
//                       as: 'JobStage_Job',
//                       include: [
//                           {
//                               model: AppUser, 
//                               as: 'Performer', 
//                               attributes: ['IDUser', 'Username'], 
//                           }
//                       ]
//                   },
//                   {
//                       model: Stage,
//                       as: 'JobStage_Stage',
//                   }
//               ],
//           });
//       }

//       return res.status(200).json(jobs);
//   } catch (error) {
//       console.error('Lỗi khi lấy danh sách job:', error);
//       return res.status(500).json({ message: error.message });
//   }
// }
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



  
}


module.exports = new JobCOntroller();
