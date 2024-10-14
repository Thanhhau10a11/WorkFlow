
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
        jobStage: newJobStage
      });
    } catch (error) {
      console.error('Error creating job:', error);
      return res.status(500).json({ message: error.message });
    }
  }

  async getAllJobs(req, res) {
    try {
      const user = req.user;
      let groupIDs = [];
      let userJobs = [];

      // Kiểm tra vai trò admin
      if (user.roles.includes('admin')) {
        console.log("Đã vào admin");
        const managedGroups = await Group.findAll({
          where: { IDUser: user.IDUser },
          attributes: ['GroupID']
        });
        groupIDs = managedGroups.map(group => group.GroupID);
      }

      // Kiểm tra vai trò LeaderGroup
      if (user.roles.includes('LeaderGroup')) {
        console.log("Đã vào LeaderGroup");
        const managedGroups = await Group.findAll({
          where: { IDLeader: user.IDUser },
          attributes: ['GroupID']
        });
        groupIDs = [...groupIDs, ...managedGroups.map(group => group.GroupID)];
      }

      // Lấy tất cả jobs mà người dùng được chỉ định
      userJobs = await Job.findAll({
        where: { IDUserPerform: user.IDUser },
        order: [['timeStart', 'DESC']] // Sắp xếp theo timeStart giảm dần (mới nhất ở đầu)
      });

      // Nếu không có nhóm nào và không có job nào, trả về lỗi
      if (groupIDs.length === 0 && userJobs.length === 0) {
        return res.status(404).json({ message: 'Không tìm thấy nhóm quản lý hoặc job được chỉ định.' });
      }

      // Lấy tất cả các job từ các groupIDs đã lấy được
      const groupJobs = await Job.findAll({
        where: { GroupID: groupIDs },
        order: [['timeStart', 'DESC']] // Sắp xếp theo timeStart giảm dần (mới nhất ở đầu)
      });

      // Lấy thông tin nhóm cho các jobs trong group
      const groups = await Group.findAll({
        where: { GroupID: groupIDs },
        attributes: ['GroupID', 'GroupName']
      });

      // Lấy thông tin người dùng (user) cho từng job
      const userIDs = [...new Set([...userJobs.map(job => job.IDUserPerform), ...groupJobs.map(job => job.IDUserPerform)])]; // Lấy tất cả IDUserPerform duy nhất
      const users = await AppUser.findAll({
        where: { IDUser: userIDs }
      });

      const usersMap = {};
      users.forEach(user => {
        usersMap[user.IDUser] = user; // Tạo map cho dễ dàng truy cập
      });

      // Kết hợp jobs từ group với thông tin nhóm
      const jobsFromGroups = groupJobs.map(job => {
        const group = groups.find(g => g.GroupID === job.GroupID);
        const user = usersMap[job.IDUserPerform] || {}; // Lấy thông tin người nhận
        return {
          ...job.toJSON(),
          GroupName: group ? group.GroupName : null,
          Username: user.Username || 'Không có tên người nhận',
        };
      });

      // Kết hợp jobs từ user
      const allJobs = [
        ...jobsFromGroups,
        ...userJobs.map(job => {
          const user = usersMap[job.IDUserPerform] || {}; // Lấy thông tin người nhận
          return {
            ...job.toJSON(),
            GroupName: null, // Giả sử jobs của user không có GroupName
            Username: user.Username || 'Không có tên người nhận',
          };
        })
      ];

      // Sắp xếp các job cuối cùng theo timeStart mới nhất
      allJobs.sort((a, b) => new Date(b.timeStart) - new Date(a.timeStart));

      return res.json(allJobs);

    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
  }



  //Job và Stageeeeeee

  // Duyệt Job tại Stage
  // async reviewStage(req, res) {
  //   const { jobId, stageId } = req.params;
  //   const { accepted } = req.body;

  //   console.log(`Received request to review stage. Job ID: ${jobId}, Stage ID: ${stageId}, Accepted: ${accepted}`);

  //   const transaction = await sequelize.transaction();

  //   try {
  //     const jobStage = await JobStage.findOne({
  //       where: {
  //         IDJob: jobId,
  //         IDStage: stageId,
  //       },
  //       transaction,
  //     });

  //     if (!jobStage) {
  //       await transaction.rollback();
  //       console.error(`JobStage not found for Job ID: ${jobId}, Stage ID: ${stageId}`);
  //       return res.status(404).json({ message: 'JobStage không tìm thấy' });
  //     }

  //     console.log(`JobStage found: ${JSON.stringify(jobStage)}`);

  //     if (accepted) {
  //       jobStage.status = 'completed';
  //       await jobStage.save({ transaction });
  //       console.log("AAAAAAAAAAAAAAA",jobStage)
  //       console.log(`JobStage status updated to 'completed': ${JSON.stringify(jobStage)}`);

  //       // Tìm Stage tiếp theo
  //       const nextStage = await getNextStage(stageId);
  //       console.log(`Next Stage: ${JSON.stringify(nextStage)}`);

  //       if (nextStage) {
  //         // Tạo bản ghi JobStage cho Stage tiếp theo
  //         await JobStage.create({
  //           IDJob: jobId,
  //           IDStage: nextStage.IdStage,
  //           status: 'pending',
  //         }, { transaction });
  //         await transaction.commit();
  //         console.log(`Job approved and moved to next stage: ${nextStage.IdStage}`);
  //         return res.status(200).json({ message: 'Job được duyệt và chuyển đến Stage tiếp theo' });
  //       } else {
  //         const job = await Job.findByPk(jobId, { transaction });
  //         console.log(`Job found: ${JSON.stringify(job)}`);

  //         if (job) {
  //           job.status = 'completed';
  //           await job.save({ transaction });
  //           await jobStage.save({ transaction });
  //           await transaction.commit();

  //           console.log(`Job completed: ${jobId}`);
  //           return res.status(200).json({ message: 'Job đã hoàn thành' });
  //         } else {
  //           await transaction.rollback();
  //           console.error(`Job not found for Job ID: ${jobId}`);
  //           return res.status(404).json({ message: 'Không tìm thấy Job' });
  //         }
  //       }
  //     } else {
  //       // Nếu không chấp nhận, chuyển Job về Stage trước đó
  //       const previousStage = await getPreviousStage(stageId);
  //       console.log(`Previous Stage: ${JSON.stringify(previousStage)}`);

  //       if (previousStage) {
  //         // Cập nhật trạng thái của JobStage hiện tại thành 'cancel'
  //         await JobStage.update(
  //           { status: 'canceled' }, // cập nhật trạng thái thành 'cancel'
  //           { where: { IDJob: jobId, IDStage: stageId }, transaction }
  //         );

  //         // Tạo bản ghi JobStage cho Stage trước đó
  //         await JobStage.create({
  //           IDJob: jobId,
  //           IDStage: previousStage.IdStage,
  //           status: 'pending', // trạng thái mới của job trong stage trước đó
  //         }, { transaction });

  //         await transaction.commit();
  //         console.log(`Job rejected and moved back to previous stage: ${previousStage.IdStage}`);
  //         return res.status(200).json({ message: 'Job bị từ chối và chuyển về Stage trước đó' });
  //       } else {
  //         await transaction.rollback();
  //         console.error(`Cannot move back to previous stage for Stage ID: ${stageId}`);
  //         return res.status(400).json({ message: 'Không thể chuyển về Stage trước đó' });
  //       }
  //     }

  //   } catch (error) {
  //     await transaction.rollback();
  //     console.error('Lỗi khi duyệt Job:', error);
  //     return res.status(500).json({ message: error.message });
  //   }
  // }
  async reviewStage(req, res) {
    const { jobId, stageId } = req.params;
    const { accepted } = req.body;

    console.log(`Received request to review stage. Job ID: ${jobId}, Stage ID: ${stageId}, Accepted: ${accepted}`);

    try {
        const jobStage = await JobStage.findOne({
            where: {
                IDJob: jobId,
                IDStage: stageId,
                status:'pending'
            }
        });

        if (!jobStage) {
            console.error(`JobStage not found for Job ID: ${jobId}, Stage ID: ${stageId}`);
            return res.status(404).json({ message: 'JobStage không tìm thấy' });
        }

        console.log(`JobStage found: ${JSON.stringify(jobStage)}`);

        if (accepted) {
            // Thay đổi trạng thái và cập nhật thời gian
            jobStage.status = 'completed';
            jobStage.updatedAt = sequelize.literal('CURRENT_TIMESTAMP'); // Cập nhật thời gian

            await jobStage.save();

            console.log("Status after save:", jobStage.status);
            console.log("Changed fields:", jobStage._changed);

            // Tìm Stage tiếp theo
            const nextStage = await getNextStage(stageId);
            console.log(`Next Stage: ${JSON.stringify(nextStage)}`);

            if (nextStage) {
                await JobStage.create({
                    IDJob: jobId,
                    IDStage: nextStage.IdStage,
                    status: 'pending',
                });

                console.log(`Job approved and moved to next stage: ${nextStage.IdStage}`);
                return res.status(200).json({ message: 'Job được duyệt và chuyển đến Stage tiếp theo' });
            } else {
                const job = await Job.findByPk(jobId);
                console.log(`Job found: ${JSON.stringify(job)}`);

                if (job) {
                    job.status = 'completed';
                    job.updatedAt = sequelize.literal('CURRENT_TIMESTAMP'); // Cập nhật thời gian
                    await job.save();
                    console.log(`Job completed: ${jobId}`);
                    return res.status(200).json({ message: 'Job đã hoàn thành' });
                } else {
                    console.error(`Job not found for Job ID: ${jobId}`);
                    return res.status(404).json({ message: 'Không tìm thấy Job' });
                }
            }
        } else {
            const previousStage = await getPreviousStage(stageId);
            console.log(`Previous Stage: ${JSON.stringify(previousStage)}`);

            if (previousStage) {
                await JobStage.update(
                    { status: 'canceled' },
                    { where: { IDJob: jobId, IDStage: stageId } }
                );

                await JobStage.create({
                    IDJob: jobId,
                    IDStage: previousStage.IdStage,
                    status: 'pending',
                });

                console.log(`Job rejected and moved back to previous stage: ${previousStage.IdStage}`);
                return res.status(200).json({ message: 'Job bị từ chối và chuyển về Stage trước đó' });
            } else {
                console.error(`Cannot move back to previous stage for Stage ID: ${stageId}`);
                return res.status(400).json({ message: 'Không thể chuyển về Stage trước đó' });
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
        },
      });
  
      if (!jobStage) {
        console.error(`JobStage not found for Job ID: ${jobId}, Stage ID: ${stageId}`);
        return res.status(404).json({ message: 'JobStage không tìm thấy' });
      }
  
      // Kiểm tra trạng thái hiện tại của JobStage
      if (jobStage.status !== 'pending') {
        return res.status(400).json({ message: 'Job không thể nộp lên stage vì trạng thái không hợp lệ' });
      }
  
      // Kiểm tra nếu người dùng hiện tại là admin hoặc là người nhận stage
      const user = req.user;
      const stage = await Stage.findOne({ where: { IdStage: stageId } });
  
      if (user.roles.includes('admin') || user.IDUser === stage.IDRecipient) {
        // Đánh dấu JobStage là 'submitted'
        jobStage.status = 'submitted';
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
