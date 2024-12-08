const axios = require('axios');
class HomeController {
    async index(req, res) {
        try {
            const token = req.cookies.user_info ? JSON.parse(req.cookies.user_info).token : null;
            const response = await axios.get(`${process.env.DOMAIN}/api/common/getJobStatistics`, {
                headers: {  
                    'Authorization': `Bearer ${token}`,  
                }
            });

            const data = response.data;
            console.log(data);
            res.render('home', {
                layout: 'main.hbs',
                stats: data.stats,
                recentJobs: data.recentJobs,
            });
        } catch (error) {
            console.error('Error fetching job statistics:', error.message);
            res.status(500).send('Có lỗi xảy ra khi lấy dữ liệu.');
        }
    }
}

module.exports= new HomeController();