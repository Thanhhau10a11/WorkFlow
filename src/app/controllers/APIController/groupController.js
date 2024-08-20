
const Group = require('../../models/Group_Model'); 

class GroupController {
    async getALl(req, res) {
        try{
            const groups = await Group.findAll();
            res.json(groups);
        }catch(err){
            res.status(500).json({error:err.message})
        }
    }
    async getById(req,res) {
        try {
            const group = await Group.findByPk(req.params.id);
            if(Group) {
                res.json(group);
            }else {
                res.status(404).json({error : 'group not found'})
            }
        } catch (error) {
            res.status(500).json({error:error.message})
        }
    }
    async create(req,res) {
        try {
            const group = await Group.create(req.body); 
            res.status(201).json(group);
          } catch (error) {
            res.status(500).json({ error: error.message });
          }
    }
    async update(req,res) {
        try {
            const [updated] = await Group.update(req.body, {
              where: { GroupID: req.params.id }
            });
            if (updated) {
              const updatedGroup = await Group.findByPk(req.params.id);
              res.json(updatedGroup);
            } else {
              res.status(404).json({ error: 'group not found' });
            }
          } catch (error) {
            res.status(500).json({ error: error.message });
          }
    }
    async delete(req,res) {
        try {
            const deleted = await Group.destroy({
              where: { GroupID: req.params.id }
            });
            if (deleted) {
              res.status(200).json({message:'Xóa thành công'});
            } else {
              res.status(404).json({ error: 'group not found' });
            }
          } catch (error) {
            res.status(500).json({ error: error.message });
          }
    }
}

module.exports = new GroupController();
