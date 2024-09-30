
const Notify = require('../../models/Notify_Model');

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
}

module.exports = new NotifyController();
