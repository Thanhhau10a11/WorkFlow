document.addEventListener('DOMContentLoaded', () => {
    const notificationButton = document.getElementById('notification-button');
    const notificationPanel = document.getElementById('notification-panel');
    const noNotifications = document.getElementById('no-notifications');

    if (notificationButton) {
        notificationButton.addEventListener('click', () => {
            // Ẩn chấm đỏ khi người dùng mở bảng thông báo
            const notificationDot = document.getElementById('notification-dot');
            if (notificationDot) {
                notificationDot.style.display = 'none';
            }

            if (notificationPanel.style.display === 'none') {
                notificationPanel.style.display = 'block';
                fetchNotifications(); // Gọi hàm để lấy thông báo
            } else {
                notificationPanel.style.display = 'none';
            }
        });
    }

    const fetchNotifications = async () => {  
        try {  
            const token = localStorage.getItem('authToken'); 
    
            const response = await fetch('/api/notify', {  
                method: 'GET', 
                headers: {  
                    'Content-Type': 'application/json',  
                    'Authorization': `Bearer ${token}`  
                }  
            });  
            
            if (!response.ok) {  
                throw new Error('Network response was not ok ' + response.statusText);  
            }  
    
            const notifications = await response.json();  
            displayNotifications(notifications); // Gọi hàm để hiển thị thông báo
        } catch (error) {  
            console.error('Lỗi khi lấy thông báo:', error);  
            displayNotifications([]); // Gọi hàm hiển thị với mảng rỗng để hiển thị thông báo "Không có thông báo nào!"
        }  
    };

    const displayNotifications = (notifications) => {
        const notificationList = document.getElementById('notification-list');  
        notificationList.innerHTML = ''; // Xóa danh sách thông báo cũ
        const noNotifications = document.getElementById('no-notifications'); // Lấy phần tử noNotifications

        if (notifications.length === 0) {  
            noNotifications.style.display = 'block'; // Hiển thị thông báo nếu không có thông báo
        } else {
            noNotifications.style.display = 'none'; // Ẩn thông báo "Không có thông báo nào!" mặc định
            notifications.forEach(notification => {  
                const listItem = document.createElement('li');  
                listItem.className = 'notification-item';  
                
                // Tạo phần tử title, message và time
                const titleElement = document.createElement('strong');
                titleElement.textContent = notification.NotifyTitle;
                
                const messageElement = document.createElement('p');
                messageElement.textContent = notification.NotifyMessage;

                const timeElement = document.createElement('small'); // Phần tử cho thời gian
                timeElement.textContent = new Date(notification.NotifyCreatedAt).toLocaleString(); 
                timeElement.className = 'notification-time'; // Thêm class để có thể CSS nếu cần
                
                // Thêm title, message và time vào list item
                listItem.appendChild(titleElement);
                listItem.appendChild(messageElement);
                listItem.appendChild(timeElement); // Thêm thời gian
                
                notificationList.prepend(listItem);  
            });  
        }
    };
});
