const { Notify, UserNotify } = require('../app/models/index'); 
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
};


module.exports = sendNotification;
