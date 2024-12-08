const axios = require('axios');

class HistoryController {
    async index(req, res) {
      
      const token =req.cookies.user_info ? JSON.parse(req.cookies.user_info).token : null;
  
      if (!token) {
        return res.status(401).send('Bạn cần đăng nhập để xem lịch sử.');
      }
  
      try {
        const response = await axios.get('http://localhost:3000/api/job/getAllDetailJobs', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        const jobs = response.data?.data || [];
        res.render('History/home', {
          layout: 'main.hbs',
          jobs,
        });
      } catch (error) {
        console.error('Error fetching jobs:', error.message);
        res.status(500).send('Có lỗi xảy ra khi lấy dữ liệu.');
      }
    }
  }
  
  module.exports = new HistoryController();
  
