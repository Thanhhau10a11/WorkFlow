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


// Cập nhật số lượng công việc
socket.on('jobCountUpdate', (data) => {
  console.log('Received job count update:', data); 

  const jobCountElement = document.getElementById('jobCount');
  if (jobCountElement) {
    jobCountElement.textContent = data.count;
  } else {
    console.error("jobCount element not found");
  }
});

// Lắng nghe sự kiện cập nhật số lượng công việc cần duyệt
socket.on('jobStageCountUpdate', (data) => {
  console.log('Received job stage count update:', data);

  const notificationReviewCount = document.getElementById('notificationReviewCount');
  if (notificationReviewCount) {
    notificationReviewCount.textContent = data.count; // Cập nhật số lượng công việc cần duyệt
    // Hiển thị biểu tượng thông báo nếu có công việc cần duyệt
    if (data.count > 0) {
      notificationReviewCount.style.display = 'inline-block';
    } else {
      notificationReviewCount.style.display = 'none';
    }
  } else {
    console.error("notificationReviewCount element not found");
  }
});