// Kết nối với server Socket.IO
const socket = io();

// Giả sử bạn có thể lấy `userId` từ một nguồn nào đó (localStorage, session, hoặc dữ liệu có sẵn)
const userId = localStorage.getItem('IDUser'); // Ví dụ: lấy từ localStorage

// Tham gia phòng riêng ngay khi kết nối thành công
if (userId) {
  socket.emit('joinRoom', userId);
}

// Lắng nghe sự kiện từ server cho thông báo mới
socket.on('newNotification', (notification) => {
  console.log('New Notification:', notification);

  const notificationDot = document.getElementById('notification-dot');
  notificationDot.style.display = 'block';

  const notificationList = document.getElementById('notification-list');
  const noNotifications = document.getElementById('no-notifications');

  const listItem = document.createElement('li');
  listItem.className = 'notification-item';

  listItem.innerHTML = `
    <strong class="notification-title">${notification.title}</strong>
    <span class="notification-message">${notification.message}</span>
    <small class="notification-time">${new Date(notification.createdAt).toLocaleString()}</small>
  `;

  notificationList.prepend(listItem);
  noNotifications.style.display = 'none';
});
