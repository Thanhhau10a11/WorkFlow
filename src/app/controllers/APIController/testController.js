const Stage = require('../../models/Stage_Model');
const JobStage = require('../../models/JobStage_Model'); // Model bảng trung gian
const Job = require('../../models/Job_Model');
const Sequelize = require('sequelize')

class testController {
  async getJobWithStage(req, res) {
    try {
      const jobs = await Job.findAll({
        include: {
          model: Stage,
          as: 'Stages',
          through: {
            model: JobStage,
            as: 'JobStage'
          }
        }
      });
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getStageWithJob(req, res) {
    try {
      const stages = await Stage.findAll({
        include: {
          model: Job,
          as: 'Jobs',
          through: {
            model: JobStage,
            as: 'JobStage'
          }
        }
      });
      res.json(stages);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  async addJobsToStage(req, res) {
    const { stageId, jobs } = req.body;

    try {
      const stage = await Stage.findByPk(stageId);
      if (!stage) {
        return res.status(404).json({ message: 'Stage not found' });
      }

      const existingJobs = await Job.findAll({
        where: {
          IDJob: jobs
        }
      });

      if (existingJobs.length !== jobs.length) {
        return res.status(400).json({ message: 'Some job IDs are invalid' });
      }

      await Promise.all(jobs.map(jobId => {
        return JobStage.create({ IDJob: jobId, IDStage: stageId });
      }));

      return res.status(201).json({
        message: 'Jobs added to stage successfully',
        stage: stage.toJSON(),
        jobs: existingJobs.map(job => job.toJSON())
      });
    } catch (error) {
      return res.status(500).json({ error: error.errors ? error.errors.map(e => e.message) : error.message });
    }
  }
  async addJobsToStage2(req, res) {
    const { stageId, jobs } = req.body;

    try {
      // Tìm stage theo ID
      const stage = await Stage.findByPk(stageId);
      if (!stage) {
        return res.status(404).json({ message: 'Stage not found' });
      }

      const jobsAdded = [];
      const jobCreationPromises = jobs.map(async (jobData) => {
        // Tạo job mới từ dữ liệu
        const newJob = await Job.create({
          Status: jobData.Status,
          IDUserAssign: jobData.IDUserAssign,
          IDCreator: jobData.IDCreator,
          TimeComplete: jobData.TimeComplete,
          TimeStart: jobData.TimeStart,
          DescriptionJob: jobData.DescriptionJob,
          NameJob: jobData.NameJob,
          IDPriorityLevel: jobData.IDPriorityLevel,
          Priority: jobData.Priority,
          IDListFollower: jobData.IDListFollower,
          IDProject: jobData.IDProject
        });

        // Thêm job vào JobStage
        await JobStage.create({ IDJob: newJob.IDJob, IDStage: stageId });

        // Lưu đối tượng job mới đã thêm vào danh sách
        jobsAdded.push(newJob.toJSON()); // Lưu thông tin job
      });

      // Chờ tất cả job được tạo
      await Promise.all(jobCreationPromises);

      // Xuất thông tin chi tiết về stage và jobs đã thêm
      return res.status(201).json({
        message: 'Jobs created and added to stage successfully',
        stage: stage.toJSON(),
        jobsAdded: jobsAdded // Trả về thông tin chi tiết về jobs
      });
    } catch (error) {
      return res.status(500).json({ error: error.errors ? error.errors.map(e => e.message) : error.message });
    }
  }


}

module.exports = new testController();
