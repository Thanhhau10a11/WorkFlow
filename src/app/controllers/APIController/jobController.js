
const Job = require('../../models/Job_Model'); 

class JobCOntroller {
    async getALl(req, res) {
        try{
            const jobs = await Job.findAll();
            res.json(jobs);
        }catch(err){
            res.status(500).json({error:err.message})
        }
    }
    async getById(req,res) {
        try {
            const job = await Job.findByPk(req.params.id);
            if(job) {
                res.json(job);
            }else {
                res.status(404).json({error : 'job not found'})
            }
        } catch (error) {
            res.status(500).json({error:error.message})
        }
    }
    async create(req,res) {
        try {
            const job = await Job.create(req.body); 
            res.status(201).json(job);
          } catch (error) {
            res.status(500).json({ error: error.message });
          }
    }
    async update(req,res) {
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
    async delete(req,res) {
        try {
            const deleted = await Job.destroy({
              where: { IDJob: req.params.id }
            });
            if (deleted) {
              res.status(200).json({message:'Xóa thành công'});
            } else {
              res.status(404).json({ error: 'job not found' });
            }
          } catch (error) {
            res.status(500).json({ error: error.message });
          }
    }
}

module.exports = new JobCOntroller();
