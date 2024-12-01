
const { AppUser, Stage ,JobStage} = require('../../models/index');
const { Op } = require('sequelize');

class stageController {
  async getALl(req, res) {
    try {
      const stage = await Stage.findAll();
      res.json(stage);
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  }
  async getById(req, res) {
    try {
      const stage = await Stage.findByPk(req.params.id);
      if (stage) {
        res.json(stage);
      } else {
        res.status(404).json({ error: 'stage not found' })
      }
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  }
  async create(req, res) {
    try {
      const stage = await Stage.create(req.body);
      res.status(201).json(stage);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  async update(req, res) {
    try {
      const stageId = req.params.id;

      let recipientId = null;
      let emailRecipient = null;
      const Username = req.body.EmailRecipient;
      if (req.body.EmailRecipient) {
        const recipient = await AppUser.findOne({ where: { Username: Username } });
        if (recipient) {
          recipientId = recipient.IDUser;
          emailRecipient = req.body.EmailRecipient;
        }
      }

      const updateData = {
        NameStage: req.body.NameStage,
        DescriptionStatus: req.body.DescriptionStatus,
        IDRecipient: recipientId,
        EmailRecipient: emailRecipient
      };

      const [updated] = await Stage.update(updateData, {
        where: { IDStage: stageId }
      });

      if (updated) {
        const updatedStage = await Stage.findByPk(stageId);
        res.status(201).json({ updatedStage, success: true });
      } else {
        res.status(404).json({ error: 'Stage not found' });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }


//   async delete(req, res) {
//     const stageId = req.params.id;

//     try {

//       //quy tac : 
//       // thứ 1 : trước hết là không thể xóa stage khi có job chuẩn bị nộp lên stage này : "processcing và artchar"
//       //thứ 2 : "Không thể xóa stage khi khi có job nộp lên mà chưa duyệt "
//       //thứ 3 : không thể xóa stage khi có job ở stage tiếp theo chưa được duyệt vì ở stage này người ta có thể hoàn về 

//         // Bước 1: Lấy thông tin stage để lấy IDWorkFlow và previousStage, nextStage
//         const stage = await Stage.findOne({
//             where: { IdStage: stageId }
//         });

//         if (!stage) {
//             return res.status(404).json({ success: false, error: 'Stage không tìm thấy' });
//         }

//         const workFlowId = stage.IDWorkFlow; // Lấy IDWorkFlow từ stage
//         const previousStageId = stage.previousStage; // Lấy ID stage trước
//         const nextStageId = stage.nextStage; // Lấy ID stage sau

//         // Bước 2: Kiểm tra có job nào tồn tại với ID stage đã chỉ định và có trạng thái là processing, pending hoặc archived
//         const job = await JobStage.findOne({
//             where: { IDStage: stageId, status: { [Op.or]: ['processing', 'pending', 'archived'] } }
//         });

//         if (job) {
//             return res.status(400).json({ success: false, error: 'Không thể xóa stage với job đang hoạt động.' });
//         }

//         // Bước 3: Xóa stage
//         const deleted = await Stage.destroy({
//             where: { IdStage: stageId }
//         });

//         if (deleted) {
//             // Bước 4: Cập nhật previousStage và nextStage cho các stage liền kề
//             if (previousStageId) {
//                 // Nếu có stage trước đó, tìm stage đó để cập nhật nextStage
//                 const previousStage = await Stage.findOne({ where: { IdStage: previousStageId } });
//                 if (previousStage) {
//                     previousStage.nextStage = nextStageId || null; // Nối lại với stage tiếp theo (hoặc null nếu không có)
//                     await previousStage.save(); // Lưu thay đổi
//                 }
//             }

//             if (nextStageId) {
//                 // Nếu có stage sau đó, tìm stage đó để cập nhật previousStage
//                 const nextStage = await Stage.findOne({ where: { IdStage: nextStageId } });
//                 if (nextStage) {
//                     nextStage.previousStage = previousStageId || null; // Nối lại với stage trước đó (hoặc null nếu không có)
//                     await nextStage.save(); // Lưu thay đổi
//                 }
//             }

//             return res.status(200).json({ success: true, message: 'Xóa thành công' });
//         } else {
//             return res.status(404).json({ success: false, error: 'Stage không tìm thấy' });
//         }
//     } catch (error) {
//         return res.status(500).json({ success: false, error: error.message });
//     }
// }


 //quy tac : 
//       // thứ 1 : trước hết là không thể xóa stage khi có job chuẩn bị nộp lên stage này : "processcing và artchar"
//       //thứ 2 : "Không thể xóa stage khi khi có job nộp lên mà chưa duyệt "pending"
//       //thứ 3 : không thể xóa stage khi có job ở stage tiếp theo chưa được duyệt vì ở stage này người ta có thể hoàn về 
async delete(req, res) {
  const stageId = req.params.id;

  try {
      // Bước 1: Lấy thông tin stage để lấy IDWorkFlow và previousStage, nextStage
      const stage = await Stage.findOne({
          where: { IdStage: stageId }
      });

      if (!stage) {
          return res.status(404).json({ success: false, error: 'Stage không tìm thấy' });
      }

      const workFlowId = stage.IDWorkFlow; // Lấy IDWorkFlow từ stage
      const previousStageId = stage.previousStage; // Lấy ID stage trước
      const nextStageId = stage.nextStage; // Lấy ID stage sau

      // Bước 2: Kiểm tra có job nào tồn tại với ID stage đã chỉ định và có trạng thái là processing, pending hoặc archived
      const jobInCurrentStage = await JobStage.findOne({
          where: { IDStage: stageId, status: { [Op.or]: ['processing','pending'] } }
      });

      if (jobInCurrentStage) {
          return res.status(400).json({ success: false, error: 'Không thể xóa stage với job đang hoạt động hoặc đã lưu trữ hoặc đâng chờ được duyệt.' });
      }

      // Bước 3: Kiểm tra job ở stage tiếp theo có trạng thái là pending
      if (nextStageId) {
          const jobInNextStage = await JobStage.findOne({
              where: { IDStage: nextStageId, status: 'pending' }
          });

          if (jobInNextStage) {
              return res.status(400).json({ success: false, error: 'Không thể xóa stage khi có job đang chờ duyệt ở stage tiếp theo.' });
          }
      }

      // Bước 4: Xóa stage
      const deleted = await Stage.destroy({
          where: { IdStage: stageId }
      });

      if (deleted) {
          // Bước 5: Cập nhật previousStage và nextStage cho các stage liền kề
          if (previousStageId) {
              // Nếu có stage trước đó, tìm stage đó để cập nhật nextStage
              const previousStage = await Stage.findOne({ where: { IdStage: previousStageId } });
              if (previousStage) {
                  previousStage.nextStage = nextStageId || null; // Nối lại với stage tiếp theo (hoặc null nếu không có)
                  await previousStage.save(); // Lưu thay đổi
              }
          }

          if (nextStageId) {
              // Nếu có stage sau đó, tìm stage đó để cập nhật previousStage
              const nextStage = await Stage.findOne({ where: { IdStage: nextStageId } });
              if (nextStage) {
                  nextStage.previousStage = previousStageId || null; // Nối lại với stage trước đó (hoặc null nếu không có)
                  await nextStage.save(); // Lưu thay đổi
              }
          }

          return res.status(200).json({ success: true, message: 'Xóa thành công' });
      } else {
          return res.status(404).json({ success: false, error: 'Stage không tìm thấy' });
      }
  } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
  }
}

}


module.exports = new stageController();
