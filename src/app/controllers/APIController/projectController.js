
const Project = require('../../models/Project_Model'); 

class ProjectController {
    async getALl(req, res) {
        try{
            const projecties = await Project.findAll();
            res.json(projecties);
        }catch(err){
            res.status(500).json({error:err.message})
        }
    }
    async getById(req,res) {
        try {
            const project = await Project.findByPk(req.params.id);
            if(project) {
                res.json(project);
            }else {
                res.status(404).json({error : 'project not found'})
            }
        } catch (error) {
            res.status(500).json({error:error.message})
        }
    }
    async create(req,res) {
        try {
            const project = await Project.create(req.body); 
            res.status(201).json(project);
          } catch (error) {
            res.status(500).json({ error: error.message });
          }
    }
    async update(req,res) {
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
    async delete(req,res) {
        try {
            const deleted = await Project.destroy({
              where: { IDProject: req.params.id }
            });
            if (deleted) {
              res.status(200).json({message:'Xóa thành công'});
            } else {
              res.status(404).json({ error: 'project not found' });
            }
          } catch (error) {
            res.status(500).json({ error: error.message });
          }
    }
}

module.exports = new ProjectController();
