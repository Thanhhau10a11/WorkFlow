
const Project = require('../../models/Project_Model');
const Group = require('../../models//Group_Model');
const Job = require('../../models/Job_Model')

class ProjectController {
  async getALl(req, res) {
    try {
      const projecties = await Project.findAll();
      res.json(projecties);
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  }
  async getById(req, res) {
    try {
      const project = await Project.findByPk(req.params.id);
      if (project) {
        res.json(project);
      } else {
        res.status(404).json({ error: 'project not found' })
      }
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  }
  async create(req, res) {
    try {
      const project = await Project.create(req.body);
      res.status(201).json(project);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  async update(req, res) {
    try {
      const [updated] = await Project.update(req.body, {
        where: { IDProject: req.params.id }
      });
      if (updated) {
        const updatedProject = await Project.findByPk(req.params.id);
        res.json(updatedProject);
      } else {
        res.status(404).json({ error: 'project not found' });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  async delete(req, res) {
    try {
        const project = await Project.findOne({
            where: { IDProject: req.params.id }
        });
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }
        if (project.isDefault) { 
            return res.status(403).json({ error: 'Không thể xóa project mặc định' });
        }
        await Project.destroy({
            where: { IDProject: req.params.id }
        });
        res.status(200).json({ message: 'Xóa thành công' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
  async createByIDGroup(req, res) {
    try {
      const { GroupID, IDCreator } = req.params;
      const { NameProject, Progress, InfoProject } = req.body;
      if (!NameProject || !GroupID || !IDCreator) {
        return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
      }

      const group = await Group.findByPk(GroupID);
      if (!group) {
        return res.status(404).json({ error: 'Group không tồn tại' });
      }

      const newProject = await Project.create({
        NameProject,
        Progress,
        IDCreator,
        InfoProject,
        GroupID
      });

      res.status(201).json(newProject);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Lỗi khi tạo project' });
    }
  }

  async addJobsToProject(req, res) {
    try {
      const { IDProject, jobs } = req.body;
      const project = await Project.findByPk(IDProject);
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      const createdJobs = await Promise.all(
        jobs.map(async (jobData) => {
          return await Job.create({
            ...jobData,
            IDProject: IDProject,
          });
        })
      );

      res.status(201).json({ message: 'Jobs created successfully', jobs: createdJobs });
    } catch (error) {
      console.error('Error adding jobs to project:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
  async getProjectInGroup(req, res) {
    const GroupID = req.params.GroupID;
    try {
      const group = await Group.findOne({
        where: { GroupID: GroupID },
        include: [{
          model: Project,
          as: 'Projects',
        }],
        order: [
          [{ model: Project, as: 'Projects' }, 'isDefault', 'DESC'],  
          [{ model: Project, as: 'Projects' }, 'createdAt', 'DESC']   
      ]
      });

      if (!group) {
        return res.status(404).json('Group not found');
      }

      const projects = group.Projects;
      res.json(projects);

    } catch (error) {
      res.status(500).json({ message: 'Error fetching projects', error: error.message });
    }
  }
  async getJobsInGroup(req, res) {
    try {
      const ProjectID = req.params.ProjectID;
      console.log(ProjectID)
      const project = await Project.findOne({
        where: { IdProject: ProjectID },
        include: [{
          model: Job,
          as: 'JobsInProject',
        }]
      })
      if (!project) {
        return res.status(404).json('Project not found');
      }
      res.status(200).json(project)
    } catch (error) {
      res.status(500).json({ message: 'Error fetching projects', error: error.message });
    }
  }

  async updateProjectProgress(req, res) {  
    try {  
        const projectId = req.params.ProjectID;   
        const jobs = await Job.findAll({ where: { IDProject: projectId } });   

        if (jobs.length === 0) {  
            return res.status(404).json({ success: false, message: 'No jobs found for this project.' });  
        }  

        const completedJobs = jobs.filter(job => job.Status === 'completed').length;   

        const progress = (completedJobs / jobs.length) * 100;  

        const roundedProgress = Math.round(progress);  

        await Project.update({ Progress: `${roundedProgress}%` }, { where: { IdProject: projectId } });   

        return res.status(200).json({ success: true, progress: roundedProgress });   
    } catch (error) {  
        console.error(error);  
        return res.status(500).json({ success: false, message: 'An error occurred while updating progress.' });  
    }  
}

}

module.exports = new ProjectController();
