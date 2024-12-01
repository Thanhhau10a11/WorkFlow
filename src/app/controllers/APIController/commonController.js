
const {AppUser,JobStage,Job,Project,Stage,Workflow,Group} = require('../../models/index');


class CommonController {
    async getJobStatistics(req, res) {
        const userId = req.user.IDUser; // Lấy ID người dùng từ middleware
        const userRoles = req.user.roles; // Lấy danh sách roles của người dùng
        const isAdmin = userRoles.includes('admin'); // Kiểm tra người dùng có phải admin không
        console.log(userId,userRoles,isAdmin);
        try {
          // **Đếm số công việc dựa trên trạng thái**
          const [completedCount, inProgressCount, pendingCount] = await Promise.all([
            JobStage.count({ where: { status: 'completed' } }),
            JobStage.count({ where: { status: 'processing' } }),
            JobStage.count({ where: { status: 'pending' } }),
          ]);
      
          // **Danh sách công việc gần đây**
          let recentJobsQuery = {
            where: {
              status: 'pending', // Lọc theo trạng thái chờ duyệt
            },
            include: [
              {
                model: Job,
                as: 'JobStage_Job',
                attributes: ['IDJob', 'NameJob', 'TimeStart', 'TimeComplete'],
                include: [
                  {
                    model: Project,
                    as: 'JobsInProject',
                    attributes: ['IdProject', 'NameProject'], // Lấy thông tin project
                  },
                  {
                    model: AppUser,
                    as: 'Performer',
                    attributes: ['IDUser', 'Username'], // Người thực hiện công việc
                  },
                ],
              },
              {
                model: Stage,
                as: 'JobStage_Stage',
                attributes: ['IdStage', 'NameStage'], // Lấy thông tin stage
                include: [
                  {
                    model: Workflow,
                    as: 'Workflow',
                    attributes: ['IDWorkFlow', 'Name'], // Lấy thông tin workflow
                    include: [
                      {
                        model: Group,
                        as: 'WorkFlowGroup',
                        attributes: ['GroupID', 'GroupName'], // Lấy thông tin group
                      },
                    ],
                  },
                ],
              },
            ],
            order: [['createdAt', 'DESC']], // Sắp xếp theo thời gian mới nhất
            limit: 10, // Giới hạn 10 công việc gần nhất
          };
      
          if (!isAdmin) {
            // Nếu không phải admin, chỉ lấy công việc liên quan đến người dùng
            const stages = await Stage.findAll({
              where: { IDRecipient: userId },
              attributes: ['IdStage'],
            });
            const stageIds = stages.map(stage => stage.IdStage);
            recentJobsQuery.where.IDStage = stageIds; // Lọc theo danh sách IDStage
          }
      
          const recentJobs = await JobStage.findAll(recentJobsQuery);
      
          // **Trả về kết quả**
          return res.status(200).json({
            stats: {
              completed: completedCount,
              inProgress: inProgressCount,
              pending: pendingCount,
            },
            recentJobs,
          });
        } catch (error) {
          console.error('Lỗi khi lấy dữ liệu công việc:', error);
          return res.status(500).json({ message: error.message });
        }
      }
}

module.exports = new CommonController();
