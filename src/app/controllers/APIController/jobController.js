
const Job = require('../../models/Job_Model');
const {AppUser,Group , Workflow , Project} = require('../../models/index')

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
    console.log("Starting createJobForGroup function"); // Log bước bắt đầu

    const { GroupID,NameJob, IDWorkFLow, IDProject,approximateTime, IDUserPerform, jobData } = req.body; 
    console.log("Request body:", req.body); 

    try {
        const group = await Group.findByPk(GroupID);

        const workflow = await Workflow.findByPk(IDWorkFLow); 

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
            IDWorkFLow, 
            IDProject, 
            IDUserPerform:IDUserPerform,
            IDCreator: req.user.id,
            TimeStart: new Date()
        });


        return res.status(201).json(newJob);
    } catch (error) {
        console.error('Error creating job:', error); 
        return res.status(500).json({ message: error.message });
    }
}

// async getAllJobs(req, res) {
//   try {
//     const user = req.user;
//     let groupIDs = [];
//     let userJobs = [];

//     // Kiểm tra vai trò admin
//     if (user.roles.includes('admin')) {
//       console.log("Đã vào admin");
//       // Lấy tất cả các nhóm mà admin tạo
//       const managedGroups = await Group.findAll({
//         where: { IDUser: user.IDUser }, // Sử dụng IDCreator để tìm nhóm
//         attributes: ['GroupID']
//       });

//       // Lấy GroupID từ các nhóm mà admin quản lý
//       groupIDs = managedGroups.map(group => group.GroupID);
//     }

//     // Kiểm tra vai trò LeaderGroup
//     if (user.roles.includes('LeaderGroup')) {
//       console.log("Đã vào LeaderGroup");
//       // Lấy tất cả các nhóm mà LeaderGroup lãnh đạo
//       const managedGroups = await Group.findAll({
//         where: { IDLeader: user.IDUser }, // Sử dụng IDLeader để tìm nhóm
//         attributes: ['GroupID']
//       });

//       // Lấy GroupID từ các nhóm mà LeaderGroup quản lý
//       groupIDs = [...groupIDs, ...managedGroups.map(group => group.GroupID)];
//     }

//     // Lấy tất cả jobs mà người dùng được chỉ định
//     userJobs = await Job.findAll({
//       where: { IDUserPerform: user.IDUser } // Lấy các job mà người dùng được chỉ định
//     });

//     // Nếu không có nhóm nào và không có job nào, trả về lỗi
//     if (groupIDs.length === 0 && userJobs.length === 0) {
//       return res.status(404).json({ message: 'Không tìm thấy nhóm quản lý hoặc job được chỉ định.' });
//     }

//     // Lấy tất cả các job từ các groupIDs đã lấy được
//     const groupJobs = await Job.findAll({
//       where: { GroupID: groupIDs }
//     });

//     // Lấy thông tin nhóm cho các jobs trong group
//     const groups = await Group.findAll({
//       where: { GroupID: groupIDs },
//       attributes: ['GroupID', 'GroupName']
//     });

//     // Kết hợp jobs từ group với thông tin nhóm
//     const jobsFromGroups = groupJobs.map(job => {
//       const group = groups.find(g => g.GroupID === job.GroupID);
//       return {
//         ...job.toJSON(),
//         GroupName: group ? group.GroupName : null
//       };
//     });

//     // Kết hợp jobs từ user và jobs từ group
//     const allJobs = [...jobsFromGroups, ...userJobs.map(job => ({
//       ...job.toJSON(),
//       GroupName: null // Giả sử jobs của user không có GroupName
//     }))];

//     return res.json(allJobs);

//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ message: 'Lỗi server', error: error.message });
//   }
// }

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
      where: { IDUserPerform: user.IDUser }
    });

    // Nếu không có nhóm nào và không có job nào, trả về lỗi
    if (groupIDs.length === 0 && userJobs.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy nhóm quản lý hoặc job được chỉ định.' });
    }

    // Lấy tất cả các job từ các groupIDs đã lấy được
    const groupJobs = await Job.findAll({
      where: { GroupID: groupIDs }
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

    return res.json(allJobs);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
}


}


module.exports = new JobCOntroller();
