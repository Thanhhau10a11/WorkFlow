// const { Notify, UserNotify } = require('../app/models/index'); 
// async function sendNotification(userId, title, message, io) {
//   try {
//       if (!io) {
//           console.error('Socket.IO instance is undefined');
//           throw new Error('Socket.IO instance is undefined');
//       }
      
//       const notify = await Notify.create({
//           NotifyTitle: title,
//           NotifyMessage: message,
//           NotifyCreatedAt: new Date(),
//       });


//       const userNotify = await UserNotify.create({
//           IDUser: userId,
//           IDNotify: notify.IDNotify,
//       });


//       io.to(`user_${userId}`).emit('newNotification', {
//           title: notify.NotifyTitle,
//           message: notify.NotifyMessage,
//           createdAt: notify.NotifyCreatedAt,
//       });

//       console.log('Notification sent successfully!');
//   } catch (error) {
//       console.error('Error sending notification:', error); 
//       throw error; 
//   }
// };


// module.exports = sendNotification;
const { Notify, UserNotify, Job ,JobStage ,Stage} = require('../app/models/index'); 

/**
 * Hàm gửi thông báo cụ thể
 */
async function sendNotification(userId, title, message, io) {
    try {
        if (!io) {
            console.error('Socket.IO instance is undefined');
            throw new Error('Socket.IO instance is undefined');
        }

        const notify = await Notify.create({
            NotifyTitle: title,
            NotifyMessage: message,
            NotifyCreatedAt: new Date(),
        });

        const userNotify = await UserNotify.create({
            IDUser: userId,
            IDNotify: notify.IDNotify,
        });

        io.to(`user_${userId}`).emit('newNotification', {
            title: notify.NotifyTitle,
            message: notify.NotifyMessage,
            createdAt: notify.NotifyCreatedAt,
        });

        console.log('Notification sent successfully!');
    } catch (error) {
        console.error('Error sending notification:', error);
        throw error;
    }
}

//  Hàm gửi số lượng công việc được gán

async function sendJobCount(userId, io) {

    try {
        if (!io) {
            console.error('Socket.IO instance is undefined');
            throw new Error('Socket.IO instance is undefined');
        }

        // Bước 1: Lấy các công việc mà người dùng được giao (IDUserPerform = userId)
        const jobsAssignedToUser = await Job.findAll({
            where: {
                IDUserPerform: userId, // Lọc theo IDUserPerform
            },
            attributes: ['IDJob'] // Chỉ lấy IDJob của các công việc
        });

        // Bước 2: Kiểm tra nếu không có công việc nào, trả về 0
        if (jobsAssignedToUser.length === 0) {
            io.to(`user_${userId}`).emit('jobCountUpdate', { count: 0 });
            return console.log(`No jobs assigned to user_${userId}`);
        }

        // Bước 3: Lấy IDJob từ các công việc đã tìm thấy
        const jobIds = jobsAssignedToUser.map(job => job.IDJob);

        // Bước 4: Đếm số lượng JobStage có trạng thái "processing" cho các công việc này
        const jobCount = await JobStage.count({
            where: {
                IDJob: jobIds,
                status: 'processing', // Trạng thái "processing"
            }
        });

        // Bước 5: Gửi số lượng công việc qua Socket.IO
        io.to(`user_${userId}`).emit('jobCountUpdate', {
            count: jobCount,
        });

        console.log(`Job count (processing) sent to user_${userId}: ${jobCount}`);
    } catch (error) {
        console.error('Error sending job count:', error);
        throw error;
    }
}

async function sendJobStageCount(userId, io) {
    try {
        if (!io) {
            console.error('Socket.IO instance is undefined');
            throw new Error('Socket.IO instance is undefined');
        }

        // Bước 1: Lấy các stage mà người dùng được nhận (IDRecipient = userId)
        const stages = await Stage.findAll({
            where: {
                IDRecipient: userId,
            },
            attributes: ['IdStage'], // Chỉ lấy IdStage của các stage mà người nhận
        });

        if (stages.length === 0) {
            io.to(`user_${userId}`).emit('jobStageCountUpdate', { count: 0 });
            return console.log(`No stages assigned to user_${userId}`);
        }

        // Bước 2: Lấy IdStage từ các stage đã tìm thấy
        const stageIds = stages.map(stage => stage.IdStage);

        // Bước 3: Đếm số lượng JobStage có trạng thái "pending" cho các stage này
        const jobStageCount = await JobStage.count({
            where: {
                IDStage: stageIds,
                status: 'pending', // Trạng thái "pending" cần duyệt
            }
        });

        // Bước 4: Gửi số lượng công việc cần duyệt qua Socket.IO
        io.to(`user_${userId}`).emit('jobStageCountUpdate', {
            count: jobStageCount,
        });

        console.log(`JobStage count (pending) sent to user_${userId}: ${jobStageCount}`);
    } catch (error) {
        console.error('Error sending job stage count:', error);
        throw error;
    }
}
module.exports = {
    sendNotification,
    sendJobCount, 
    sendJobStageCount,
};
