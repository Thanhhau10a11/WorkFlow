
const {Notify,UserNotify,AppUser} = require('../../models/index');
const sendNotification = require('../../../util/notifyService');

class NotifyController {
  async getALl(req, res) {
    try {
      const notifies = await Notify.findAll();
      res.json(notifies);
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  }
  async getById(req, res) {
    try {
      const notify = await Notify.findByPk(req.params.id);
      if (notify) {
        res.json(notify);
      } else {
        res.status(404).json({ error: 'notify not found' })
      }
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  }
  async create(req, res) {
    try {
      const notify = await Notify.create(req.body);
      res.status(201).json(notify);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  async update(req, res) {
    try {
      const [updated] = await Notify.update(req.body, {
        where: { IDNotify: req.params.id }
      });
      if (updated) {
        const updatednotify = await Notify.findByPk(req.params.id);
        res.json(updatednotify);
      } else {
        res.status(404).json({ error: 'notify not found' });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  async delete(req, res) {
    try {
      const deleted = await Notify.destroy({
        where: { IDNotify: req.params.id }
      });
      if (deleted) {
        res.status(200).json({ message: 'Xóa thành công' });
      } else {
        res.status(404).json({ error: 'notify not found' });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  // Trong controller
  async getNotifications(req, res) {  
    const userId = req.user.IDUser;   
    try {  
        const userWithNotifications = await AppUser.findOne({  
            where: { IDUser: userId },   
            include: [{  
                model: Notify,  
                as: 'ReceivedNotifies',   
                attributes: ['NotifyTitle', 'NotifyMessage', 'NotifyCreatedAt'],
                order: [['NotifyCreatedAt', 'DESC']]  
            }]  
        });  

        if (!userWithNotifications || !userWithNotifications.ReceivedNotifies || userWithNotifications.ReceivedNotifies.length === 0) {  
            return res.status(200).json({ message: 'No notifications found.' });  
        }  

        res.json(userWithNotifications.ReceivedNotifies);  
    } catch (error) {  
        console.error('Error fetching notifications:', error);  
        res.status(500).json({ error: 'Failed to fetch notifications.' });  
    }  
}




  async sendNotify(req, res) {
    const { IDUser, title, message } = req.body;
    try {
        
        await sendNotification(IDUser, title, message, req.app.locals.io);

        return res.status(200).json({ message: 'Notification sent!' });
        
    } catch (error) {
        console.error('Error in sendNotify:', error); 
        return res.status(500).json({ error: 'Failed to send notification.' });
    }
}
}

module.exports = new NotifyController();
