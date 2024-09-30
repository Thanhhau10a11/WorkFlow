
const AppUser = require('../../models/User_Model');
const bcrypt = require('bcryptjs');


class UserLoginController {
  async getALl(req, res) {
    try {
      const Users = await AppUser.findAll();
      res.json(Users);
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  }
  async getById(req, res) {
    try {
      const User = await AppUser.findByPk(req.params.id);
      if (User) {
        res.json(User);
      } else {
        res.status(404).json({ error: 'User not found' })
      }
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  }
  async create(req, res) {
    try {
      const User = await AppUser.create(req.body);
      res.status(201).json(User);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  async update(req, res) {
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
  async delete(req, res) {
    try {
      const deleted = await AppUser.destroy({
        where: { IDUser: req.params.id }
      });
      if (deleted) {
        res.status(200).json({ message: 'Xóa thành công' });
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  async user(req, res) {
    if (req.session.user) {
      res.json(req.session.user);
    } else {
      res.status(401).json({ error: 'User not logged in' });
    }
  }

  async updateUserInfo(req, res) {
    const { email } = req.query;
    const { name, birthday, phone, newPassword } = req.body;

    try {
      let user = await AppUser.findOne({ where: { Username: email } });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (name) user.Name = name;
      if (birthday) user.Birthday = new Date(birthday);
      if (phone) user.Phone = phone;
      if (newPassword) {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.Password = hashedPassword;
      }

      await user.save();

      res.status(200).json({ message: 'User information updated successfully' });
    } catch (error) {
      console.error('Error updating user information:', error);
      res.status(500).json({ message: 'Failed to update user information' });
    }
  }
}

module.exports = new UserLoginController();
