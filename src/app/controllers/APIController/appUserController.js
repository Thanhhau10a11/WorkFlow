
const AppUser = require('../../models/User_Model'); 

class UserLoginController {
    async getALl(req, res) {
        try{
            const Users = await AppUser.findAll();
            res.json(Users);
        }catch(err){
            res.status(500).json({error:err.message})
        }
    }
    async getById(req,res) {
        try {
            const User = await AppUser.findByPk(req.params.id);
            if(User) {
                res.json(User);
            }else {
                res.status(404).json({error : 'User not found'})
            }
        } catch (error) {
            res.status(500).json({error:error.message})
        }
    }
    async create(req,res) {
        try {
            const User = await AppUser.create(req.body); 
            res.status(201).json(User);
          } catch (error) {
            res.status(500).json({ error: error.message });
          }
    }
    async update(req,res) {
        try {
            const [updated] = await AppUser.update(req.body, {
              where: { IDUser: req.params.id }
            });
            if (updated) {
              const updatedUser = await AppUser.findByPk(req.params.id);
              res.json(updatedUser);
            } else {
              res.status(404).json({ error: 'User not found' });
            }
          } catch (error) {
            res.status(500).json({ error: error.message });
          }
    }
    async delete(req,res) {
        try {
            const deleted = await AppUser.destroy({
              where: { IDUser: req.params.id }
            });
            if (deleted) {
              res.status(200).json({message:'Xóa thành công'});
            } else {
              res.status(404).json({ error: 'User not found' });
            }
          } catch (error) {
            res.status(500).json({ error: error.message });
          }
    }
}

module.exports = new UserLoginController();
