
const {sequelize,AppUser,Group , Workflow , Job,Project ,JobStage,Stage} = require('../../models/index')
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

  async  markJobComplete(req, res) {
    try {
      const jobId = req.params.JobID;
      const { status } = req.body; 
  
      const job = await Job.findByPk(jobId);
      if (!job) {
        return res.status(404).json({ success: false, message: 'Job not found' });
      }
  
      job.Status = status; 
      await job.save();
  
      return res.status(200).json({ success: true, message: 'Job status updated successfully' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: 'Failed to update job status' });
    }
  }

  // tao job cho group
  async createJobForGroup(req, res) {

    const { GroupID,NameJob, IDWorkFlow, IDProject,approximateTime, IDUserPerform, jobData } = req.body; 
    console.log("Request body:", req.body); 

    try {
        const group = await Group.findByPk(GroupID);

        const workflow = await Workflow.findByPk(IDWorkFlow); 

        const project = await Project.findByPk(IDProject); 

        // if (!group || !workflow || !project) {
          if (!group || !workflow ) {
            return res.status(400).json({ message: 'Group, WorkFlow, or Project not found.' });
        }

        const newJob = await Job.create({
            ...jobData, 
            NameJob:NameJob,
            approximateTime:approximateTime,
            GroupID: GroupID, 
            IDWorkFlow, 
            IDProject, 
            IDUserPerform:IDUserPerform,
            IDCreator: req.user.id,
            TimeStart: new Date()
        });


        const firstStage = await Stage.findOne({
          where: { IDWorkFlow: IDWorkFlow },
          previousStage: null // Sắp xếp theo thứ tự của stage
      });
        // Tạo bản ghi JobStage cho Stage đầu tiên
        console.log("firstStage",firstStage)
        const newJobStage = await JobStage.create({
          IDJob: newJob.IDJob,
          IDStage: firstStage.IdStage,
      });
      console.log("newJobStage",newJobStage)
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
async reviewStage(req, res) {
  const { jobId, stageId } = req.params;
  const { accepted } = req.body;

  console.log(`Received request to review stage. Job ID: ${jobId}, Stage ID: ${stageId}, Accepted: ${accepted}`);

  const transaction = await sequelize.transaction();

  try {
    const jobStage = await JobStage.findOne({
      where: {
        IDJob: jobId,
        IDStage: stageId,
      },
      transaction,
    });

    if (!jobStage) {
      await transaction.rollback();
      console.error(`JobStage not found for Job ID: ${jobId}, Stage ID: ${stageId}`);
      return res.status(404).json({ message: 'JobStage không tìm thấy' });
    }

    console.log(`JobStage found: ${JSON.stringify(jobStage)}`);

    if (accepted) {
      jobStage.status = 'completed';
      await jobStage.save({ transaction });
      console.log(`JobStage status updated to 'completed': ${JSON.stringify(jobStage)}`);

      // Tìm Stage tiếp theo
      const nextStage = await getNextStage(stageId);
      console.log(`Next Stage: ${JSON.stringify(nextStage)}`);

      if (nextStage) {
        // Tạo bản ghi JobStage cho Stage tiếp theo
        await JobStage.create({
          IDJob: jobId,
          IDStage: nextStage.IdStage,
          status: 'pending',
        }, { transaction });
        await transaction.commit();
        console.log(`Job approved and moved to next stage: ${nextStage.IdStage}`);
        return res.status(200).json({ message: 'Job được duyệt và chuyển đến Stage tiếp theo' });
      } else {
        const job = await Job.findByPk(jobId, { transaction });
        console.log(`Job found: ${JSON.stringify(job)}`);
        
        if (job) {
          job.status = 'completed';
          await job.save({ transaction });
          await jobStage.save({ transaction });
          await transaction.commit();

          console.log(`Job completed: ${jobId}`);
          return res.status(200).json({ message: 'Job đã hoàn thành' });
        } else {
          await transaction.rollback();
          console.error(`Job not found for Job ID: ${jobId}`);
          return res.status(404).json({ message: 'Không tìm thấy Job' });
        }
      }
    } else {
      // Nếu không chấp nhận, chuyển Job về Stage trước đó
      const previousStage = await getPreviousStage(stageId);
      console.log(`Previous Stage: ${JSON.stringify(previousStage)}`);
    
      if (previousStage) {
        // Cập nhật trạng thái của JobStage hiện tại thành 'cancel'
        await JobStage.update(
          { status: 'canceled' }, // cập nhật trạng thái thành 'cancel'
          { where: { IDJob: jobId, IDStage: stageId }, transaction }
        );
    
        // Tạo bản ghi JobStage cho Stage trước đó
        await JobStage.create({
          IDJob: jobId,
          IDStage: previousStage.IdStage,
          status: 'pending', // trạng thái mới của job trong stage trước đó
        }, { transaction });
    
        await transaction.commit();
        console.log(`Job rejected and moved back to previous stage: ${previousStage.IdStage}`);
        return res.status(200).json({ message: 'Job bị từ chối và chuyển về Stage trước đó' });
      } else {
        await transaction.rollback();
        console.error(`Cannot move back to previous stage for Stage ID: ${stageId}`);
        return res.status(400).json({ message: 'Không thể chuyển về Stage trước đó' });
      }
    }
    
  } catch (error) {
    await transaction.rollback();
    console.error('Lỗi khi duyệt Job:', error);
    return res.status(500).json({ message: error.message });
  }
}


}


module.exports = new JobCOntroller();
