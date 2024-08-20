
const Stage = require('../../models/Stage_Model'); 

class stageController {
    async getALl(req, res) {
        try{
            const stage = await Stage.findAll();
            res.json(stage);
        }catch(err){
            res.status(500).json({error:err.message})
        }
    }
    async getById(req,res) {
        try {
            const stage = await Stage.findByPk(req.params.id);
            if(stage) {
                res.json(stage);
            }else {
                res.status(404).json({error : 'stage not found'})
            }
        } catch (error) {
            res.status(500).json({error:error.message})
        }
    }
    async create(req,res) {
        try {
            const stage = await Stage.create(req.body); 
            res.status(201).json(stage);
          } catch (error) {
            res.status(500).json({ error: error.message });
          }
    }
    async update(req,res) {
        try {
            const [updated] = await Stage.update(req.body, {
              where: { IDStage: req.params.id }
            });
            if (updated) {
              const updatedStage = await Stage.findByPk(req.params.id);
              res.json(updatedStage);
            } else {
              res.status(404).json({ error: 'Stage not found' });
            }
          } catch (error) {
            res.status(500).json({ error: error.message });
          }
    }
    async delete(req,res) {
        try {
            const deleted = await Stage.destroy({
              where: { IDStage: req.params.id }
            });
            if (deleted) {
              res.status(200).json({message:'Xóa thành công'});
            } else {
              res.status(404).json({ error: 'Stage not found' });
            }
          } catch (error) {
            res.status(500).json({ error: error.message });
          }
    }
}

module.exports = new stageController();
